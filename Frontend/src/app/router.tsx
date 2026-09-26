import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { WorkspaceProvider } from '@/context/WorkspaceContext'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const ReportDetailPage = lazy(() => import('@/pages/ReportDetailPage').then((module) => ({ default: module.ReportDetailPage })))
const SafetyEventsPage = lazy(() => import('@/pages/SafetyEventsPage').then((module) => ({ default: module.SafetyEventsPage })))
const SafetyEventDetailPage = lazy(() => import('@/pages/SafetyEventsPage').then((module) => ({ default: module.SafetyEventDetailPage })))
const HazardsPage = lazy(() => import('@/pages/HazardsPage').then((module) => ({ default: module.HazardsPage })))
const BarriersPage = lazy(() => import('@/pages/BarriersPage').then((module) => ({ default: module.BarriersPage })))
const ExposuresPage = lazy(() => import('@/pages/ExposuresPage').then((module) => ({ default: module.ExposuresPage })))
const HistoricalPage = lazy(() => import('@/pages/HistoricalPage').then((module) => ({ default: module.HistoricalPage })))
const CctvPage = lazy(() => import('@/pages/CctvPage').then((module) => ({ default: module.CctvPage })))
const CorrelationPage = lazy(() => import('@/pages/CorrelationPage').then((module) => ({ default: module.CorrelationPage })))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage').then((module) => ({ default: module.ReviewsPage })))
const ReviewDetailPage = lazy(() => import('@/pages/ReviewsPage').then((module) => ({ default: module.ReviewDetailPage })))
const AuditPage = lazy(() => import('@/pages/AuditPage').then((module) => ({ default: module.AuditPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

export function AppRouter() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:reportId" element={<ReportDetailPage />} />
            <Route path="safety-events" element={<SafetyEventsPage />} />
            <Route path="safety-events/:eventId" element={<SafetyEventDetailPage />} />
            <Route path="hazards" element={<HazardsPage />} />
            <Route path="barriers" element={<BarriersPage />} />
            <Route path="exposures" element={<ExposuresPage />} />
            <Route path="historical-intelligence" element={<HistoricalPage />} />
            <Route path="cctv" element={<CctvPage />} />
            <Route path="correlations" element={<CorrelationPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="reviews/:reportId" element={<ReviewDetailPage />} />
            <Route path="audit-logs" element={<AuditPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </WorkspaceProvider>
    </BrowserRouter>
  )
}
