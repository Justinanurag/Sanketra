import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { labelOf } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { exposureSchema } from '@/lib/schemas'
import { severities, type ExposureDraft } from '@/types/domain'

const empty: ExposureDraft = {
  reportId: '',
  personRole: '',
  description: '',
  zone: '',
  proximity: '',
  severity: 'medium',
  observed: true,
}

export function ExposureFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, addExposure } = useWorkspace()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExposureDraft>({
    resolver: zodResolver(exposureSchema),
    defaultValues: empty,
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 150))
    addExposure(values)
    toast.success('Exposure added')
    reset(empty)
    onClose()
  })

  return (
    <Modal
      open={open}
      title="Add exposure"
      description="Who was exposed, and how close they were to the energy."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="exposure-form" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Add exposure'}</Button>
        </>
      }
    >
      <form id="exposure-form" className="form-grid" onSubmit={onSubmit} noValidate>
        <Field className="span-2" label="Report" htmlFor="exposure-report" required error={errors.reportId?.message}>
          <Select id="exposure-report" aria-invalid={!!errors.reportId} {...register('reportId')}>
            <option value="">Select a report</option>
            {(data?.reports ?? []).map((report) => (
              <option key={report.id} value={report.id}>{report.id} — {report.title}</option>
            ))}
          </Select>
        </Field>
        <Field label="Role" htmlFor="exposure-role" required error={errors.personRole?.message}>
          <Input id="exposure-role" aria-invalid={!!errors.personRole} placeholder="Area operator" {...register('personRole')} />
        </Field>
        <Field label="Severity" htmlFor="exposure-severity" required error={errors.severity?.message}>
          <Select id="exposure-severity" {...register('severity')}>
            {severities.map((item) => <option key={item} value={item}>{labelOf(item)}</option>)}
          </Select>
        </Field>
        <Field className="span-2" label="Description" htmlFor="exposure-description" required error={errors.description?.message}>
          <Textarea id="exposure-description" aria-invalid={!!errors.description} {...register('description')} />
        </Field>
        <Field label="Zone" htmlFor="exposure-zone" required error={errors.zone?.message}>
          <Input id="exposure-zone" aria-invalid={!!errors.zone} {...register('zone')} />
        </Field>
        <Field label="Proximity" htmlFor="exposure-proximity" required error={errors.proximity?.message}>
          <Input id="exposure-proximity" aria-invalid={!!errors.proximity} {...register('proximity')} />
        </Field>
        <label className="check-row span-2">
          <input type="checkbox" {...register('observed')} />
          Exposure was observed, not only inferred
        </label>
      </form>
    </Modal>
  )
}
