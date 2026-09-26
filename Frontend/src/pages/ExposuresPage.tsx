import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { Drawer } from '@/components/ui/Drawer'
import { ExposureFormModal } from '@/features/exposures/ExposureFormModal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import type { Exposure } from '@/types/domain'

export function ExposuresPage() {
  const { data, deleteRecord } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Exposure | null>(null)
  if (!data) return null

  const columns: Column<Exposure>[] = [
    { id: 'report', header: 'Report', sortValue: (row) => row.reportId, render: (row) => <span className="mono">{row.reportId}</span> },
    { id: 'role', header: 'Role', sortValue: (row) => row.personRole, render: (row) => <span className="row-title">{row.personRole}</span> },
    { id: 'zone', header: 'Zone', sortValue: (row) => row.zone, render: (row) => row.zone },
    { id: 'proximity', header: 'Proximity', render: (row) => row.proximity },
    { id: 'severity', header: 'Severity', sortValue: (row) => row.severity, render: (row) => <StatusBadge domain="severity" value={row.severity} /> },
    { id: 'observed', header: 'Observed', render: (row) => (row.observed ? 'Observed' : 'Not observed') },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Exposures"
        description="People who were in range of the energy. An exposure record does not by itself set SIF potential."
        actions={<Button onClick={() => setOpen(true)}>Add exposure</Button>}
      />
      <section className="panel">
        <DataTable
          columns={columns}
          rows={data.exposures}
          getRowId={(row) => row.id}
          onRowClick={setSelected}
          label="Exposures"
          emptyTitle="No exposures recorded"
          emptyDescription="Link a person and a zone to a safety report."
          emptyAction={<Button onClick={() => setOpen(true)}>Add exposure</Button>}
        />
      </section>
      <ExposureFormModal open={open} onClose={() => setOpen(false)} />
      <Drawer open={!!selected} title={selected?.personRole ?? 'Exposure'} description={selected?.id} onClose={() => setSelected(null)}
        footer={
          selected ? (
            <Button
              variant="danger"
              onClick={async () => {
                const confirmed = await confirmAction({
                  title: 'Delete this exposure?',
                  text: 'The exposure leaves the register. The source report is unchanged.',
                  confirmText: 'Delete exposure',
                  tone: 'danger',
                })
                if (!confirmed) return
                deleteRecord('exposures', selected.id)
                toast.success('Exposure deleted')
                setSelected(null)
              }}
            >
              Delete
            </Button>
          ) : null
        }
      >
        {selected ? (
          <DetailList
            items={[
              { label: 'Report', value: <Link to={`/reports/${selected.reportId}`}>{selected.reportId}</Link> },
              { label: 'Description', value: selected.description },
              { label: 'Zone', value: selected.zone },
              { label: 'Proximity', value: selected.proximity },
              { label: 'Severity', value: <StatusBadge domain="severity" value={selected.severity} /> },
              { label: 'Observed', value: selected.observed ? 'Yes' : 'No' },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  )
}
