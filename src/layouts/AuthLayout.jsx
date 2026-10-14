import Icon from '../components/Icon.jsx'
import { asset } from '../assetUrl.js'
import { LanguageSwitch } from './AppShell.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

// Split-screen auth shell: navy brand panel on the left, form on the right
// (the ASAŞ login layout). The left panel drops away below lg.
export default function AuthLayout({ children }) {
  const { ui } = useLocale()
  const a = ui.auth

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
      <section className="relative hidden flex-col overflow-hidden bg-[linear-gradient(145deg,#182f4d,#1f3a5f_52%,#294f7d)] px-14 py-11 text-white lg:flex">
        <div className="pointer-events-none absolute -bottom-48 -right-60 h-[520px] w-[520px] rounded-full border border-white/10 shadow-[0_0_0_70px_rgba(255,255,255,0.025),0_0_0_150px_rgba(255,255,255,0.02)]" />

        <div className="relative z-10 flex items-center gap-4">
          <span className="flex items-center gap-3 rounded-[10px] bg-white px-3.5 py-2.5">
            <img src={asset('/assets/sesko-architecture-logo.png')} alt="SESKO Architecture" className="h-6 w-auto" />
            <span className="h-5 w-px bg-line" />
            <img src={asset('/assets/sesko-studio-logo.png')} alt="SESKO Studio" className="h-6 w-auto" />
          </span>
          <div>
            <strong className="block text-[14px]">{ui.brandTitle}</strong>
            <span className="mt-0.5 block text-[10px] text-white/60">{ui.brandSub}</span>
          </div>
        </div>

        <div className="relative z-10 my-auto w-full max-w-[610px]">
          <span className="inline-flex rounded-full border border-white/20 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-white/75">
            {a.pill}
          </span>
          <h1 className="mb-4 mt-5 max-w-[550px] text-[clamp(38px,4.6vw,58px)] font-extrabold leading-[0.98] tracking-[-0.05em]">
            {a.heroTitle}
          </h1>
          <p className="max-w-[500px] text-[13px] leading-[1.65] text-white/65">{a.heroText}</p>

          <div className="mt-10 grid max-w-[520px] gap-2.5">
            {a.features.map(([icon, title, text]) => (
              <div key={title} className="grid grid-cols-[39px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3.5">
                <span className="grid h-[39px] w-[39px] place-items-center rounded-[10px] bg-white/[0.08]">
                  <Icon name={icon} />
                </span>
                <div>
                  <strong className="block text-[12px]">{title}</strong>
                  <p className="mt-0.5 text-[10px] text-white/50">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-white/35">{a.footer}</p>
      </section>

      <section className="relative flex flex-col items-center justify-center bg-[#fbfcfd] px-5 py-10 sm:px-10">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-7">
          <LanguageSwitch />
        </div>
        <div className="w-full max-w-[430px]">
          <img src={asset('/assets/sesko-architecture-logo.png')} alt="SESKO" className="mb-8 h-8 w-auto lg:hidden" />
          {children}
        </div>
      </section>
    </div>
  )
}
