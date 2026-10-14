import { useEffect, useState } from 'react'
import { blockInDemo } from '../demo/demoConfig.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function CommentThread({ stageId, substageId, commentCount }) {
  const { user, csrfToken } = useAuth()
  const anchorId = substageId ? `substage-${substageId}` : `stage-${stageId}`
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === `#${anchorId}`)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [body, setBody] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const query = substageId ? `substage_id=${substageId}` : `stage_id=${stageId}`

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/stage_comments.php?${query}`)
    const data = await res.json()
    setComments(data.comments || [])
    setLoading(false)
  }

  useEffect(() => {
    if (open) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function reviewComment(commentId, action) {
    if (action === 'discard_ai_comment' && !confirm('Discard this AI-drafted comment? This cannot be undone.')) return
    const form = new FormData()
    form.append('action', action)
    form.append('comment_id', commentId)
    await fetch('/api/admin/projects.php', {
      method: 'POST',
      body: form,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    load()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError('')
    const form = new FormData()
    if (substageId) form.append('substage_id', substageId)
    else form.append('stage_id', stageId)
    form.append('body', body)
    if (file) form.append('file', file)

    try {
      const res = await fetch('/api/stage_comments.php', {
        method: 'POST',
        body: form,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setBody('')
        setFile(null)
        load()
      } else {
        setError(data.error || 'Could not post your message.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-2 hover:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {open ? 'Hide conversation' : `Conversation${commentCount ? ` (${commentCount})` : ''}`}
      </button>

      {open && (
        <div className="mt-2 space-y-3 rounded-md border border-line bg-white p-3">
          {loading ? (
            <p className="text-xs text-navy-900/50">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-navy-900/50">No messages yet. Ask a question below.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className={`text-sm ${c.review_status === 'pending' ? 'rounded-md border border-amber-400/60 bg-amber-50 p-2' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy-900">{c.author_name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      c.author_role === 'admin' ? 'bg-navy-soft text-navy-2'
                        : c.author_role === 'system' ? 'bg-purple-500/10 text-purple-600'
                        : 'bg-navy-900/5 text-navy-900/50'
                    }`}>
                      {c.author_role === 'admin' ? 'SESKO Staff' : c.author_role === 'system' ? 'AI Assistant' : 'Client'}
                    </span>
                    {c.review_status === 'pending' && (
                      <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Pending Review</span>
                    )}
                    <span className="text-xs text-navy-900/40">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-navy-900/80">{c.body}</p>
                  {c.attachments && c.attachments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {c.attachments.map((a) => (
                        <a key={a.id} onClick={blockInDemo} href={`/api/project_download.php?id=${a.id}`} className="block text-xs font-medium text-navy-2 hover:underline">
                          📎 {a.original_filename}
                        </a>
                      ))}
                    </div>
                  )}
                  {c.review_status === 'pending' && user?.role === 'admin' && (
                    <div className="mt-2 flex gap-3">
                      <button onClick={() => reviewComment(c.id, 'approve_ai_comment')} className="text-xs font-semibold text-navy-2 hover:underline">
                        Approve
                      </button>
                      <button onClick={() => reviewComment(c.id, 'discard_ai_comment')} className="text-xs font-semibold text-red-600 hover:underline">
                        Discard
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user && (
            <form onSubmit={handleSubmit} className="border-t border-line pt-3">
              {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={2}
                placeholder="Ask a question or leave a note…"
                className="w-full rounded-[10px] border border-line px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-navy-900/50 hover:text-accent-600">
                  {file ? file.name : '+ Attach a file'}
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
                </label>
                <button type="submit" disabled={submitting} className="rounded-md bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
