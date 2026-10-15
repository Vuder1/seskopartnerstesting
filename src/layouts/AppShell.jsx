import { useEffect, useState } from 'react'
import { asset } from '../assetUrl.js'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
}

export function LanguageSwitch({ className = '' }) {
  const { locale, setLocale } = useLocale()
  return (
    <div className={`inline-grid grid-flow-col gap-0.5 rounded-[10px] border border-line bg-[#d3dce7] p-0.5 ${className}`} role="group" aria-label="Language">
      {['en', 'pl'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`h-8 rounded-lg px-2.5 text-[11px] font-extrabold uppercase tracking-wide transition-colors ${
            locale === code ? 'bg-white text-navy shadow-[0_2px_9px_rgba(26,45,66,0.08)]' : 'text-muted hover:text-navy'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

function Brand() {
  const { ui } = useLocale()
  return (
    <div>
      <div className="flex items-center gap-3">
        <img src={asset('/assets/sesko-architecture-logo.png')} alt="SESKO Architecture" className="h-7 w-auto" />
        <span className="h-6 w-px bg-line" />
        <img src={asset('/assets/sesko-studio-logo.png')} alt="SESKO Studio" className="h-7 w-auto" />
      </div>
      <p className="mt-4 text-[15px] font-extrabold tracking-[-0.02em] text-navy">{ui.brandTitle}</p>
      <p className="mt-0.5 text-[11px] text-muted-2">{ui.brandSub}</p>
    </div>
  )
}

function SidebarBody({ nav, onNavigate }) {
  const { user, logout } = useAuth()
  const { ui } = useLocale()
  const isAdmin = user?.role === 'admin'
  const company = user?.firm_name || user?.company_name_typed

  return (
    <div className="flex h-full flex-col">
      <Brand />

      <div className="mt-6 rounded-xl border border-line bg-navy-soft px-3.5 py-3">
        <p className="eyebrow">{isAdmin ? ui.roleEyebrow.admin : ui.roleEyebrow.client}</p>
        <p className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-navy">
          <Icon name={isAdmin ? 'shield' : 'building'} className="h-4 w-4" />
          <span className="truncate">{isAdmin ? ui.teamName : company || ui.roles.client}</span>
        </p>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <Icon name={item.icon} className="h-[18px] w-[18px] flex-none" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <div className="flex items-center gap-3 px-1 pb-3">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-navy text-[11px] font-extrabold text-white">{initials(user?.name)}</span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-navy">{user?.name}</p>
            <p className="truncate text-[10px] text-muted-2">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="nav-item">
          <Icon name="logout" className="h-[18px] w-[18px] flex-none" />
          {ui.nav.logout}
        </button>
      </div>
    </div>
  )
}

export default function AppShell({ nav, children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface-bg lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-white px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <SidebarBody nav={nav} />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-white text-navy">
          <Icon name="menu" />
        </button>
        <img src={asset('/assets/sesko-architecture-logo.png')} alt="SESKO" className="h-6 w-auto" />
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <NotificationBell />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto bg-white px-4 py-6 shadow-pop">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-[10px] text-muted hover:bg-navy-soft">
              <Icon name="x" />
            </button>
            <SidebarBody nav={nav} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-[1280px]">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  )
}
