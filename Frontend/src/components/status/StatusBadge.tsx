import { labelOf, sifLabel } from '@/constants/labels'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type {
  BarrierCondition,
  EvidenceOrigin,
  HumanVerification,
  ReviewStatus,
  Severity,
  SifPotential,
  VerificationState,
  VideoStatus,
} from '@/types/domain'

type StatusProps =
  | { domain: 'sif'; value: SifPotential }
  | { domain: 'severity'; value: Severity }
  | { domain: 'review'; value: ReviewStatus }
  | { domain: 'barrier'; value: BarrierCondition }
  | { domain: 'verification'; value: VerificationState }
  | { domain: 'origin'; value: EvidenceOrigin }
  | { domain: 'human'; value: HumanVerification }
  | { domain: 'video'; value: VideoStatus }

const toneMap: Record<string, BadgeTone> = {
  'sif:high': 'critical',
  'sif:medium': 'medium',
  'sif:low': 'low',
  'sif:undetermined': 'neutral',
  'severity:critical': 'critical',
  'severity:high': 'high',
  'severity:medium': 'medium',
  'severity:low': 'low',
  'review:needs_review': 'high',
  'review:in_review': 'info',
  'review:approved': 'low',
  'review:rejected': 'critical',
  'barrier:present': 'low',
  'barrier:absent': 'critical',
  'barrier:ineffective': 'high',
  'barrier:bypassed': 'medium',
  'barrier:unknown': 'neutral',
  'verification:verified': 'low',
  'verification:partial': 'medium',
  'verification:not_observable': 'neutral',
  'verification:contradicted': 'critical',
  'verification:pending': 'neutral',
  'origin:ai_detected': 'info',
  'origin:human_verified': 'low',
  'origin:reported': 'neutral',
  'human:unreviewed': 'neutral',
  'human:confirmed': 'low',
  'human:overridden': 'high',
  'video:uploaded': 'neutral',
  'video:processing': 'info',
  'video:complete': 'low',
  'video:failed': 'critical',
}

export function StatusBadge(props: StatusProps) {
  const tone = toneMap[`${props.domain}:${props.value}`] ?? 'neutral'
  const label = props.domain === 'sif' ? sifLabel[props.value] : labelOf(props.value)
  return <Badge tone={tone}>{label}</Badge>
}
