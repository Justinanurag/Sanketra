import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/status/StatusBadge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { DetailList } from '@/components/ui/DetailList'
import { Drawer } from '@/components/ui/Drawer'
import { HazardFormModal } from '@/features/hazards/HazardFormModal'
import { useWorkspace } from '@/hooks/useWorkspace'
import { confirmAction } from '@/lib/dialogs'
import { formatDate } from '@/lib/format'
import type { Hazard } from '@/types/domain'

export function HazardsPage() {
  const { data, deleteRecord } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Hazard | null>(null)
  if (!data) return null

  const columns: Column<Hazard>[] = [
    { id: 'name', header: 'Hazard', sortValue: (row) => row.name, render: (row) => <span className="row-title">{row.name}</span> },
    { id: 'category', header: 'Category', sortValue: (row) => row.category, render: (row) => row.category },
    { id: 'energy', header: 'Energy', sortValue: (row) => row.energySource, render: (row) => row.energySource },
    { id: 'severity', header: 'Severity', sortValue: (row) => row.severity, render: (row) => <StatusBadge domain="severity" value={row.severity} /> },
    { id: 'archive', header: 'Archive count', sortValue: (row) => row.archiveCount, render: (row) => row.archiveCount },
    { id: 'recurring', header: 'Pattern', render: (row) => (row.recurring ? 'Recurring' : 'Single') },
    { id: 'seen', header: 'Last seen', sortValue: (row) => row.lastSeen, render: (row) => formatDate(row.lastSeen) },
  ]

  return (
    <div className="stack">
      <PageHeader
        title="Hazards"
        description="Energy that can harm people. Recurring hazards are archive patterns, not a forecast."
        actions={<Button onClick={() => setOpen(true)}>Add hazard</Button>}
      />
      <section className="panel">
        <DataTable
          columns={columns}
          rows={data.hazards}
          getRowId={(row) => row.id}
          onRowClick={setSelected}
          label="Hazards"
          emptyTitle="No hazards in the register"
          emptyDescription="Add the energies this site is managing."
          emptyAction={<Button onClick={() => setOpen(true)}>Add hazard</Button>}
        />
      </section>
      <HazardFormModal open={open} onClose={() => setOpen(false)} />
      <Drawer
        open={!!selected}
        title={selected?.name ?? 'Hazard'}
        description={selected?.id}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <Button
              variant="danger"
              onClick={async () => {
                const confirmed = await confirmAction({
                  title: `Delete ${selected.name}?`,
                  text: 'The hazard leaves the register. Linked reports keep the name they already stored.',
                  confirmText: 'Delete hazard',
                  tone: 'danger',
                })
                if (!confirmed) return
                deleteRecord('hazards', selected.id)
                toast.success('Hazard deleted')
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
              { label: 'Category', value: selected.category },
              { label: 'Energy source', value: selected.energySource },
              { label: 'Severity', value: <StatusBadge domain="severity" value={selected.severity} /> },
              { label: 'Archive count', value: selected.archiveCount },
              { label: 'Recurring', value: selected.recurring ? 'Yes' : 'No' },
              { label: 'Description', value: selected.description },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  )
}
