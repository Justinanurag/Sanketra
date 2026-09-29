const barrierStatuses = ['present', 'absent', 'ineffective', 'bypassed', 'unknown'] as const
type BarrierStatus = (typeof barrierStatuses)[number]

const HIGH_ENERGY =
  /forklift|vehicle|mobile equipment|electrical|volt|\bmcc\b|press|hydraulic|machine guard|gravitational|working at height|fall from|crane|suspended|flammable|hot work|chemical|caustic|hydroxide|oxygen|confined/i
const SEVERE = /crush|amputat|fatal|shock|arc|asphyx|ignition|explosion|electrocut|\bfall\b|struck|corrosive|severe/i

export class AnalysisConfigError extends Error {}

export interface ReportRecord {
  id: string | number
  title: string
  description: string
  report_type: string
  site_location: string | null
  hazard_name: string | null
  energy_source: string | null
  human_exposure: string | null
  barrier_name: string | null
  barrier_status: string | null
  consequence: string | null
  notes: string | null
}

export interface ReportAnalysis {
  report_id: string
  hazard_name: string | null
  energy_source: string | null
  human_exposure: string | null
  barrier_name: string | null
  barrier_status: BarrierStatus | null
  consequence: string | null
  evidence_phrases: string[]
  extraction_confidence: number
  sif_potential: 'high' | 'medium' | 'low' | 'undetermined'
  analysis: {
    potential: 'high' | 'medium' | 'low' | 'undetermined'
    rationale: string
    criteria: Array<{ id: string; label: string; met: boolean; detail: string }>
  }
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function appearsIn(source: string, value: string) {
  const needle = normalize(value)
  if (needle.length < 2) return false
  return normalize(source).includes(needle)
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function barrierStatus(value: unknown, source: string): BarrierStatus | null {
  const raw = text(value)
  if (!raw || !appearsIn(source, raw)) return null
  const lower = raw.toLowerCase()
  return barrierStatuses.find((status) => lower.includes(status)) ?? null
}

function grounded(source: string, value: unknown) {
  const raw = text(value)
  if (!raw || !appearsIn(source, raw)) return null
  return raw
}

function prefer(existing: string | null | undefined, extracted: string | null) {
  const current = existing?.trim()
  return current || extracted
}

export function classifySafetyReport(input: {
  hazardName?: string | null
  energySource?: string | null
  humanExposure?: string | null
  barrierName?: string | null
  barrierStatus?: string | null
  consequence?: string | null
}) {
  const status = barrierStatuses.find((item) => item === input.barrierStatus) ?? 'unknown'
  return evaluate({
    hazardName: input.hazardName?.trim() ?? '',
    energySource: input.energySource?.trim() ?? '',
    humanExposure: input.humanExposure?.trim() ?? '',
    barrierName: input.barrierName?.trim() ?? '',
    barrierStatus: status,
    consequence: input.consequence?.trim() ?? '',
  })
}

function evaluate(input: {
  hazardName: string
  energySource: string
  humanExposure: string
  barrierName: string
  barrierStatus: BarrierStatus | 'unknown'
  consequence: string
}) {
  const incomplete =
    input.barrierStatus === 'unknown' ||
    !input.hazardName ||
    !input.energySource ||
    !input.humanExposure ||
    !input.barrierName ||
    !input.consequence
  const highEnergy = HIGH_ENERGY.test(`${input.hazardName} ${input.energySource}`)
  const exposure = input.humanExposure.length >= 8
  const barrierFailed =
    input.barrierStatus === 'absent' || input.barrierStatus === 'ineffective' || input.barrierStatus === 'bypassed'
  const severe = SEVERE.test(input.consequence) && input.consequence.length >= 8
  const criteria = [
    { id: 'energy', label: 'High-energy hazard', met: highEnergy && !incomplete, detail: input.energySource || 'Not stated' },
    { id: 'exposure', label: 'Human exposure', met: exposure && !incomplete, detail: input.humanExposure || 'Not stated' },
    {
      id: 'barrier',
      label: 'Critical barrier absent, bypassed, or ineffective',
      met: barrierFailed,
      detail: `${input.barrierName || 'Barrier not named'} · ${input.barrierStatus}`,
    },
    { id: 'consequence', label: 'Severe plausible consequence', met: severe, detail: input.consequence || 'Not stated' },
  ]
  let potential: ReportAnalysis['sif_potential'] = 'low'
  let rationale =
    'The stated conditions do not meet the high-potential rule. Human review is still required before any safety event is confirmed.'
  if (incomplete) {
    potential = 'undetermined'
    rationale =
      'The record is incomplete or the barrier status is unknown, so the rule engine will not classify SIF potential. It is routed to human review.'
  } else if (criteria.every((criterion) => criterion.met)) {
    potential = 'high'
    rationale =
      'High-energy hazard, human exposure, a failed critical barrier, and a severe plausible consequence are all present. This is a rule result for review, not an accident probability.'
  } else if (exposure && barrierFailed) {
    potential = 'medium'
    rationale =
      'Human exposure coincides with a failed barrier, but the full high-potential rule is not met. A safety officer needs to judge the energy and the consequence.'
  }
  return { potential, rationale, criteria }
}

async function extractFacts(source: string) {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) throw new AnalysisConfigError('GEMINI_API_KEY is not configured')
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: [
                  'Extract only facts written in this safety report.',
                  'Copy wording from the report. Do not invent hazard, energy, exposure, barrier, consequence, or evidence.',
                  'Use null when a fact is not stated.',
                  'barrier_status must be present, absent, ineffective, bypassed, unknown, or null.',
                  'Do not assign SIF potential or severity.',
                  'Return JSON with keys hazard_name, energy_source, human_exposure, barrier_name, barrier_status, consequence, evidence_phrases.',
                  source.slice(0, 14000),
                ].join('\n'),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json',
        },
      }),
    },
  )
  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`)
  }
  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const raw = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
  const json = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

export async function analyzeReportWithGemini(report: ReportRecord): Promise<ReportAnalysis> {
  const source = [
    report.title,
    report.description,
    report.site_location,
    report.hazard_name,
    report.energy_source,
    report.human_exposure,
    report.barrier_name,
    report.barrier_status,
    report.consequence,
    report.notes,
  ]
    .filter(Boolean)
    .join('\n')

  const extracted = await extractFacts(source)
  const phrases = Array.isArray(extracted.evidence_phrases)
    ? extracted.evidence_phrases.map((item) => text(item)).filter((item): item is string => !!item && appearsIn(source, item)).slice(0, 8)
    : []
  const hazardName = prefer(report.hazard_name, grounded(source, extracted.hazard_name))
  const energySource = prefer(report.energy_source, grounded(source, extracted.energy_source))
  const humanExposure = prefer(report.human_exposure, grounded(source, extracted.human_exposure))
  const barrierName = prefer(report.barrier_name, grounded(source, extracted.barrier_name))
  const status = prefer(report.barrier_status, barrierStatus(extracted.barrier_status, source))
  const knownStatus = barrierStatuses.find((item) => item === status?.toLowerCase()) ?? null
  const consequence = prefer(report.consequence, grounded(source, extracted.consequence))
  const filled = [hazardName, energySource, humanExposure, barrierName, knownStatus, consequence].filter(Boolean).length
  const analysis = evaluate({
    hazardName: hazardName || '',
    energySource: energySource || '',
    humanExposure: humanExposure || '',
    barrierName: barrierName || '',
    barrierStatus: knownStatus || 'unknown',
    consequence: consequence || '',
  })

  return {
    report_id: String(report.id),
    hazard_name: hazardName,
    energy_source: energySource,
    human_exposure: humanExposure,
    barrier_name: barrierName,
    barrier_status: knownStatus,
    consequence,
    evidence_phrases: phrases,
    extraction_confidence: filled === 0 ? 0 : filled >= 6 ? 0.9 : 0.7,
    sif_potential: analysis.potential,
    analysis,
  }
}
