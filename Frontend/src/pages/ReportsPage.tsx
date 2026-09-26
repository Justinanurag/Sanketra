import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { SearchField } from '@/components/ui/SearchField'
import { Select } from '@/components/ui/Select'
import { labelOf } from '@/constants/labels'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import { formatDate } from '@/lib/format'
import { barrierConditions, reportTypes, reviewStatuses, sifPotentials, type SafetyReport } from '@/types/domain'

export function ReportsPage() {
  const navigate = useNavigate()
  const { data, openReportForm, deleteReport } = useWorkspace()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [sif, setSif] = useState('all')
  const [review, setReview] = useState('all')
  const [barrier, setBarrier] = useState('all')
  const [selected, setSelected] = useState<string[]>([])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return (data?.reports ?? []).filter((report) => {
      const haystack = `${report.id} ${report.title} ${report.reporter} ${report.hazardName} ${report.location}`.toLowerCase()
      if (term && !haystack.includes(term)) return false
      if (type !== 'all' && report.type !== type) return false
      if (sif !== 'all' && report.sifPotential !== sif) return false
      if (review !== 'all' && report.reviewStatus !== review) return false
      if (barrier !== 'all' && report.barrierStatus !== barrier) return false
      return true
    })
  }, [data, query, type, sif, review, barrier])

  if (!data) return null

  async function onDelete(report: SafetyReport) {
    const confirmed = await confirmAction({
      title: `Delete ${report.id}?`,
      text: 'The report leaves the working register. The audit entry is kept.',
      confirmText: 'Delete report',
      tone: 'danger',
    })
    if (!confirmed) return
    deleteReport(report.id)
    toast.success('Report deleted', { description: report.id })
  }

  const columns: Column<SafetyReport>[] = [
    { id: 'id', header: 'Report', width: '140px', sortValue: (row) => row.id, render: (row) => <span className="mono">{row.id}</span> },
    { id: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => <span className="row-title">{row.title}</span> },
    { id: 'reporter', header: 'Reporter', sortValue: (row) => row.reporter, render: (row) => row.reporter },
    { id: 'hazard', header: 'Hazard', sortValue: (row) => row.hazardName, render: (row) => row.hazardName },
    { id: 'sif', header: 'SIF potential', sortValue: (row) => row.sifPotential, render: (row) => <StatusBadge domain="sif" value={row.sifPotential} /> },
    { id: 'barrier', header: 'Barrier', sortValue: (row) => row.barrierStatus, render: (row) => <StatusBadge domain="barrier" value={row.barrierStatus} /> },
    { id: 'review', header: 'Review', sortValue: (row) => row.reviewStatus, render: (row) => <StatusBadge domain="review" value={row.reviewStatus} /> },
    { id: 'date', header: 'Date', sortValue: (row) => row.occurredAt, render: (row) => formatDate(row.occurredAt) },
    {
      id: 'actions',
      header: '',
      width: '48px',
      render: (row) => (
        <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <Dropdown
            trigger={({ toggle, open }) => (
              <button type="button" className="icon-button" aria-label={`Actions for ${row.id}`} aria-expanded={open} onClick={toggle}>
                <MoreHorizontal size={16} />
              </button>
            )}
          >
            <DropdownItem onSelect={() => navigate(`/reports/${row.id}`)}>View</DropdownItem>
            <DropdownItem onSelect={() => openReportForm(row.id)}>Edit</DropdownItem>
            <DropdownItem onSelect={() => navigate(`/reviews/${row.id}`)}>Review</DropdownItem>
            <DropdownItem danger onSelect={() => void onDelete(row)}>Delete</DropdownItem>
          </Dropdown>
        </span>
      ),
    },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Safety reports"
        description="Reported precursor conditions. High SIF potential is a rule result and still needs a human decision."
        actions={<Button onClick={() => openReportForm('new')}>Create safety report</Button>}
      />
      <section className="panel">
        <div className="toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search title, reporter, hazard, ID" />
          <Select aria-label="Report type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            {reportTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
          <Select aria-label="SIF potential" value={sif} onChange={(event) => setSif(event.target.value)}>
            <option value="all">All SIF levels</option>
            {sifPotentials.map((item) => (
              <option key={item} value={item}>{labelOf(item) === 'High' ? 'High SIF' : labelOf(item)}</option>
            ))}
          </Select>
          <Select aria-label="Review status" value={review} onChange={(event) => setReview(event.target.value)}>
            <option value="all">All review states</option>
            {reviewStatuses.map((item) => (
              <option key={item} value={item}>{labelOf(item)}</option>
            ))}
          </Select>
          <Select aria-label="Barrier status" value={barrier} onChange={(event) => setBarrier(event.target.value)}>
            <option value="all">All barrier states</option>
            {barrierConditions.map((item) => (
              <option key={item} value={item}>{labelOf(item)}</option>
            ))}
          </Select>
          {selected.length ? <span className="selected-note">{selected.length} selected</span> : null}
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          selectable
          selectedIds={selected}
          onSelectedIdsChange={setSelected}
          onRowClick={(row) => navigate(`/reports/${row.id}`)}
          label="Safety reports"
          emptyTitle="No safety reports found"
          emptyDescription="Nothing in the register matches these filters."
          emptyAction={<Button onClick={() => openReportForm('new')}>Create safety report</Button>}
        />
      </section>
    </div>
  )
}
