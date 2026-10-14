import { NavLink, Outlet } from 'react-router-dom'
import { asset } from '../assetUrl.js'
import { LanguageSwitch } from './AppShell.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

// Slim chrome for the few pages outside the app shell (privacy policy, 404).
export default function PublicLayout() {
  const { ui } = useLocale()
  return (
    <div className="min-h-screen bg-surface-bg">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={asset('/assets/sesko-architecture-logo.png')} alt="SESKO Architecture" className="h-7 w-auto" />
            <span className="hidden text-[13px] font-extrabold tracking-[-0.02em] text-navy sm:block">{ui.brandTitle}</span>
          </NavLink>
          <LanguageSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
