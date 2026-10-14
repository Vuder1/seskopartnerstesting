import NotificationBell from './NotificationBell.jsx'
import { LanguageSwitch } from '../layouts/AppShell.jsx'

// Eyebrow + big title + subtitle on the left, utilities and the page's
// primary action on the right - the ASAŞ page-header pattern.
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title mt-1.5">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[13px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {actions}
        <LanguageSwitch className="hidden lg:inline-grid" />
        <span className="hidden lg:block">
          <NotificationBell />
        </span>
      </div>
    </header>
  )
}
