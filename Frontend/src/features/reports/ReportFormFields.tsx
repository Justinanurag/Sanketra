import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { labelOf } from '@/constants/labels'
import { barrierConditions, reportTypes, type ReportDraft } from '@/types/domain'

export function ReportFormFields({
  register,
  errors,
}: {
  register: UseFormRegister<ReportDraft>
  errors: FieldErrors<ReportDraft>
}) {
  return (
    <>
      <section className="form-section">
        <h3>Report details</h3>
        <p className="section-copy">What was reported, where, and when.</p>
        <div className="form-grid">
          <Field className="span-2" label="Title" htmlFor="report-title" required error={errors.title?.message}>
            <Input id="report-title" aria-invalid={!!errors.title} placeholder="Forklift operating near pedestrian walkway" {...register('title')} />
          </Field>
          <Field label="Report type" htmlFor="report-type" required error={errors.type?.message}>
            <Select id="report-type" aria-invalid={!!errors.type} {...register('type')}>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date and time" htmlFor="report-when" required error={errors.occurredAt?.message}>
            <Input id="report-when" type="datetime-local" aria-invalid={!!errors.occurredAt} {...register('occurredAt')} />
          </Field>
          <Field className="span-2" label="Location" htmlFor="report-location" required error={errors.location?.message}>
            <Input id="report-location" aria-invalid={!!errors.location} placeholder="North loading bay, Warehouse 02" {...register('location')} />
          </Field>
          <Field className="span-2" label="Description" htmlFor="report-description" required error={errors.description?.message}>
            <Textarea id="report-description" aria-invalid={!!errors.description} rows={5} placeholder="Describe the act or condition, who was there, and what was observed." {...register('description')} />
          </Field>
        </div>
      </section>
      <section className="form-section">
        <h3>Hazard and exposure</h3>
        <p className="section-copy">Name the energy and who could be harmed. This is not a probability.</p>
        <div className="form-grid">
          <Field label="Hazard" htmlFor="report-hazard" required error={errors.hazardName?.message}>
            <Input id="report-hazard" aria-invalid={!!errors.hazardName} placeholder="Worker–vehicle interaction" {...register('hazardName')} />
          </Field>
          <Field label="Energy source" htmlFor="report-energy" required error={errors.energySource?.message}>
            <Input id="report-energy" aria-invalid={!!errors.energySource} placeholder="Mobile equipment / vehicle movement" {...register('energySource')} />
          </Field>
          <Field className="span-2" label="Human exposure" htmlFor="report-exposure" required error={errors.humanExposure?.message}>
            <Textarea id="report-exposure" aria-invalid={!!errors.humanExposure} rows={3} placeholder="Who was exposed, and how close were they to the energy?" {...register('humanExposure')} />
          </Field>
        </div>
      </section>
      <section className="form-section">
        <h3>Barrier and consequence</h3>
        <p className="section-copy">The critical control and the plausible outcome if it fails.</p>
        <div className="form-grid">
          <Field label="Critical barrier" htmlFor="report-barrier" required error={errors.barrierName?.message}>
            <Input id="report-barrier" aria-invalid={!!errors.barrierName} placeholder="Pedestrian segregation" {...register('barrierName')} />
          </Field>
          <Field label="Barrier status" htmlFor="report-barrier-status" required error={errors.barrierStatus?.message}>
            <Select id="report-barrier-status" aria-invalid={!!errors.barrierStatus} {...register('barrierStatus')}>
              {barrierConditions.map((status) => (
                <option key={status} value={status}>
                  {labelOf(status)}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="span-2" label="Potential consequence" htmlFor="report-consequence" required error={errors.consequence?.message}>
            <Input id="report-consequence" aria-invalid={!!errors.consequence} placeholder="Collision or crush injury" {...register('consequence')} />
          </Field>
          <Field className="span-2" label="Additional notes" htmlFor="report-notes" error={errors.notes?.message}>
            <Textarea id="report-notes" rows={3} {...register('notes')} />
          </Field>
        </div>
      </section>
    </>
  )
}
