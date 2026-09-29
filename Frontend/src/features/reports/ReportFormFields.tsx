import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { AIFieldIndicator } from '@/features/reports/AIFieldIndicator'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { labelOf } from '@/constants/labels'
import { barrierConditions, reportTypes, type ReportDraft } from '@/types/domain'

export function ReportFormFields({
  register,
  errors,
  filled,
}: {
  register: UseFormRegister<ReportDraft>
  errors: FieldErrors<ReportDraft>
  filled?: Partial<Record<keyof ReportDraft, { confidence: number }>>
}) {
  const mark = (name: keyof ReportDraft) => (filled?.[name] ? 'input-extracted' : undefined)
  const source = (name: keyof ReportDraft) => (filled ? <AIFieldIndicator confidence={filled[name]?.confidence ?? 0} /> : null)
  return (
    <>
      <section className="form-section">
        <h3>Report details</h3>
        <p className="section-copy">What was reported, where, and when.</p>
        <div className="form-grid">
          <Field className="span-2" label="Title" htmlFor="report-title" required error={errors.title?.message} indicator={source('title')}>
            <Input id="report-title" className={mark('title')} aria-invalid={!!errors.title} placeholder="Forklift operating near pedestrian walkway" {...register('title')} />
          </Field>
          <Field label="Report type" htmlFor="report-type" required error={errors.type?.message} indicator={source('type')}>
            <Select id="report-type" className={mark('type')} aria-invalid={!!errors.type} {...register('type')}>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date and time" htmlFor="report-when" required error={errors.occurredAt?.message} indicator={source('occurredAt')}>
            <Input id="report-when" className={mark('occurredAt')} type="datetime-local" aria-invalid={!!errors.occurredAt} {...register('occurredAt')} />
          </Field>
          <Field className="span-2" label="Location" htmlFor="report-location" required error={errors.location?.message} indicator={source('location')}>
            <Input id="report-location" className={mark('location')} aria-invalid={!!errors.location} placeholder="North loading bay, Warehouse 02" {...register('location')} />
          </Field>
          <Field className="span-2" label="Description" htmlFor="report-description" required error={errors.description?.message} indicator={source('description')}>
            <Textarea id="report-description" className={mark('description')} aria-invalid={!!errors.description} rows={5} placeholder="Describe the act or condition, who was there, and what was observed." {...register('description')} />
          </Field>
        </div>
      </section>
      <section className="form-section">
        <h3>Hazard and exposure</h3>
        <p className="section-copy">Name the energy and who could be harmed. This is not a probability.</p>
        <div className="form-grid">
          <Field label="Hazard" htmlFor="report-hazard" required error={errors.hazardName?.message} indicator={source('hazardName')}>
            <Input id="report-hazard" className={mark('hazardName')} aria-invalid={!!errors.hazardName} placeholder="Worker–vehicle interaction" {...register('hazardName')} />
          </Field>
          <Field label="Energy source" htmlFor="report-energy" required error={errors.energySource?.message} indicator={source('energySource')}>
            <Input id="report-energy" className={mark('energySource')} aria-invalid={!!errors.energySource} placeholder="Mobile equipment / vehicle movement" {...register('energySource')} />
          </Field>
          <Field className="span-2" label="Human exposure" htmlFor="report-exposure" required error={errors.humanExposure?.message} indicator={source('humanExposure')}>
            <Textarea id="report-exposure" className={mark('humanExposure')} aria-invalid={!!errors.humanExposure} rows={3} placeholder="Who was exposed, and how close were they to the energy?" {...register('humanExposure')} />
          </Field>
        </div>
      </section>
      <section className="form-section">
        <h3>Barrier and consequence</h3>
        <p className="section-copy">The critical control and the plausible outcome if it fails.</p>
        <div className="form-grid">
          <Field label="Critical barrier" htmlFor="report-barrier" required error={errors.barrierName?.message} indicator={source('barrierName')}>
            <Input id="report-barrier" className={mark('barrierName')} aria-invalid={!!errors.barrierName} placeholder="Pedestrian segregation" {...register('barrierName')} />
          </Field>
          <Field label="Barrier status" htmlFor="report-barrier-status" required error={errors.barrierStatus?.message} indicator={source('barrierStatus')}>
            <Select id="report-barrier-status" className={mark('barrierStatus')} aria-invalid={!!errors.barrierStatus} {...register('barrierStatus')}>
              {barrierConditions.map((status) => (
                <option key={status} value={status}>
                  {labelOf(status)}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="span-2" label="Potential consequence" htmlFor="report-consequence" required error={errors.consequence?.message} indicator={source('consequence')}>
            <Input id="report-consequence" className={mark('consequence')} aria-invalid={!!errors.consequence} placeholder="Collision or crush injury" {...register('consequence')} />
          </Field>
          <Field className="span-2" label="Additional notes" htmlFor="report-notes" error={errors.notes?.message} indicator={filled?.notes ? <AIFieldIndicator confidence={filled.notes.confidence} /> : null}>
            <Textarea id="report-notes" className={mark('notes')} rows={3} {...register('notes')} />
          </Field>
        </div>
      </section>
    </>
  )
}
