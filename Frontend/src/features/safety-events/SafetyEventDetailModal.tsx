import { Modal } from '@/components/ui/Modal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { SafetyEventDetailView } from '@/pages/SafetyEventsPage'

export function SafetyEventDetailModal() {
  const { viewEventId, openEventView } = useWorkspace()

  if (!viewEventId) return null

  return (
    <Modal
      open={true}
      title="Safety Event Details"
      onClose={() => openEventView(null)}
      size="xl"
      hideHeader
    >
      <SafetyEventDetailView eventId={viewEventId} onClose={() => openEventView(null)} />
    </Modal>
  )
}
