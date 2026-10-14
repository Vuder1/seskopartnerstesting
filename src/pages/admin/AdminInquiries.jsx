import { useEffect, useState } from 'react'
import { blockInDemo } from '../../demo/demoConfig.js'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Tabs } from '../../components/ui.jsx'

const statusTabs = ['new', 'converted', 'archived', 'all']

const sourceLabels = {
  'seskostudio.com': 'seskostudio.com',
  'seskoarchitecture.com': 'seskoarchitecture.com',
  other: 'Other',
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function InquiryStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/inquiries.php?stats=1')
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  if (!stats) return null

  const byStatus = Object.fromEntries((stats.by_status || []).map((r) => [r.status, r.c]))
  const newCount = byStatus.new || 0
  const converted = byStatus.converted || 0
  const archived = byStatus.archived || 0
  const total = newCount + converted + archived
  const reviewed = converted + archived
  const conversionRate = reviewed > 0 ? Math.round((converted / reviewed) * 100) : null

  const bySource = Object.fromEntries((stats.by_source || []).map((r) => [r.source_site, r.c]))

  const cards = [
    { label: 'Total inquiries', value: total },
    { label: 'New', value: newCount },
    { label: 'Converted', value: converted },
    { label: 'Archived', value: archived },
    { label: 'Conversion rate (of reviewed)', value: conversionRate !== null ? `${conversionRate}%` : '—' },
    { label: 'Avg. days to convert', value: stats.avg_days_to_convert !== null ? stats.avg_days_to_convert : '—' },
  ]

  return (
    <div className="mt-6 rounded-panel border border-line bg-white p-5 shadow-panel">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label}>
            <p className="text-2xl font-bold text-navy-900">{c.value}</p>
            <p className="mt-0.5 text-xs text-navy-900/50">{c.label}</p>
          </div>
        ))}
      </div>
      {Object.keys(bySource).length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-900/40">By source:</span>
          {Object.entries(bySource).map(([site, c]) => (
            <span key={site} className="rounded-md bg-navy-900/5 px-2.5 py-1 text-xs font-medium text-navy-900/60">
              {sourceLabels[site] || site}: {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ConvertForm({ inquiry, firms, csrfToken, onDone }) {
  const [firmId, setFirmId] = useState('')
  const [newFirmName, setNewFirmName] = useState(inquiry.company || inquiry.name)
  const [name, setName] = useState(`Inquiry from ${inquiry.name}`)
  const [referenceCode, setReferenceCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const body = new FormData()
    body.append('action', 'convert_to_project')
    body.append('id', inquiry.id)
    if (firmId) {
      body.append('firm_id', firmId)
    } else {
      body.append('new_firm_name', newFirmName)
    }
    body.append('name', name)
    body.append('reference_code', referenceCode)

    try {
      const res = await fetch('/api/admin/inquiries.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        onDone(data.project_id)
      } else {
        setError(data.error || 'Could not convert this inquiry.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-line pt-4">
      {error && <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Existing firm</label>
          <select value={firmId} onChange={(e) => setFirmId(e.target.value)} className="w-full rounded-[10px] border border-line bg-white px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10">
            <option value="">— New firm —</option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>{firm.name}</option>
            ))}
          </select>
        </div>
        {!firmId && (
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">New firm name</label>
            <input type="text" value={newFirmName} onChange={(e) => setNewFirmName(e.target.value)} className="w-full rounded-[10px] border border-line px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Project name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-[10px] border border-line px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Reference code (optional)</label>
          <input type="text" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} className="w-full rounded-[10px] border border-line px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
      </div>

      <p className="text-xs text-navy-900/50">
        Creates the project with the standard six-stage template. You can edit stages afterward from the project page.
      </p>

      <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Creating…' : 'Create Project'}
      </button>
    </form>
  )
}

export default function AdminInquiries() {
  const { csrfToken } = useAuth()
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState([])
  const [firms, setFirms] = useState([])
  const [status, setStatus] = useState('new')
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(null)
  const [statsKey, setStatsKey] = useState(0)

  async function load() {
    setLoading(true)
    try {
      const [inquiriesRes, firmsRes] = await Promise.all([
        fetch(`/api/admin/inquiries.php?status=${status}`),
        fetch('/api/admin/firms.php'),
      ])
      const inquiriesData = await inquiriesRes.json()
      const firmsData = await firmsRes.json()
      setInquiries(inquiriesData.inquiries || [])
      setFirms(firmsData.firms || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    setConverting(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function handleArchive(inquiry) {
    if (!confirm(`Archive the inquiry from "${inquiry.name}"?`)) return
    const body = new FormData()
    body.append('action', 'archive')
    body.append('id', inquiry.id)
    await fetch('/api/admin/inquiries.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    setStatsKey((k) => k + 1)
    load()
  }

  return (
    <div>
      <InquiryStats key={statsKey} />

      <Tabs className="mt-6" value={status} onChange={setStatus} items={statusTabs.map((k) => ({ key: k, label: k }))} />

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-navy-900/50">Loading…</p>
        ) : inquiries.length === 0 ? (
          <p className="rounded-md border border-dashed border-navy-900/20 bg-navy-900/[0.03] px-4 py-8 text-center text-sm text-navy-900/50">
            No {status !== 'all' ? status : ''} inquiries.
          </p>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-panel border border-line bg-white p-5 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-900">
                    {inquiry.name}
                    {inquiry.company ? ` · ${inquiry.company}` : ''}
                  </p>
                  <p className="mt-0.5 text-sm text-navy-900/50">
                    <a href={`mailto:${inquiry.email}`} className="hover:text-accent-600">{inquiry.email}</a>
                    {inquiry.phone ? ` · ${inquiry.phone}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-navy-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-900/60">
                    {sourceLabels[inquiry.source_site] || inquiry.source_site}
                  </span>
                  <span className="text-xs text-navy-900/40">{new Date(inquiry.created_at).toLocaleString()}</span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-navy-900/80">{inquiry.message}</p>

              {inquiry.attachments && inquiry.attachments.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {inquiry.attachments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-line bg-navy-900/[0.03] px-3 py-2 text-sm">
                      <a onClick={blockInDemo} href={`/api/admin/inquiry_download.php?id=${a.id}`} className="flex-1 truncate font-medium text-navy-2 hover:underline">
                        {a.original_filename}
                      </a>
                      <span className="flex-none text-xs text-navy-900/40">{formatSize(a.file_size)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {inquiry.status === 'new' && (
                <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
                  <button
                    onClick={() => setConverting(converting === inquiry.id ? null : inquiry.id)}
                    className="text-sm font-semibold text-navy-2 hover:underline"
                  >
                    {converting === inquiry.id ? 'Cancel' : 'Convert to Project'}
                  </button>
                  <button onClick={() => handleArchive(inquiry)} className="text-sm font-semibold text-red-600 hover:underline">
                    Archive
                  </button>
                </div>
              )}

              {inquiry.status === 'converted' && inquiry.converted_project_id && (
                <p className="mt-4 border-t border-line pt-4 text-sm text-navy-900/50">
                  Converted to{' '}
                  <NavLink to={`/admin/projects/${inquiry.converted_project_id}`} className="font-semibold text-navy-2 hover:underline">
                    project #{inquiry.converted_project_id}
                  </NavLink>
                  .
                </p>
              )}

              {converting === inquiry.id && (
                <ConvertForm
                  inquiry={inquiry}
                  firms={firms}
                  csrfToken={csrfToken}
                  onDone={(projectId) => navigate(`/admin/projects/${projectId}`)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
