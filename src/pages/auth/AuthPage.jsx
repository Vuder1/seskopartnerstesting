import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout.jsx'
import Honeypot from '../../components/Honeypot.jsx'
import Icon from '../../components/Icon.jsx'
import { Tabs } from '../../components/ui.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'
import { DEMO_ACCOUNTS, DEMO_ENABLED } from '../../demo/demoConfig.js'

function IconField({ id, icon, label, hint, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold text-muted">{label}</label>
      <div className="relative">
        <Icon name={icon} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
        <input
          id={id}
          {...inputProps}
          className="h-11 w-full rounded-[10px] border border-line bg-white pl-10 pr-3 text-[14px] placeholder:text-muted-2 focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-2">{hint}</p>}
    </div>
  )
}

function Heading({ eyebrow, title, sub }) {
  return (
    <div className="mb-6 mt-8">
      <span className="eyebrow-accent">{eyebrow}</span>
      <h2 className="mb-1.5 mt-2 text-[28px] font-extrabold leading-[1.05] tracking-[-0.045em] text-navy">{title}</h2>
      <p className="text-[12px] text-muted">{sub}</p>
    </div>
  )
}

function ErrorBox({ children }) {
  return <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{children}</div>
}

function LoginForm({ onSwitch }) {
  const { login } = useAuth()
  const { ui } = useLocale()
  const a = ui.auth
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    if (result.user.role === 'admin') navigate('/admin')
    else navigate(location.state?.from?.pathname || '/')
  }

  return (
    <>
      <Heading eyebrow={a.welcome} title={a.signIn} sub={a.signInSub} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}
        <IconField id="login-email" icon="mail" label={a.email} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" />
        <IconField id="login-password" icon="lock" label={a.password} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <button type="submit" disabled={submitting} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {a.login} <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>

      {DEMO_ENABLED && (
        <div className="mt-7">
          <p className="mb-3 flex items-center gap-3 text-[10px] text-muted-2 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">{a.demoAccounts}</p>
          <div className="grid gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <div key={acc.email} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                <span className="icon-tile h-9 w-9"><Icon name={acc.icon} className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-navy">{acc.label}</p>
                  <p className="truncate text-[10px] text-muted-2">{acc.email}</p>
                </div>
                <button type="button" onClick={() => { setEmail(acc.email); setPassword(acc.password) }} className="px-2 text-[11px] font-extrabold text-accent-600 hover:underline">
                  {a.use}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-7 text-center text-[12px] text-muted">
        <button type="button" onClick={onSwitch} className="font-bold text-navy hover:text-accent-600">{a.register}</button>
      </p>
    </>
  )
}

function RegisterForm({ onSwitch }) {
  const { ui } = useLocale()
  const a = ui.auth
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    const form = e.target
    try {
      const res = await fetch('/api/register.php', { method: 'POST', body: new FormData(form) })
      const json = await res.json()
      if (res.ok) {
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
        setErrorMsg(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Could not reach the server. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-8 rounded-panel border border-line bg-white p-7 text-center shadow-panel">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ok-soft text-ok"><Icon name="check" className="h-6 w-6" /></span>
        <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-navy">Thanks for registering</h2>
        <p className="mt-2 text-[13px] text-muted">
          Your account needs to be approved by our team before you can log in. We'll email you once it's ready.
        </p>
        <button type="button" onClick={onSwitch} className="btn-primary mt-6">{a.login}</button>
      </div>
    )
  }

  return (
    <>
      <Heading eyebrow={a.createEyebrow} title={a.createTitle} sub={a.createSub} />
      <form onSubmit={handleSubmit} className="relative space-y-4">
        <Honeypot />
        {status === 'error' && <ErrorBox>{errorMsg}</ErrorBox>}
        <IconField id="reg-name" icon="user" label={a.name} name="name" type="text" required autoComplete="name" />
        <IconField id="reg-email" icon="mail" label={a.email} name="email" type="email" required autoComplete="email" />
        <IconField id="reg-company" icon="building" label={a.company} name="company" type="text" required autoComplete="organization" />
        <IconField id="reg-password" icon="lock" label={a.password} name="password" type="password" required minLength={8} hint={a.minChars} autoComplete="new-password" />
        <button type="submit" disabled={status === 'sending'} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {a.register} <Icon name="arrow" className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-7 text-center text-[12px] text-muted">
        <button type="button" onClick={onSwitch} className="font-bold text-navy hover:text-accent-600">{a.login}</button>
      </p>
    </>
  )
}

function StatusCard({ user }) {
  const { logout } = useAuth()
  const { t, ui } = useLocale()
  const a = ui.auth
  const pending = user.status === 'pending'
  const msg = pending
    ? t.portal.pendingMsg.replace('{email}', user.email)
    : t.portal.rejectedMsg

  return (
    <div className="mt-8 rounded-panel border border-line bg-white p-7 shadow-panel">
      <span className={`grid h-11 w-11 place-items-center rounded-full ${pending ? 'bg-amber-50 text-amber-700' : 'bg-accent-soft text-accent-600'}`}>
        <Icon name={pending ? 'lock' : 'x'} className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-navy">{pending ? a.pendingTitle : a.rejectedTitle}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{msg}</p>
      <button type="button" onClick={logout} className="btn-outline-dark mt-6">{ui.nav.logout}</button>
    </div>
  )
}

export default function AuthPage({ initialMode = 'login' }) {
  const { user, loading } = useAuth()
  const { ui } = useLocale()
  const [mode, setMode] = useState(initialMode)

  if (loading) return null
  if (user?.status === 'approved') return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />

  return (
    <AuthLayout>
      {user ? (
        <StatusCard user={user} />
      ) : (
        <>
          <Tabs
            className="w-full"
            value={mode}
            onChange={setMode}
            items={[
              { key: 'login', label: ui.auth.login },
              { key: 'register', label: ui.auth.register },
            ]}
          />
          {mode === 'login' ? <LoginForm onSwitch={() => setMode('register')} /> : <RegisterForm onSwitch={() => setMode('login')} />}
        </>
      )}
    </AuthLayout>
  )
}
