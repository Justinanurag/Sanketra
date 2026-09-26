import { APP_YEAR, currentUser } from '@/constants/session'
import { nextSerial } from '@/lib/format'
import { evaluateSif, suggestControls } from '@/lib/sifRules'
import type {
  Actor,
  AuditEntry,
  Barrier,
  BarrierDraft,
  Claim,
  CctvVideo,
  Exposure,
  ExposureDraft,
  Hazard,
  HazardDraft,
  HumanVerification,
  ReportDraft,
  SafetyEvent,
  SafetyReport,
  WorkspaceData,
} from '@/types/domain'

function audit(
  data: WorkspaceData,
  entry: Omit<AuditEntry, 'id' | 'timestamp' | 'user'> & { timestamp: string; user?: string },
): AuditEntry[] {
  const id = nextSerial('AUD', APP_YEAR, data.audit.map((item) => item.id))
  return [
    {
      id,
      timestamp: entry.timestamp,
      user: entry.user ?? currentUser.name,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      reason: entry.reason,
    },
    ...data.audit,
  ]
}

function matchId(items: { id: string; name: string }[], name: string) {
  const target = name.trim().toLowerCase()
  return items.find((item) => item.name.toLowerCase() === target)?.id ?? null
}

function buildReport(data: WorkspaceData, input: ReportDraft, id: string): SafetyReport {
  const analysis = evaluateSif(input)
  const recommendations = suggestControls(input)
  return {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    occurredAt: new Date(input.occurredAt).toISOString(),
    location: input.location.trim(),
    reporter: currentUser.name,
    reporterRole: currentUser.role,
    hazardId: matchId(data.hazards, input.hazardName),
    hazardName: input.hazardName.trim(),
    energySource: input.energySource.trim(),
    humanExposure: input.humanExposure.trim(),
    barrierId: matchId(data.barriers, input.barrierName),
    barrierName: input.barrierName.trim(),
    barrierStatus: input.barrierStatus,
    consequence: input.consequence.trim(),
    notes: input.notes.trim(),
    reviewStatus: 'needs_review',
    sifPotential: analysis.potential,
    analysis,
    originalAnalysis: structuredClone(analysis),
    recommendations,
    originalRecommendations: [...recommendations],
    evidencePhrases: [],
    extractionConfidence: null,
  }
}

export function applyCreateReport(data: WorkspaceData, input: ReportDraft, now: string, actor: Actor) {
  const report = buildReport(data, input, nextSerial('SIF', APP_YEAR, data.reports.map((item) => item.id)))
  const exposure: Exposure = {
    id: nextSerial('EXP', APP_YEAR, data.exposures.map((item) => item.id)),
    reportId: report.id,
    personRole: 'Person described in the report',
    description: report.humanExposure,
    zone: report.location,
    proximity: 'Reported in the narrative',
    severity: report.sifPotential === 'high' ? 'high' : report.sifPotential === 'low' ? 'low' : 'medium',
    observed: true,
  }
  const notification = {
    id: nextSerial('NTF', APP_YEAR, data.notifications.map((item) => item.id)),
    title: `${report.id} needs review`,
    body: report.title,
    createdAt: now,
    unread: true,
    href: `/reviews/${report.id}`,
  }
  return {
    report,
    data: {
      ...data,
      reports: [report, ...data.reports],
      exposures: [exposure, ...data.exposures],
      notifications: [notification, ...data.notifications],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: 'Created',
        entity: 'Safety report',
        entityId: report.id,
        previousValue: '—',
        newValue: `${report.title}. SIF potential: ${report.sifPotential}. Exposure ${exposure.id} recorded from the narrative.`,
        reason: 'Report submitted from the register.',
      }),
    },
  }
}

const TRACKED: Array<[keyof SafetyReport, string]> = [
  ['title', 'Title'],
  ['description', 'Description'],
  ['type', 'Type'],
  ['location', 'Location'],
  ['hazardName', 'Hazard'],
  ['energySource', 'Energy source'],
  ['humanExposure', 'Human exposure'],
  ['barrierName', 'Barrier'],
  ['barrierStatus', 'Barrier status'],
  ['consequence', 'Consequence'],
  ['sifPotential', 'SIF potential'],
  ['notes', 'Notes'],
]

export function applyUpdateReport(data: WorkspaceData, id: string, input: ReportDraft, now: string, actor: Actor) {
  const current = data.reports.find((report) => report.id === id)
  if (!current) return data
  const analysis = evaluateSif(input)
  const recommendations = suggestControls(input)
  const next: SafetyReport = {
    ...current,
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    occurredAt: new Date(input.occurredAt).toISOString(),
    location: input.location.trim(),
    hazardId: matchId(data.hazards, input.hazardName),
    hazardName: input.hazardName.trim(),
    energySource: input.energySource.trim(),
    humanExposure: input.humanExposure.trim(),
    barrierId: matchId(data.barriers, input.barrierName),
    barrierName: input.barrierName.trim(),
    barrierStatus: input.barrierStatus,
    consequence: input.consequence.trim(),
    notes: input.notes.trim(),
    sifPotential: analysis.potential,
    analysis,
    recommendations,
    reviewStatus: current.reviewStatus === 'approved' || current.reviewStatus === 'rejected' ? current.reviewStatus : 'in_review',
  }
  const changes = TRACKED.filter(([key]) => String(current[key]) !== String(next[key]))
  const previousValue = changes.length
    ? changes.map(([key, label]) => `${label}: ${String(current[key])}`).join('\n')
    : 'No field changes'
  const newValue = changes.length
    ? changes.map(([key, label]) => `${label}: ${String(next[key])}`).join('\n')
    : 'No field changes'

  return {
    ...data,
    reports: data.reports.map((report) => (report.id === id ? next : report)),
    audit: audit(data, {
      timestamp: now,
      user: actor.name,
      action: 'Edited',
      entity: 'Safety report',
      entityId: id,
      previousValue,
      newValue,
      reason: 'Safety officer edited the working record. The original rule result is unchanged.',
    }),
  }
}

export function applyDeleteReport(data: WorkspaceData, id: string, now: string, actor: Actor) {
  const current = data.reports.find((report) => report.id === id)
  if (!current) return data
  const similarities = { ...data.similarities }
  delete similarities[id]
  return {
    ...data,
    reports: data.reports.filter((report) => report.id !== id),
    exposures: data.exposures.filter((exposure) => exposure.reportId !== id),
    claims: data.claims.filter((claim) => claim.reportId !== id),
    events: data.events.filter((event) => event.reportId !== id),
    reviews: data.reviews.filter((review) => review.reportId !== id),
    videos: data.videos.map((video) => (video.reportId === id ? { ...video, reportId: null } : video)),
    similarities,
    audit: audit(data, {
      timestamp: now,
      user: actor.name,
      action: 'Deleted',
      entity: 'Safety report',
      entityId: id,
      previousValue: `${current.title}. Review: ${current.reviewStatus}. SIF potential: ${current.sifPotential}.`,
      newValue: 'Removed from the working register.',
      reason: 'Deleted by the safety officer. This audit entry is retained.',
    }),
  }
}

export function applyAddHazard(data: WorkspaceData, input: HazardDraft, now: string, actor: Actor) {
  const hazard: Hazard = {
    id: nextSerial('HAZ', APP_YEAR, data.hazards.map((item) => item.id)),
    name: input.name.trim(),
    category: input.category.trim(),
    energySource: input.energySource.trim(),
    severity: input.severity,
    recurring: input.recurring,
    archiveCount: input.recurring ? 1 : 0,
    description: input.description.trim(),
    lastSeen: now,
  }
  return {
    hazard,
    data: {
      ...data,
      hazards: [hazard, ...data.hazards],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: 'Created',
        entity: 'Hazard',
        entityId: hazard.id,
        previousValue: '—',
        newValue: `${hazard.name} · ${hazard.severity}`,
        reason: 'Hazard added to the register.',
      }),
    },
  }
}

export function applyAddBarrier(data: WorkspaceData, input: BarrierDraft, now: string, actor: Actor) {
  const barrier: Barrier = {
    id: nextSerial('BAR', APP_YEAR, data.barriers.map((item) => item.id)),
    name: input.name.trim(),
    type: input.type,
    critical: input.critical,
    status: input.status,
    archiveFailures: input.status === 'present' ? 0 : 1,
    protectedHazard: input.protectedHazard.trim(),
    location: input.location.trim(),
    owner: input.owner.trim(),
  }
  return {
    barrier,
    data: {
      ...data,
      barriers: [barrier, ...data.barriers],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: 'Created',
        entity: 'Barrier',
        entityId: barrier.id,
        previousValue: '—',
        newValue: `${barrier.name} · ${barrier.status}`,
        reason: 'Barrier added to the register.',
      }),
    },
  }
}

export function applyAddExposure(data: WorkspaceData, input: ExposureDraft, now: string, actor: Actor) {
  const exposure: Exposure = {
    id: nextSerial('EXP', APP_YEAR, data.exposures.map((item) => item.id)),
    reportId: input.reportId,
    personRole: input.personRole.trim(),
    description: input.description.trim(),
    zone: input.zone.trim(),
    proximity: input.proximity.trim(),
    severity: input.severity,
    observed: input.observed,
  }
  return {
    exposure,
    data: {
      ...data,
      exposures: [exposure, ...data.exposures],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: 'Created',
        entity: 'Exposure',
        entityId: exposure.id,
        previousValue: '—',
        newValue: `${exposure.personRole} · ${exposure.zone}`,
        reason: 'Exposure added to the register.',
      }),
    },
  }
}

export function applyDeleteById(
  data: WorkspaceData,
  collection: 'hazards' | 'barriers' | 'exposures' | 'videos',
  id: string,
  now: string,
  actor: Actor,
) {
  const entityName = { hazards: 'Hazard', barriers: 'Barrier', exposures: 'Exposure', videos: 'CCTV video' }[collection]
  const current = data[collection].find((item) => item.id === id)
  if (!current) return data
  const label = 'name' in current ? current.name : 'filename' in current ? current.filename : id
  const next = {
    ...data,
    [collection]: data[collection].filter((item) => item.id !== id),
  } as WorkspaceData
  if (collection === 'videos') {
    next.detections = data.detections.filter((detection) => detection.videoId !== id)
  }
  next.audit = audit(data, {
    timestamp: now,
    user: actor.name,
    action: 'Deleted',
    entity: entityName,
    entityId: id,
    previousValue: label,
    newValue: 'Removed from the register.',
    reason: 'Deleted by the safety officer.',
  })
  return next
}

export function applyAddVideo(
  data: WorkspaceData,
  input: { filename: string; camera: string; location: string; reportId: string; mediaKind: CctvVideo['mediaKind'] },
  now: string,
  actor: Actor,
) {
  const video: CctvVideo = {
    id: nextSerial('VID', APP_YEAR, data.videos.map((item) => item.id)),
    filename: input.filename,
    camera: input.camera.trim(),
    location: input.location.trim(),
    uploadedAt: now,
    duration: input.mediaKind === 'video' ? 'Pending' : '—',
    status: 'uploaded',
    reportId: input.reportId || null,
    mediaKind: input.mediaKind,
    simulated: false,
    note:
      input.mediaKind === 'document'
        ? 'Stored as supporting evidence. Document parsing is not connected in this frontend build.'
        : 'Stored for review. Object detection has not run, and this file does not change SIF potential.',
  }
  return {
    video,
    data: {
      ...data,
      videos: [video, ...data.videos],
      notifications: [
        {
          id: nextSerial('NTF', APP_YEAR, data.notifications.map((item) => item.id)),
          title: 'Evidence uploaded',
          body: video.filename,
          createdAt: now,
          unread: true,
          href: '/cctv',
        },
        ...data.notifications,
      ],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: 'Uploaded',
        entity: 'CCTV video',
        entityId: video.id,
        previousValue: '—',
        newValue: `${video.filename} · ${video.camera} · ${video.location}`,
        reason: 'Optional visual evidence attached. No safety determination was made.',
      }),
    },
  }
}

export function applyReview(
  data: WorkspaceData,
  input: { reportId: string; decision: 'approved' | 'rejected'; comments: string },
  now: string,
  actor: Actor,
) {
  const report = data.reports.find((item) => item.id === input.reportId)
  if (!report) return { data, event: null as SafetyEvent | null }
  const previous = data.events.find((event) => event.reportId === report.id)
  const evidence = new Set<string>(['Report'])
  if (data.videos.some((video) => video.reportId === report.id)) evidence.add('CCTV')
  if ((data.similarities[report.id] ?? []).length) evidence.add('Historical similarity')
  if (data.claims.some((claim) => claim.reportId === report.id)) evidence.add('Claim verification')

  const event: SafetyEvent = {
    id: previous?.id ?? nextSerial('EVT', APP_YEAR, data.events.map((item) => item.id)),
    reportId: report.id,
    title: report.title,
    sifPotential: report.sifPotential,
    decision: input.decision,
    reviewer: actor.name,
    decidedAt: now,
    hazardName: report.hazardName,
    barrierStatus: report.barrierStatus,
    evidenceSources: [...evidence],
    summary: input.comments.trim(),
  }

  const review = {
    id: nextSerial('REV', APP_YEAR, data.reviews.map((item) => item.id)),
    reportId: report.id,
    reviewer: actor.name,
    role: actor.role,
    decision: input.decision,
    comments: input.comments.trim(),
    submittedAt: now,
  }

  return {
    event,
    data: {
      ...data,
      reports: data.reports.map((item) =>
        item.id === report.id ? { ...item, reviewStatus: input.decision } : item,
      ),
      events: previous
        ? data.events.map((item) => (item.id === previous.id ? event : item))
        : [event, ...data.events],
      reviews: [review, ...data.reviews],
      claims: data.claims.map((claim): Claim =>
        claim.reportId === report.id
          ? { ...claim, humanState: (input.decision === 'approved' ? 'confirmed' : 'overridden') satisfies HumanVerification }
          : claim,
      ),
      notifications: [
        {
          id: nextSerial('NTF', APP_YEAR, data.notifications.map((item) => item.id)),
          title: input.decision === 'approved' ? `${event.id} approved` : `${report.id} rejected`,
          body: report.title,
          createdAt: now,
          unread: true,
          href: `/safety-events/${event.id}`,
        },
        ...data.notifications,
      ],
      audit: audit(data, {
        timestamp: now,
        user: actor.name,
        action: input.decision === 'approved' ? 'Approved' : 'Rejected',
        entity: 'Safety event',
        entityId: event.id,
        previousValue: `Review status: ${report.reviewStatus}. Rule result: ${report.originalAnalysis.potential}.`,
        newValue: `Decision: ${input.decision}. ${input.comments.trim()}`,
        reason: input.comments.trim(),
      }),
    },
  }
}

export function applyReadNotifications(data: WorkspaceData) {
  return { ...data, notifications: data.notifications.map((item) => ({ ...item, unread: false })) }
}
