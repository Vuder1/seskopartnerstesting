import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Tabs } from '../../components/ui.jsx'

const statusTabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

function ApproveForm({ userRow, firms, csrfToken, onDone }) {
  const [mode, setMode] = useState('existing') // existing | new
  const [firmId, setFirmId] = useState('')
  const [newFirmName, setNewFirmName] = useState(userRow.company_name_typed || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleApprove() {
    setSubmitting(true)
    setError('')
    const body = new FormData()
    body.append('action', 'approve')
    body.append('user_id', userRow.id)
    if (mode === 'existing') {
      body.append('firm_id', firmId)
    } else {
      body.append('new_firm_name', newFirmName)
    }
    try {
      const res = await fetch('/api/admin/users.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        onDone()
      } else {
        setError(data.error || 'Could not approve.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 rounded-md border border-line bg-surface-soft p-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
          Existing firm
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} />
          New firm
        </label>
      </div>

      <div className="mt-3">
        {mode === 'existing' ? (
          <select
            value={firmId}
            onChange={(e) => setFirmId(e.target.value)}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
          >
            <option value="">Select a firm…</option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>{firm.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={newFirmName}
            onChange={(e) => setNewFirmName(e.target.value)}
            placeholder="New firm name"
            className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleApprove}
        disabled={submitting || (mode === 'existing' ? !firmId : !newFirmName.trim())}
        className="btn-primary mt-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Approving…' : 'Confirm Approval'}
      </button>
    </div>
  )
}

function UserRow({ userRow, firms, csrfToken, onChanged }) {
  const [approving, setApproving] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [busy, setBusy] = useState(false)

  async function postAction(action, extra = {}) {
    setBusy(true)
    const body = new FormData()
    body.append('action', action)
    body.append('user_id', userRow.id)
    Object.entries(extra).forEach(([k, v]) => body.append(k, v))
    try {
      const res = await fetch('/api/admin/users.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      if (res.ok) onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-panel border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-navy-900">{userRow.name} <span className="font-normal text-navy-900/50">— {userRow.email}</span></p>
          <p className="mt-1 text-sm text-navy-900/60">
            Typed company: {userRow.company_name_typed || '—'}
            {userRow.firm_name && <> · Firm: <strong>{userRow.firm_name}</strong></>}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-navy-900/40">
            {userRow.status} · registered {new Date(userRow.created_at).toLocaleDateString()}
          </p>
        </div>

        {userRow.status === 'pending' && (
          <div className="flex flex-none gap-2">
            <button onClick={() => setApproving((v) => !v)} className="btn-primary">Approve</button>
            <button onClick={() => setRejecting((v) => !v)} className="btn-outline-dark">Reject</button>
          </div>
        )}
        <div className="flex flex-none items-center gap-2">
          {userRow.status === 'rejected' && (
            <button onClick={() => postAction('reconsider')} disabled={busy} className="btn-outline-dark">
              Reconsider
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Remove user "${userRow.name}"? This cannot be undone.`)) postAction('delete_user')
            }}
            disabled={busy}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      {approving && (
        <ApproveForm
          userRow={userRow}
          firms={firms}
          csrfToken={csrfToken}
          onDone={() => {
            setApproving(false)
            onChanged()
          }}
        />
      )}

      {rejecting && (
        <div className="mt-3 rounded-md border border-line bg-surface-soft p-4">
          <label className="mb-1 block text-sm font-medium text-navy-900">Reason (optional, included in the email to the applicant)</label>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={2}
            className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
          <button
            onClick={() => postAction('reject', { admin_note: rejectNote })}
            disabled={busy}
            className="btn-outline-dark mt-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function PendingUsers() {
  const { csrfToken } = useAuth()
  const [status, setStatus] = useState('pending')
  const [users, setUsers] = useState([])
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [usersRes, firmsRes] = await Promise.all([
        fetch(`/api/admin/users.php?status=${status}`),
        fetch('/api/admin/firms.php'),
      ])
      const usersData = await usersRes.json()
      const firmsData = await firmsRes.json()
      setUsers(usersData.users || [])
      setFirms(firmsData.firms || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div>
      <Tabs value={status} onChange={setStatus} items={statusTabs} />

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-navy-900/50">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-navy-900/50">No users in this category.</p>
        ) : (
          users.map((userRow) => (
            <UserRow key={userRow.id} userRow={userRow} firms={firms} csrfToken={csrfToken} onChanged={load} />
          ))
        )}
      </div>
    </div>
  )
}
