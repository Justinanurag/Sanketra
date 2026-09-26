import {
  AlertTriangle,
  Camera,
  ClipboardCheck,
  FileText,
  GitMerge,
  History,
  LayoutDashboard,
  ScrollText,
  Shield,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: 'openReviews'
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { to: '/reports', label: 'Safety Reports', icon: FileText },
      { to: '/safety-events', label: 'Safety Events', icon: ShieldAlert },
      { to: '/reviews', label: 'Human Review', icon: ClipboardCheck, badge: 'openReviews' },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { to: '/hazards', label: 'Hazards', icon: AlertTriangle },
      { to: '/barriers', label: 'Barriers', icon: Shield },
      { to: '/exposures', label: 'Exposures', icon: Users },
      { to: '/historical-intelligence', label: 'Historical Intelligence', icon: History },
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    items: [
      { to: '/cctv', label: 'CCTV Evidence', icon: Camera },
      { to: '/correlations', label: 'Correlation', icon: GitMerge },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [{ to: '/audit-logs', label: 'Audit Logs', icon: ScrollText }],
  },
]

export const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/reports': 'Safety Reports',
  '/safety-events': 'Safety Events',
  '/reviews': 'Human Review',
  '/hazards': 'Hazards',
  '/barriers': 'Barriers',
  '/exposures': 'Exposures',
  '/historical-intelligence': 'Historical Intelligence',
  '/cctv': 'CCTV Evidence',
  '/correlations': 'Correlation',
  '/audit-logs': 'Audit Logs',
}
