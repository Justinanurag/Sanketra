import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ReportFormFields } from '@/features/reports/ReportFormFields'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Modal } from '@/components/ui/Modal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { toDateTimeLocal } from '@/lib/format'
import { reportSchema } from '@/lib/schemas'
import type { ReportDraft } from '@/types/domain'

const emptyDraft: ReportDraft = {
  title: '',
  description: '',
  type: 'Near Miss',
  occurredAt: '',
  location: '',
  hazardName: '',
  energySource: '',
  humanExposure: '',
  barrierName: '',
  barrierStatus: 'unknown',
  consequence: '',
  notes: '',
}

export function CreateReportModal() {
  const { reportFormId, openReportForm, extraction, data, createReport, updateReport, openReportView } = useWorkspace()
  const editing = reportFormId && reportFormId !== 'new' ? data?.reports.find((report) => report.id === reportFormId) : null
  const open = reportFormId !== null
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportDraft>({
    resolver: zodResolver(reportSchema),
    defaultValues: emptyDraft,
    mode: 'onTouched',
  })

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        title: editing.title,
        description: editing.description,
        type: editing.type,
        occurredAt: toDateTimeLocal(editing.occurredAt),
        location: editing.location,
        hazardName: editing.hazardName,
        energySource: editing.energySource,
        humanExposure: editing.humanExposure,
        barrierName: editing.barrierName,
        barrierStatus: editing.barrierStatus,
        consequence: editing.consequence,
        notes: editing.notes,
      })
      return
    }
    reset(extraction?.draft ?? emptyDraft)
  }, [open, editing, extraction, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 180))
      if (editing) {
        updateReport(editing.id, values)
        toast.success('Report updated', { description: editing.id })
        openReportForm(null)
        return
      }
      const report = await createReport(values)
      toast.success('Report created', { description: report.id })
      openReportForm(null)
      openReportView(report.id)
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal
      open={open}
      size="lg"
      title={editing ? `Edit ${editing.id}` : extraction ? 'Review extracted report' : 'Create safety report'}
      description={
        extraction
          ? `Copied from ${extraction.fileName}. Check every highlighted field before saving. SIF potential is still decided by the existing rules after you save.`
          : 'The rule result is decision support. A safety officer still has to review the record.'
      }
      onClose={() => openReportForm(null)}
      footer={
        <>
          <Button variant="secondary" onClick={() => openReportForm(null)}>
            Cancel
          </Button>
          <Button type="submit" form="report-form" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create report'}
          </Button>
        </>
      }
    >
      <form id="report-form" onSubmit={onSubmit} noValidate>
        {extraction && !editing ? (
          <Callout tone="info" title="Review before saving">
            {extraction.missing.length
              ? 'Some required fields were not in the document. Complete those before you save. Nothing is stored until you confirm.'
              : 'The highlighted fields were copied from the document. Nothing is stored until you confirm.'}
          </Callout>
        ) : null}
        <ReportFormFields register={register} errors={errors} filled={extraction && !editing ? extraction.filled : undefined} />
      </form>
    </Modal>
  )
}
