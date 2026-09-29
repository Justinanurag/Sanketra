import { useEffect, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { extractSafetyDocument, toExtractionFill, uploadSafetyDocument } from '@/services/reportExtraction'

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPT = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg'

const steps = ['Uploading document', 'Reading document', 'Extracting text', 'Analyzing safety information', 'Preparing the report form']

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openExtractedReport, openReportForm } = useWorkspace()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (open) return
    setFile(null)
    setStage(null)
    setError('')
  }, [open])

  function choose(next: File | null) {
    setError('')
    if (!next) return
    const extension = next.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'].includes(extension)) {
      setError('Upload a PDF, DOCX, DOC, TXT, PNG, JPG, or JPEG file.')
      return
    }
    if (next.size > MAX_BYTES) {
      setError('The file must be 8 MB or smaller.')
      return
    }
    setFile(next)
  }

  async function extract() {
    if (!file) return
    setError('')
    setStage(0)
    try {
      const documentId = await uploadSafetyDocument(file)
      setStage(1)
      const timer = window.setInterval(() => {
        setStage((current) => (current !== null && current < 3 ? current + 1 : current))
      }, 700)
      try {
        const payload = await extractSafetyDocument(documentId)
        const fill = toExtractionFill(payload)
        setStage(4)
        toast.success(payload.message || 'Review the extracted report')
        onClose()
        openExtractedReport(fill)
      } finally {
        window.clearInterval(timer)
      }
    } catch (cause) {
      setStage(null)
      setError(cause instanceof Error ? cause.message : 'The report could not be read.')
    }
  }

  const busy = stage !== null

  return (
    <Modal
      open={open}
      size="lg"
      title="Upload existing report"
      description="Upload an existing safety incident report. Our AI will extract relevant information and automatically populate the safety report form for your review."
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => { onClose(); openReportForm('new') }}>
            Create manually
          </Button>
          <Button disabled={!file || busy} onClick={() => void extract()}>
            {busy ? 'Extracting…' : 'Extract information'}
          </Button>
        </>
      }
    >
      <div className="stack">
        <label
          className={dragging ? 'dropzone is-active' : 'dropzone'}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            choose(event.dataTransfer.files[0] ?? null)
          }}
        >
          <Upload size={18} />
          <span>Drag a report here, or browse files</span>
          <input
            type="file"
            accept={ACCEPT}
            disabled={busy}
            onChange={(event) => {
              choose(event.target.files?.[0] ?? null)
              event.target.value = ''
            }}
          />
        </label>
        <p className="field-hint">PDF, DOCX, DOC, TXT, PNG, JPG, or JPEG. Maximum 8 MB.</p>
        {file ? (
          <div className="file-row">
            {preview ? <img src={preview} alt="" className="file-preview" /> : <FileText size={18} />}
            <div>
              <strong>{file.name}</strong>
              <span>{formatSize(file.size)} · {file.name.split('.').pop()?.toUpperCase()}</span>
            </div>
            <button type="button" className="icon-button" aria-label="Remove file" disabled={busy} onClick={() => setFile(null)}>
              <X size={16} />
            </button>
          </div>
        ) : null}
        {busy ? (
          <ol className="extract-steps">
            {steps.map((label, index) => (
              <li key={label} className={index < (stage ?? 0) ? 'is-done' : index === stage ? 'is-current' : undefined}>
                {label}
              </li>
            ))}
          </ol>
        ) : null}
        {error ? (
          <p className="field-error" role="alert">
            {error} You can retry, or create the report manually.
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
