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
import { hazardSchema } from '@/lib/schemas'
import { severities, type HazardDraft } from '@/types/domain'

const empty: HazardDraft = {
  name: '',
  category: '',
  energySource: '',
  severity: 'medium',
  recurring: false,
  description: '',
}

export function HazardFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addHazard } = useWorkspace()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HazardDraft>({
    resolver: zodResolver(hazardSchema),
    defaultValues: empty,
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 150))
    addHazard(values)
    toast.success('Hazard added')
    reset(empty)
    onClose()
  })

  return (
    <Modal
      open={open}
      title="Add hazard"
      description="Add a hazard to the register. This does not classify a report."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="hazard-form" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Add hazard'}</Button>
        </>
      }
    >
      <form id="hazard-form" className="form-grid" onSubmit={onSubmit} noValidate>
        <Field className="span-2" label="Name" htmlFor="hazard-name" required error={errors.name?.message}>
          <Input id="hazard-name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Category" htmlFor="hazard-category" required error={errors.category?.message}>
          <Input id="hazard-category" aria-invalid={!!errors.category} {...register('category')} />
        </Field>
        <Field label="Energy source" htmlFor="hazard-energy" required error={errors.energySource?.message}>
          <Input id="hazard-energy" aria-invalid={!!errors.energySource} {...register('energySource')} />
        </Field>
        <Field label="Severity" htmlFor="hazard-severity" required error={errors.severity?.message}>
          <Select id="hazard-severity" aria-invalid={!!errors.severity} {...register('severity')}>
            {severities.map((item) => <option key={item} value={item}>{labelOf(item)}</option>)}
          </Select>
        </Field>
        <Field label="Description" className="span-2" htmlFor="hazard-description" required error={errors.description?.message}>
          <Textarea id="hazard-description" aria-invalid={!!errors.description} {...register('description')} />
        </Field>
        <label className="check-row span-2">
          <input type="checkbox" {...register('recurring')} />
          Seen repeatedly in the archive
        </label>
      </form>
    </Modal>
  )
}
