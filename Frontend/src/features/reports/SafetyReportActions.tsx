import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { UploadReportModal } from '@/features/reports/UploadReportModal'
import { useWorkspace } from '@/hooks/useWorkspace'

export function SafetyReportActions() {
  const { openReportForm } = useWorkspace()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => openReportForm('new')}>Create safety report</Button>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Upload existing report
      </Button>
      <UploadReportModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
