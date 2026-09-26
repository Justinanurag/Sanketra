import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useWorkspace } from '@/hooks/useWorkspace'
import { formatFileSize } from '@/lib/format'
import { cctvSchema } from '@/lib/schemas'

const accept = 'video/*,image/*,.pdf,.doc,.docx,.txt,.csv'

export function UploadCctvModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, addVideo } = useWorkspace()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ camera: string; location: string; reportId: string }>({
    resolver: zodResolver(cctvSchema),
    defaultValues: { camera: '', location: '', reportId: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!file) {
      setFileError('Choose a video, image, or document.')
      return
    }
    await new Promise((resolve) => window.setTimeout(resolve, 180))
    const video = addVideo(file, values)
    toast.success('Evidence uploaded', { description: video.id })
    setFile(null)
    reset()
    onClose()
  })

  return (
    <Modal
      open={open}
      title="Upload CCTV evidence"
      description="Optional. A file does not assign SIF severity, and object detection is not run in this screen."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="cctv-form" disabled={isSubmitting}>{isSubmitting ? 'Uploading…' : 'Upload evidence'}</Button>
        </>
      }
    >
      <form id="cctv-form" className="stack" onSubmit={onSubmit} noValidate>
        <Field label="File" required error={fileError}>
          <Input
            type="file"
            accept={accept}
            aria-invalid={!!fileError}
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null
              setFile(next)
              setFileError('')
            }}
          />
          <p className="field-hint">{file ? `${file.name} · ${formatFileSize(file.size)}` : 'Video, image, or a supporting document.'}</p>
        </Field>
        <div className="form-grid">
          <Field label="Camera" htmlFor="cctv-camera" required error={errors.camera?.message}>
            <Input id="cctv-camera" placeholder="CAM-04" aria-invalid={!!errors.camera} {...register('camera')} />
          </Field>
          <Field label="Location" htmlFor="cctv-location" required error={errors.location?.message}>
            <Input id="cctv-location" placeholder="North loading bay" aria-invalid={!!errors.location} {...register('location')} />
          </Field>
          <Field className="span-2" label="Linked report" htmlFor="cctv-report" hint="Optional. Leave blank if the clip is not tied to a report yet.">
            <Select id="cctv-report" {...register('reportId')}>
              <option value="">No report</option>
              {(data?.reports ?? []).map((report) => (
                <option key={report.id} value={report.id}>{report.id} — {report.title}</option>
              ))}
            </Select>
          </Field>
        </div>
      </form>
    </Modal>
  )
}
