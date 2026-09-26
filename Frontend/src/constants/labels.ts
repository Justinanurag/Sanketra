export const statusLabel: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  undetermined: 'Undetermined',
  critical: 'Critical',
  needs_review: 'Needs review',
  in_review: 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  present: 'Present',
  absent: 'Absent',
  ineffective: 'Ineffective',
  bypassed: 'Bypassed',
  unknown: 'Unknown',
  verified: 'Verified',
  partial: 'Partial',
  not_observable: 'Not observable',
  contradicted: 'Contradicted',
  ai_detected: 'AI-detected',
  human_verified: 'Human-verified',
  reported: 'Reported',
  unreviewed: 'Unreviewed',
  confirmed: 'Confirmed',
  overridden: 'Overridden',
  uploaded: 'Uploaded',
  processing: 'Processing',
  complete: 'Complete',
  failed: 'Failed',
  video: 'Video',
  image: 'Image',
  document: 'Document',
}

export function labelOf(value: string) {
  return statusLabel[value] ?? value
}

export const sifLabel: Record<string, string> = {
  high: 'High SIF',
  medium: 'Medium SIF',
  low: 'Low SIF',
  undetermined: 'Undetermined',
}
