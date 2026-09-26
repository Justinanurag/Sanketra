import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { labelOf } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { barrierSchema } from '@/lib/schemas'
import { barrierConditions, barrierTypes, type BarrierDraft } from '@/types/domain'

const empty: BarrierDraft = {
  name: '',
  type: 'Engineering',
  critical: true,
  status: 'unknown',
  protectedHazard: '',
  location: '',
  owner: '',
}

export function BarrierFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addBarrier } = useWorkspace()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BarrierDraft>({
    resolver: zodResolver(barrierSchema),
    defaultValues: empty,
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 150))
    addBarrier(values)
    toast.success('Barrier added')
    reset(empty)
    onClose()
  })

  return (
    <Modal
      open={open}
      title="Add barrier"
      description="Record the control and its current condition."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="barrier-form" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Add barrier'}</Button>
        </>
      }
    >
      <form id="barrier-form" className="form-grid" onSubmit={onSubmit} noValidate>
        <Field className="span-2" label="Name" htmlFor="barrier-name" required error={errors.name?.message}>
          <Input id="barrier-name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Type" htmlFor="barrier-type" required error={errors.type?.message}>
          <Select id="barrier-type" {...register('type')}>
            {barrierTypes.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Status" htmlFor="barrier-status" required error={errors.status?.message}>
          <Select id="barrier-status" {...register('status')}>
            {barrierConditions.map((item) => <option key={item} value={item}>{labelOf(item)}</option>)}
          </Select>
        </Field>
        <Field className="span-2" label="Hazard addressed" htmlFor="barrier-hazard" required error={errors.protectedHazard?.message}>
          <Input id="barrier-hazard" aria-invalid={!!errors.protectedHazard} {...register('protectedHazard')} />
        </Field>
        <Field label="Location" htmlFor="barrier-location" required error={errors.location?.message}>
          <Input id="barrier-location" aria-invalid={!!errors.location} {...register('location')} />
        </Field>
        <Field label="Owner" htmlFor="barrier-owner" required error={errors.owner?.message}>
          <Input id="barrier-owner" aria-invalid={!!errors.owner} {...register('owner')} />
        </Field>
        <label className="check-row span-2">
          <input type="checkbox" {...register('critical')} />
          Critical barrier
        </label>
      </form>
    </Modal>
  )
}
