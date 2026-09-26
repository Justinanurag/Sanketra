import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { Drawer } from '@/components/ui/Drawer'
import { SearchField } from '@/components/ui/SearchField'
import { Select } from '@/components/ui/Select'
import { useWorkspace } from '@/hooks/useWorkspace'
import { formatDateTime } from '@/lib/format'
import type { AuditEntry } from '@/types/domain'

export function AuditPage() {
  const { data } = useWorkspace()
  const [query, setQuery] = useState('')
  const [entity, setEntity] = useState('all')
  const [selected, setSelected] = useState<AuditEntry | null>(null)
  const entities = useMemo(() => [...new Set((data?.audit ?? []).map((entry) => entry.entity))], [data])
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return (data?.audit ?? []).filter((entry) => {
      if (entity !== 'all' && entry.entity !== entity) return false
      if (!term) return true
      return `${entry.user} ${entry.action} ${entry.entity} ${entry.entityId} ${entry.reason} ${entry.newValue}`.toLowerCase().includes(term)
    })
  }, [data, query, entity])

  if (!data) return null

  const columns: Column<AuditEntry>[] = [
    { id: 'when', header: 'Timestamp', sortValue: (row) => row.timestamp, render: (row) => formatDateTime(row.timestamp) },
    { id: 'user', header: 'User', sortValue: (row) => row.user, render: (row) => row.user },
    { id: 'action', header: 'Action', sortValue: (row) => row.action, render: (row) => row.action },
    { id: 'entity', header: 'Entity', sortValue: (row) => row.entity, render: (row) => row.entity },
    { id: 'id', header: 'Record', sortValue: (row) => row.entityId, render: (row) => <span className="mono">{row.entityId}</span> },
    { id: 'reason', header: 'Reason', render: (row) => row.reason },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Audit log"
        description="Who changed a record, what changed, and why. Entries are append-only in this session."
      />
      <section className="panel">
        <div className="toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search user, action, record, reason" />
          <Select aria-label="Entity" value={entity} onChange={(event) => setEntity(event.target.value)}>
            <option value="all">All entities</option>
            {entities.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          onRowClick={setSelected}
          label="Audit log"
          emptyTitle="No audit entries"
          emptyDescription="Nothing matches this filter."
        />
      </section>
      <Drawer open={!!selected} title={selected ? `${selected.action} ${selected.entityId}` : 'Audit entry'} description={selected?.user} onClose={() => setSelected(null)}>
        {selected ? (
          <DetailList
            items={[
              { label: 'Timestamp', value: formatDateTime(selected.timestamp) },
              { label: 'User', value: selected.user },
              { label: 'Action', value: selected.action },
              { label: 'Entity', value: selected.entity },
              { label: 'Record', value: selected.entityId },
              { label: 'Previous value', value: <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selected.previousValue}</pre> },
              { label: 'New value', value: <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selected.newValue}</pre> },
              { label: 'Reason', value: selected.reason },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  )
}
