export const reportTypes = ['Near Miss', 'Unsafe Act', 'Unsafe Condition'] as const
export type ReportType = (typeof reportTypes)[number]

export const barrierConditions = ['present', 'absent', 'ineffective', 'bypassed', 'unknown'] as const
export type BarrierCondition = (typeof barrierConditions)[number]

export const barrierTypes = ['Engineering', 'Administrative', 'PPE'] as const
export type BarrierType = (typeof barrierTypes)[number]

export const severities = ['critical', 'high', 'medium', 'low'] as const
export type Severity = (typeof severities)[number]

export const sifPotentials = ['high', 'medium', 'low', 'undetermined'] as const
export type SifPotential = (typeof sifPotentials)[number]

export const reviewStatuses = ['needs_review', 'in_review', 'approved', 'rejected'] as const
export type ReviewStatus = (typeof reviewStatuses)[number]

export const verificationStates = ['verified', 'partial', 'not_observable', 'contradicted', 'pending'] as const
export type VerificationState = (typeof verificationStates)[number]

export const evidenceOrigins = ['ai_detected', 'human_verified', 'reported'] as const
export type EvidenceOrigin = (typeof evidenceOrigins)[number]

export const humanVerifications = ['unreviewed', 'confirmed', 'overridden'] as const
export type HumanVerification = (typeof humanVerifications)[number]

export const videoStatuses = ['uploaded', 'processing', 'complete', 'failed'] as const
export type VideoStatus = (typeof videoStatuses)[number]

export const mediaKinds = ['video', 'image', 'document'] as const
export type MediaKind = (typeof mediaKinds)[number]

export interface RuleCriterion {
  id: string
  label: string
  met: boolean
  detail: string
}

export interface SifEvaluation {
  potential: SifPotential
  rationale: string
  criteria: RuleCriterion[]
}

export interface SafetyReport {
  id: string
  title: string
  description: string
  type: ReportType
  occurredAt: string
  location: string
  reporter: string
  reporterRole: string
  hazardId: string | null
  hazardName: string
  energySource: string
  humanExposure: string
  barrierId: string | null
  barrierName: string
  barrierStatus: BarrierCondition
  consequence: string
  notes: string
  reviewStatus: ReviewStatus
  sifPotential: SifPotential
  analysis: SifEvaluation
  originalAnalysis: SifEvaluation
  recommendations: string[]
  originalRecommendations: string[]
  evidencePhrases: string[]
  extractionConfidence: number | null
}

export interface ReportDraft {
  title: string
  description: string
  type: ReportType
  occurredAt: string
  location: string
  hazardName: string
  energySource: string
  humanExposure: string
  barrierName: string
  barrierStatus: BarrierCondition
  consequence: string
  notes: string
}

export interface Hazard {
  id: string
  name: string
  category: string
  energySource: string
  severity: Severity
  recurring: boolean
  archiveCount: number
  description: string
  lastSeen: string
}

export interface HazardDraft {
  name: string
  category: string
  energySource: string
  severity: Severity
  recurring: boolean
  description: string
}

export interface Barrier {
  id: string
  name: string
  type: BarrierType
  critical: boolean
  status: BarrierCondition
  archiveFailures: number
  protectedHazard: string
  location: string
  owner: string
}

export interface BarrierDraft {
  name: string
  type: BarrierType
  critical: boolean
  status: BarrierCondition
  protectedHazard: string
  location: string
  owner: string
}

export interface Exposure {
  id: string
  reportId: string
  personRole: string
  description: string
  zone: string
  proximity: string
  severity: Severity
  observed: boolean
}

export interface ExposureDraft {
  reportId: string
  personRole: string
  description: string
  zone: string
  proximity: string
  severity: Severity
  observed: boolean
}

export interface SafetyEvent {
  id: string
  reportId: string
  title: string
  sifPotential: SifPotential
  decision: 'approved' | 'rejected'
  reviewer: string
  decidedAt: string
  hazardName: string
  barrierStatus: BarrierCondition
  evidenceSources: string[]
  summary: string
}

export interface SimilarReport {
  id: string
  title: string
  similarity: number
  occurredAt: string
  hazard: string
  barrierStatus: BarrierCondition
  outcome: string
  note: string
}

export interface Claim {
  id: string
  reportId: string
  claim: string
  nlpEvidence: string
  historicalEvidence: string
  cctvEvidence: string
  verification: VerificationState
  confidence: number | null
  humanState: HumanVerification
  note: string
}

export interface CctvVideo {
  id: string
  filename: string
  camera: string
  location: string
  uploadedAt: string
  duration: string
  status: VideoStatus
  reportId: string | null
  mediaKind: MediaKind
  simulated: boolean
  note: string
}

export interface CctvEvent {
  id: string
  videoId: string
  object: string
  eventType: string
  confidence: number | null
  dwellSeconds: number | null
  zone: string
  timestamp: string
  origin: EvidenceOrigin
  simulated: boolean
  note: string
}

export interface ReviewRecord {
  id: string
  reportId: string
  reviewer: string
  role: string
  decision: 'approved' | 'rejected'
  comments: string
  submittedAt: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  entity: string
  entityId: string
  previousValue: string
  newValue: string
  reason: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  createdAt: string
  unread: boolean
  href: string
}

export interface MonthlyPoint {
  month: string
  reports: number
  high: number
}

export interface WorkspaceData {
  reports: SafetyReport[]
  hazards: Hazard[]
  barriers: Barrier[]
  exposures: Exposure[]
  events: SafetyEvent[]
  claims: Claim[]
  videos: CctvVideo[]
  detections: CctvEvent[]
  reviews: ReviewRecord[]
  audit: AuditEntry[]
  notifications: AppNotification[]
  similarities: Record<string, SimilarReport[]>
}

export interface Actor {
  name: string
  role: string
}
