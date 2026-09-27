import { Modal } from '@/components/ui/Modal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { ReportDetailView } from '@/pages/ReportDetailPage'

export function ReportDetailModal() {
  const { viewReportId, openReportView } = useWorkspace()

  if (!viewReportId) return null

  return (
    <Modal
      open={true}
      title="Report Details"
      onClose={() => openReportView(null)}
      size="xl"
      hideHeader
    >
      <ReportDetailView reportId={viewReportId} onClose={() => openReportView(null)} />
    </Modal>
  )
}
