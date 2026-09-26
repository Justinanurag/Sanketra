import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'

export interface Column<T> {
  id: string
  header: string
  width?: string
  sortValue?: (row: T) => string | number
  render: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  pageSize = 8,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectedIdsChange,
  loading = false,
  error,
  onRetry,
  emptyTitle = 'Nothing to show',
  emptyDescription = 'No records match the current view.',
  emptyAction,
  label = 'Data table',
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  pageSize?: number
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  label?: string
}) {
  const [sort, setSort] = useState<{ id: string; direction: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)
  const rowKey = rows.map(getRowId).join('|')

  useEffect(() => {
    setPage(1)
  }, [rowKey])

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((item) => item.id === sort.id)
    if (!column?.sortValue) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const left = column.sortValue?.(a)
      const right = column.sortValue?.(b)
      const result =
        typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
      return sort.direction === 'asc' ? result : -result
    })
    return copy
  }, [rows, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
  const selected = new Set(selectedIds ?? [])
  const visibleIds = visible.map(getRowId)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  if (loading) {
    return (
      <div className="table-wrap" role="status">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="skeleton" key={index} style={{ height: 28, marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={onRetry} />

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  }

  return (
    <div>
      {selectable && selected.size ? <p className="selected-note">{selected.size} selected</p> : null}
      <div className="table-wrap" tabIndex={0} role="region" aria-label={label}>
        <table className="data">
          <thead>
            <tr>
              {selectable ? (
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    aria-label="Select rows on this page"
                    checked={allVisibleSelected}
                    onChange={() => {
                      if (!onSelectedIdsChange) return
                      if (allVisibleSelected) onSelectedIdsChange((selectedIds ?? []).filter((id) => !visibleIds.includes(id)))
                      else onSelectedIdsChange([...new Set([...(selectedIds ?? []), ...visibleIds])])
                    }}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const active = sort?.id === column.id
                return (
                  <th key={column.id} style={{ width: column.width }} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    {column.sortValue ? (
                      <button
                        type="button"
                        className="sort-button"
                        onClick={() =>
                          setSort((current) =>
                            current?.id === column.id
                              ? { id: column.id, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                              : { id: column.id, direction: 'asc' },
                          )
                        }
                      >
                        {column.header}
                        {active ? sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const id = getRowId(row)
              return (
                <tr
                  key={id}
                  className={onRowClick ? 'is-clickable' : undefined}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(event) => {
                    if (!onRowClick) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onRowClick(row)
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {selectable ? (
                    <td onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${id}`}
                        checked={selected.has(id)}
                        onChange={() => {
                          if (!onSelectedIdsChange) return
                          onSelectedIdsChange(
                            selected.has(id) ? (selectedIds ?? []).filter((item) => item !== id) : [...(selectedIds ?? []), id],
                          )
                        }}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.id}>{column.render(row)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={safePage} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onPageChange={setPage} />
    </div>
  )
}
