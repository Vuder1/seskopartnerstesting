import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

// Shared building blocks that mirror the ASAŞ demo's primitives.

const PROJECT_STATUS = {
  active: ['pill', 'Active'],
  completed: ['pill-ok', 'Completed'],
  on_hold: ['pill-warn', 'On hold'],
}

const STAGE_STATUS = {
  pending: ['pill', 'Pending'],
  in_progress: ['pill-accent', 'In progress'],
  complete: ['pill-ok', 'Complete'],
}

export function ProjectStatusPill({ status }) {
  const [cls, label] = PROJECT_STATUS[status] || ['pill', status]
  return <span className={cls}>{label}</span>
}

export function StagePill({ status }) {
  const [cls, label] = STAGE_STATUS[status] || ['pill', status]
  return <span className={cls}>{label}</span>
}

// Segmented control, same look as the ASAŞ Log in / Register switch.
export function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div
      className={`inline-grid auto-cols-fr grid-flow-col gap-1 rounded-[11px] border border-line bg-[#f1f4f7] p-1 ${className}`}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={value === item.key}
          onClick={() => onChange(item.key)}
          className={`h-9 whitespace-nowrap rounded-lg px-4 text-[12px] font-bold capitalize transition-colors ${
            value === item.key ? 'bg-white text-navy shadow-[0_2px_9px_rgba(26,45,66,0.08)]' : 'text-muted hover:text-navy'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value, total, className = '' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-navy-soft ${className}`}>
      <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
    </div>
  )
}

const FILE_ICON_TEXT = { pdf: 'PDF', zip: 'ZIP', dwg: 'DWG', doc: 'DOC', docx: 'DOC', xls: 'XLS', xlsx: 'XLS', ppt: 'PPT', pptx: 'PPT', png: 'IMG', jpg: 'IMG', jpeg: 'IMG', mp4: 'MP4' }

export function FileTile({ name = '', mime = '' }) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  const text = FILE_ICON_TEXT[ext] || (mime.startsWith('video') ? 'MP4' : ext.slice(0, 3).toUpperCase() || 'FILE')
  return (
    <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-navy-soft text-[9px] font-extrabold tracking-wide text-navy">
      {text}
    </span>
  )
}

export function SearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <label className={`relative block ${className}`}>
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-[10px] border border-line bg-white pl-10 pr-3 text-[13px] focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
      />
    </label>
  )
}

export function EmptyState({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-surface-soft px-4 py-8 text-center text-sm text-muted">
      {children}
    </p>
  )
}

export function BackLink({ to, children }) {
  return (
    <NavLink to={to} className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy hover:text-accent-600">
      <span aria-hidden="true">&larr;</span> {children}
    </NavLink>
  )
}
