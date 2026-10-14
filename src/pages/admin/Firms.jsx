import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Firms() {
  const { csrfToken } = useAuth()
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function loadFirms() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/firms.php')
      const data = await res.json()
      setFirms(data.firms || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFirms()
  }, [])

  async function handleDelete(firm) {
    if (!confirm(`Remove firm "${firm.name}"? This also permanently deletes all of its projects, files, and conversations. This cannot be undone.`)) return
    const body = new FormData()
    body.append('action', 'delete')
    body.append('id', firm.id)
    await fetch('/api/admin/firms.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    loadFirms()
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    const body = new FormData()
    body.append('name', newName.trim())
    try {
      const res = await fetch('/api/admin/firms.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setNewName('')
        loadFirms()
      } else {
        setError(data.error || 'Could not create firm.')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New firm name"
          className="min-w-[240px] flex-1 rounded-[10px] border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
        />
        <button type="submit" disabled={creating} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {creating ? 'Adding…' : 'Add Firm'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-panel border border-line bg-white">
        {loading ? (
          <p className="p-6 text-sm text-navy-900/50">Loading…</p>
        ) : firms.length === 0 ? (
          <p className="p-6 text-sm text-navy-900/50">No firms yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-soft text-navy-900/60">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Created</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {firms.map((firm) => (
                <tr key={firm.id}>
                  <td className="px-6 py-3 font-medium text-navy-900">{firm.name}</td>
                  <td className="px-6 py-3 text-navy-900/60">{new Date(firm.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => handleDelete(firm)} className="text-sm font-semibold text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
