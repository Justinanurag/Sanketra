import type { BarrierCondition, ReportDraft, SifEvaluation, SifPotential } from '@/types/domain'

const HIGH_ENERGY =
  /forklift|vehicle|mobile equipment|electrical|volt|\bmcc\b|press|hydraulic|machine guard|gravitational|working at height|fall from|crane|suspended|flammable|hot work|chemical|caustic|hydroxide|oxygen|confined/i

const SEVERE = /crush|amputat|fatal|shock|arc|asphyx|ignition|explosion|electrocut|\bfall\b|struck|corrosive|severe/i

export interface SifInput {
  hazardName: string
  energySource: string
  humanExposure: string
  barrierName: string
  barrierStatus: BarrierCondition
  consequence: string
}

export function evaluateSif(input: SifInput): SifEvaluation {
  const incomplete =
    input.barrierStatus === 'unknown' ||
    !input.hazardName.trim() ||
    !input.energySource.trim() ||
    !input.humanExposure.trim() ||
    !input.barrierName.trim() ||
    !input.consequence.trim()

  const highEnergy = HIGH_ENERGY.test(`${input.hazardName} ${input.energySource}`)
  const exposure = input.humanExposure.trim().length >= 8
  const barrierFailed =
    input.barrierStatus === 'absent' ||
    input.barrierStatus === 'ineffective' ||
    input.barrierStatus === 'bypassed'
  const severe = SEVERE.test(input.consequence)

  const criteria = [
    {
      id: 'energy',
      label: 'High-energy hazard',
      met: highEnergy && !incomplete,
      detail: input.energySource.trim() || 'Not stated',
    },
    {
      id: 'exposure',
      label: 'Human exposure',
      met: exposure && !incomplete,
      detail: input.humanExposure.trim() || 'Not stated',
    },
    {
      id: 'barrier',
      label: 'Critical barrier absent, bypassed, or ineffective',
      met: barrierFailed,
      detail: `${input.barrierName.trim() || 'Barrier not named'} · ${input.barrierStatus}`,
    },
    {
      id: 'consequence',
      label: 'Severe plausible consequence',
      met: severe && input.consequence.trim().length >= 8,
      detail: input.consequence.trim() || 'Not stated',
    },
  ]

  let potential: SifPotential = 'low'
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

export function suggestControls(input: Pick<ReportDraft, 'barrierName' | 'barrierStatus' | 'hazardName'>) {
  const barrier = input.barrierName.trim() || 'the critical barrier'
  const hazard = input.hazardName.trim() || 'the hazard'
  const items: string[] = []

  if (input.barrierStatus === 'absent' || input.barrierStatus === 'ineffective' || input.barrierStatus === 'bypassed') {
    items.push(`Restore ${barrier} before the task continues.`)
  } else if (input.barrierStatus === 'present') {
    items.push(`Confirm ${barrier} stays in place for the rest of the task.`)
  } else {
    items.push('Establish the barrier status before this report is classified.')
  }

  items.push(`Verify who can be exposed to ${hazard} and keep people out of the energy path until the barrier is effective.`)
  items.push('A safety officer must approve, edit, or reject this record before it becomes a final safety event.')
  return items
}
