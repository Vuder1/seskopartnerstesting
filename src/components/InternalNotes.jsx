import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// Deliberately styled distinct from CommentThread (indigo, not teal) so
// staff never mistake this private log for the client-visible thread.
export default function InternalNotes({ projectId }) {
  const { csrfToken } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/admin/internal_notes.php?project_id=${projectId}`)
    const data = await res.json()
    setNotes(data.notes || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError('')
    const form = new FormData()
    form.append('action', 'add')
    form.append('project_id', projectId)
    form.append('body', body)
    try {
      const res = await fetch('/api/admin/internal_notes.php', {
        method: 'POST',
        body: form,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setBody('')
        load()
      } else {
        setError(data.error || 'Could not post your note.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(noteId) {
    if (!confirm('Remove this internal note?')) return
    const form = new FormData()
    form.append('action', 'delete')
    form.append('project_id', projectId)
    form.append('note_id', noteId)
    await fetch('/api/admin/internal_notes.php', {
      method: 'POST',
      body: form,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    load()
  }

  return (
    <div className="mt-4 rounded-lg border border-indigo-400/40 bg-indigo-50/50 p-5">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 flex-none text-indigo-600">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
        </svg>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Internal Notes — staff only, never visible to the client</p>
      </div>

      {loading ? (
        <p className="mt-3 text-xs text-navy-900/50">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="mt-3 text-xs text-navy-900/50">No internal notes yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy-900">{n.author_name}</span>
                <span className="text-xs text-navy-900/40">{new Date(n.created_at).toLocaleString()}</span>
                <button onClick={() => remove(n.id)} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-navy-900/80">{n.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 border-t border-indigo-400/20 pt-3">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Leave a note for the team (not visible to the client)…"
          className="w-full rounded-md border border-indigo-400/30 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="mt-2 flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Posting…' : 'Post Note'}
          </button>
        </div>
      </form>
    </div>
  )
}
