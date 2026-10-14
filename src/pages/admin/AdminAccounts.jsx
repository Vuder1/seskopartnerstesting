import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const PERMS = [
  { key: 'perm_inquiries', label: 'Inquiries' },
  { key: 'perm_users', label: 'Users' },
  { key: 'perm_firms', label: 'Firms' },
  { key: 'perm_documents', label: 'Documents' },
  { key: 'perm_projects', label: 'Projects' },
]

function CreateAdminForm({ csrfToken, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [perms, setPerms] = useState({ perm_inquiries: false, perm_users: false, perm_firms: false, perm_documents: false, perm_projects: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const body = new FormData()
    body.append('action', 'create_admin')
    body.append('name', name)
    body.append('email', email)
    body.append('password', password)
    PERMS.forEach(({ key }) => body.append(key.replace('perm_', 'perm_'), perms[key] ? '1' : '0'))

    try {
      const res = await fetch('/api/admin/users.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setName('')
        setEmail('')
        setPassword('')
        setPerms({ perm_inquiries: false, perm_users: false, perm_firms: false, perm_documents: false, perm_projects: false })
        onCreated()
      } else {
        setError(data.error || 'Could not create admin.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-panel border border-line bg-white p-6">
      {error && <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-navy-900">Permissions</p>
        <div className="flex flex-wrap gap-4">
          {PERMS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-navy-900/80">
              <input type="checkbox" checked={perms[key]} onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Creating…' : 'Create Admin'}
      </button>
    </form>
  )
}

function AdminRow({ account, csrfToken, isSelf, onChanged }) {
  const [perms, setPerms] = useState({
    perm_inquiries: !!account.perm_inquiries,
    perm_users: !!account.perm_users,
    perm_firms: !!account.perm_firms,
    perm_documents: !!account.perm_documents,
    perm_projects: !!account.perm_projects,
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const body = new FormData()
    body.append('action', 'update_admin_permissions')
    body.append('user_id', account.id)
    PERMS.forEach(({ key }) => body.append(key, perms[key] ? '1' : '0'))
    await fetch('/api/admin/users.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    setSaving(false)
    onChanged()
  }

  async function remove() {
    if (!confirm(`Remove admin account "${account.name}"?`)) return
    const body = new FormData()
    body.append('action', 'delete_user')
    body.append('user_id', account.id)
    const res = await fetch('/api/admin/users.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Could not delete admin.')
      return
    }
    onChanged()
  }

  return (
    <div className="rounded-panel border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-navy-900">{account.name} {isSelf && <span className="text-xs font-normal text-navy-900/40">(you)</span>}</p>
          <p className="text-sm text-navy-900/50">{account.email}</p>
        </div>
        {!isSelf && (
          <button onClick={remove} className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {PERMS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-navy-900/80">
            <input type="checkbox" checked={perms[key]} onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))} />
            {label}
          </label>
        ))}
        <button onClick={save} disabled={saving} className="ml-auto rounded-md bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Permissions'}
        </button>
      </div>
    </div>
  )
}

export default function AdminAccounts() {
  const { user, csrfToken } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/users.php?role=admin')
    const data = await res.json()
    setAdmins(data.admins || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className="mt-6">
        <CreateAdminForm csrfToken={csrfToken} onCreated={load} />
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-navy-900/50">Loading…</p>
        ) : (
          admins.map((account) => (
            <AdminRow key={account.id} account={account} csrfToken={csrfToken} isSelf={account.id === user?.id} onChanged={load} />
          ))
        )}
      </div>
    </div>
  )
}
