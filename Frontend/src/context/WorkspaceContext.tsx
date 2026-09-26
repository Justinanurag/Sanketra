import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { currentUser } from '@/constants/session'
import {
  applyAddBarrier,
  applyAddExposure,
  applyAddHazard,
  applyAddVideo,
  applyCreateReport,
  applyDeleteById,
  applyDeleteReport,
  applyReadNotifications,
  applyReview,
  applyUpdateReport,
} from '@/lib/mutations'
import { loadWorkspace } from '@/services/api'
import type {
  BarrierDraft,
  CctvVideo,
  ExposureDraft,
  HazardDraft,
  ReportDraft,
  SafetyEvent,
  SafetyReport,
  WorkspaceData,
} from '@/types/domain'

type Status = 'loading' | 'ready' | 'error'

interface WorkspaceContextValue {
  status: Status
  reload: () => void
  data: WorkspaceData | null
  previews: Record<string, string>
  openReportForm: (reportId: string | 'new' | null) => void
  reportFormId: string | 'new' | null
  createReport: (input: ReportDraft) => SafetyReport
  updateReport: (id: string, input: ReportDraft) => void
  deleteReport: (id: string) => void
  addHazard: (input: HazardDraft) => void
  addBarrier: (input: BarrierDraft) => void
  addExposure: (input: ExposureDraft) => void
  deleteRecord: (collection: 'hazards' | 'barriers' | 'exposures' | 'videos', id: string) => void
  addVideo: (file: File, input: { camera: string; location: string; reportId: string }) => CctvVideo
  submitReview: (input: { reportId: string; decision: 'approved' | 'rejected'; comments: string }) => SafetyEvent | null
  markNotificationsRead: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function mediaKind(file: File): CctvVideo['mediaKind'] {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('image/')) return 'image'
  return 'document'
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  const [data, setData] = useState<WorkspaceData | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [reportFormId, setReportFormId] = useState<string | 'new' | null>(null)

  useEffect(() => {
    let active = true
    setStatus('loading')
    loadWorkspace()
      .then((workspace) => {
        if (!active) return
        setData(workspace)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [attempt])

  const createReport = useCallback((input: ReportDraft) => {
    const now = new Date().toISOString()
    let created!: SafetyReport
    setData((current) => {
      if (!current) return current
      const result = applyCreateReport(current, input, now, currentUser)
      created = result.report
      return result.data
    })
    return created
  }, [])

  const updateReport = useCallback((id: string, input: ReportDraft) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyUpdateReport(current, id, input, now, currentUser) : current))
  }, [])

  const deleteReport = useCallback((id: string) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyDeleteReport(current, id, now, currentUser) : current))
  }, [])

  const addHazard = useCallback((input: HazardDraft) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyAddHazard(current, input, now, currentUser).data : current))
  }, [])

  const addBarrier = useCallback((input: BarrierDraft) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyAddBarrier(current, input, now, currentUser).data : current))
  }, [])

  const addExposure = useCallback((input: ExposureDraft) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyAddExposure(current, input, now, currentUser).data : current))
  }, [])

  const deleteRecord = useCallback((collection: 'hazards' | 'barriers' | 'exposures' | 'videos', id: string) => {
    const now = new Date().toISOString()
    setData((current) => (current ? applyDeleteById(current, collection, id, now, currentUser) : current))
    if (collection === 'videos') {
      setPreviews((current) => {
        const url = current[id]
        if (url) URL.revokeObjectURL(url)
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }, [])

  const addVideo = useCallback((file: File, input: { camera: string; location: string; reportId: string }) => {
    const now = new Date().toISOString()
    let created!: CctvVideo
    setData((current) => {
      if (!current) return current
      const result = applyAddVideo(
        current,
        { ...input, filename: file.name, mediaKind: mediaKind(file) },
        now,
        currentUser,
      )
      created = result.video
      return result.data
    })
    if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviews((current) => ({ ...current, [created.id]: url }))
    }
    return created
  }, [])

  const submitReview = useCallback(
    (input: { reportId: string; decision: 'approved' | 'rejected'; comments: string }) => {
      const now = new Date().toISOString()
      let event: SafetyEvent | null = null
      setData((current) => {
        if (!current) return current
        const result = applyReview(current, input, now, currentUser)
        event = result.event
        return result.data
      })
      return event
    },
    [],
  )

  const markNotificationsRead = useCallback(() => {
    setData((current) => (current ? applyReadNotifications(current) : current))
  }, [])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      status,
      reload: () => setAttempt((value) => value + 1),
      data,
      previews,
      openReportForm: setReportFormId,
      reportFormId,
      createReport,
      updateReport,
      deleteReport,
      addHazard,
      addBarrier,
      addExposure,
      deleteRecord,
      addVideo,
      submitReview,
      markNotificationsRead,
    }),
    [
      status,
      data,
      previews,
      reportFormId,
      createReport,
      updateReport,
      deleteReport,
      addHazard,
      addBarrier,
      addExposure,
      deleteRecord,
      addVideo,
      submitReview,
      markNotificationsRead,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return context
}
