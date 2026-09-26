import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { Drawer } from '@/components/ui/Drawer'
import { BarrierFormModal } from '@/features/barriers/BarrierFormModal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import type { Barrier } from '@/types/domain'

export function BarriersPage() {
  const { data, deleteRecord } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Barrier | null>(null)
  if (!data) return null

  const columns: Column<Barrier>[] = [
    { id: 'name', header: 'Barrier', sortValue: (row) => row.name, render: (row) => <span className="row-title">{row.name}</span> },
    { id: 'type', header: 'Type', sortValue: (row) => row.type, render: (row) => row.type },
    { id: 'status', header: 'Status', sortValue: (row) => row.status, render: (row) => <StatusBadge domain="barrier" value={row.status} /> },
    { id: 'critical', header: 'Critical', render: (row) => (row.critical ? 'Yes' : 'No') },
    { id: 'hazard', header: 'Protects against', sortValue: (row) => row.protectedHazard, render: (row) => row.protectedHazard },
    { id: 'failures', header: 'Archive failures', sortValue: (row) => row.archiveFailures, render: (row) => row.archiveFailures },
    { id: 'owner', header: 'Owner', sortValue: (row) => row.owner, render: (row) => row.owner },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Barriers"
        description="Critical controls and their current condition. A failed barrier is a fact for review, not a severity score by itself."
        actions={<Button onClick={() => setOpen(true)}>Add barrier</Button>}
      />
      <section className="panel">
        <DataTable
          columns={columns}
          rows={data.barriers}
          getRowId={(row) => row.id}
          onRowClick={setSelected}
          label="Barriers"
          emptyTitle="No barriers in the register"
          emptyDescription="Add the controls that stand between people and the energy."
          emptyAction={<Button onClick={() => setOpen(true)}>Add barrier</Button>}
        />
      </section>
      <BarrierFormModal open={open} onClose={() => setOpen(false)} />
      <Drawer
        open={!!selected}
        title={selected?.name ?? 'Barrier'}
        description={selected?.id}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <Button
              variant="danger"
              onClick={async () => {
                const confirmed = await confirmAction({
                  title: `Delete ${selected.name}?`,
                  text: 'The barrier leaves the register. Reports keep the status they already recorded.',
                  confirmText: 'Delete barrier',
                  tone: 'danger',
                })
                if (!confirmed) return
                deleteRecord('barriers', selected.id)
                toast.success('Barrier deleted')
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
              { label: 'Type', value: selected.type },
              { label: 'Status', value: <StatusBadge domain="barrier" value={selected.status} /> },
              { label: 'Critical', value: selected.critical ? 'Yes' : 'No' },
              { label: 'Hazard', value: selected.protectedHazard },
              { label: 'Location', value: selected.location },
              { label: 'Owner', value: selected.owner },
              { label: 'Archive failures', value: selected.archiveFailures },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  )
}
