import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'

const DropdownClose = createContext<() => void>(() => {})

export function Dropdown({
  trigger,
  children,
  align = 'end',
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = menuRef.current?.offsetWidth ?? 180
      const left = align === 'end' ? Math.max(8, rect.right - width) : rect.left
      setPosition({ top: rect.bottom + 4, left })
    }
    place()
    function onPointer(event: MouseEvent) {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, align])

  return (
    <span className="dropdown" ref={buttonRef}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className="dropdown-menu"
              style={{ top: position.top, left: position.left }}
              onClick={() => setOpen(false)}
            >
              <DropdownClose.Provider value={() => setOpen(false)}>{children}</DropdownClose.Provider>
            </div>,
            document.body,
          )
        : null}
    </span>
  )
}

export function DropdownItem({
  children,
  onSelect,
  danger = false,
}: {
  children: ReactNode
  onSelect: () => void
  danger?: boolean
}) {
  const close = useContext(DropdownClose)
  return (
    <button
      type="button"
      role="menuitem"
      className={cx('dropdown-item', danger && 'is-danger')}
      onClick={() => {
        onSelect()
        close()
      }}
    >
      {children}
    </button>
  )
}
