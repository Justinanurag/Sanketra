import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export function SearchField({
  value,
  onChange,
  placeholder,
  label = 'Search',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
}) {
  return (
    <label className="search-field">
      <span className="sr-only">{label}</span>
      <Search size={15} aria-hidden />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}
