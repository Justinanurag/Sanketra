import { z } from 'zod'
import {
  barrierConditions,
  barrierTypes,
  reportTypes,
  severities,
  type BarrierDraft,
  type ExposureDraft,
  type HazardDraft,
  type ReportDraft,
} from '@/types/domain'

export const reportSchema = z.object({
  title: z.string().trim().min(8, 'Enter a specific title of at least 8 characters.'),
  description: z
    .string()
    .trim()
    .min(30, 'Describe the act or condition, who was involved, and what was observed.'),
  type: z.enum(reportTypes, { message: 'Select a report type.' }),
  occurredAt: z.string().min(1, 'Date and time are required.'),
  location: z.string().trim().min(3, 'Location is required.'),
  hazardName: z.string().trim().min(3, 'Name the hazard.'),
  energySource: z.string().trim().min(3, 'Name the energy source.'),
  humanExposure: z.string().trim().min(8, 'Describe who was exposed and how.'),
  barrierName: z.string().trim().min(3, 'Name the critical barrier.'),
  barrierStatus: z.enum(barrierConditions, { message: 'Select the barrier status.' }),
  consequence: z.string().trim().min(8, 'Describe the plausible consequence.'),
  notes: z.string(),
}) satisfies z.ZodType<ReportDraft>

export const hazardSchema = z.object({
  name: z.string().trim().min(3, 'Name the hazard.'),
  category: z.string().trim().min(3, 'Enter a category.'),
  energySource: z.string().trim().min(3, 'Name the energy source.'),
  severity: z.enum(severities, { message: 'Select a severity.' }),
  recurring: z.boolean(),
  description: z.string().trim().min(12, 'Describe how this hazard shows up on site.'),
}) satisfies z.ZodType<HazardDraft>

export const barrierSchema = z.object({
  name: z.string().trim().min(3, 'Name the barrier.'),
  type: z.enum(barrierTypes, { message: 'Select a barrier type.' }),
  critical: z.boolean(),
  status: z.enum(barrierConditions, { message: 'Select the current status.' }),
  protectedHazard: z.string().trim().min(3, 'Name the hazard this barrier addresses.'),
  location: z.string().trim().min(3, 'Location is required.'),
  owner: z.string().trim().min(3, 'Name the owner of this barrier.'),
}) satisfies z.ZodType<BarrierDraft>

export const exposureSchema = z.object({
  reportId: z.string().min(1, 'Link this exposure to a report.'),
  personRole: z.string().trim().min(3, 'Name the role of the exposed person.'),
  description: z.string().trim().min(8, 'Describe the exposure.'),
  zone: z.string().trim().min(3, 'Name the zone.'),
  proximity: z.string().trim().min(3, 'Describe proximity to the energy.'),
  severity: z.enum(severities, { message: 'Select a severity.' }),
  observed: z.boolean(),
}) satisfies z.ZodType<ExposureDraft>

export const cctvSchema = z.object({
  camera: z.string().trim().min(2, 'Enter the camera or source name.'),
  location: z.string().trim().min(3, 'Location is required.'),
  reportId: z.string(),
})

export const reviewSchema = z.object({
  comments: z.string().trim().min(12, 'Record the basis for this decision.'),
})
