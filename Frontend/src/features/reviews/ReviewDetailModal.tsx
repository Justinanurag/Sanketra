import { Modal } from '@/components/ui/Modal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { ReviewDetailView } from '@/pages/ReviewsPage'

export function ReviewDetailModal() {
  const { viewReviewId, openReviewView } = useWorkspace()

  if (!viewReviewId) return null

  return (
    <Modal
      open={true}
      title="Review Details"
      onClose={() => openReviewView(null)}
      size="xl"
      hideHeader
    >
      <ReviewDetailView reportId={viewReviewId} onClose={() => openReviewView(null)} />
    </Modal>
  )
}
