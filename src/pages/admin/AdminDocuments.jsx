import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Tabs } from '../../components/ui.jsx'

const categories = [
  { value: 'download_center', label: 'Download Center' },
  { value: 'technical_specs', label: 'Technical Specs' },
]

function UploadForm({ category, firms, csrfToken, onUploaded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [firmIds, setFirmIds] = useState([])
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function toggleFirm(id) {
    setFirmIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Choose a file to upload.')
      return
    }
    setSubmitting(true)
    setError('')

    const body = new FormData()
    body.append('action', 'upload')
    body.append('category', category)
    body.append('title', title)
    body.append('description', description)
    body.append('is_public', isPublic ? '1' : '0')
    if (!isPublic) firmIds.forEach((id) => body.append('firm_ids[]', id))
    body.append('file', file)

    try {
      const res = await fetch('/api/admin/documents.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setTitle('')
        setDescription('')
        setIsPublic(true)
        setFirmIds([])
        setFile(null)
        e.target.reset()
        onUploaded()
      } else {
        setError(data.error || 'Upload failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-panel border border-line bg-white p-6">
      {error && <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">File</label>
          <input type="file" required onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-[10px] border border-line bg-white px-4 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-navy-900">Description</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Visible to all approved partners
        </label>
      </div>

      {!isPublic && (
        <div>
          <p className="mb-2 text-sm font-medium text-navy-900">Restrict to firms</p>
          <div className="flex flex-wrap gap-2">
            {firms.map((firm) => (
              <label key={firm.id} className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${firmIds.includes(firm.id) ? 'border-accent-500 bg-navy-soft text-navy-2' : 'border-navy-900/20 text-navy-900/70'}`}>
                <input type="checkbox" className="hidden" checked={firmIds.includes(firm.id)} onChange={() => toggleFirm(firm.id)} />
                {firm.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Uploading…' : 'Upload Document'}
      </button>
    </form>
  )
}

export default function AdminDocuments() {
  const { csrfToken } = useAuth()
  const [category, setCategory] = useState('download_center')
  const [docs, setDocs] = useState([])
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [docsRes, firmsRes] = await Promise.all([
        fetch(`/api/admin/documents.php?category=${category}`),
        fetch('/api/admin/firms.php'),
      ])
      const docsData = await docsRes.json()
      const firmsData = await firmsRes.json()
      setDocs(docsData.documents || [])
      setFirms(firmsData.firms || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  async function handleDelete(id) {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const body = new FormData()
    body.append('action', 'delete')
    body.append('document_id', id)
    await fetch('/api/admin/documents.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    load()
  }

  return (
    <div>
      <Tabs value={category} onChange={setCategory} items={categories.map((c) => ({ key: c.value, label: c.label }))} />

      <div className="mt-6">
        <UploadForm category={category} firms={firms} csrfToken={csrfToken} onUploaded={load} />
      </div>

      <div className="mt-8 overflow-hidden rounded-panel border border-line bg-white">
        {loading ? (
          <p className="p-6 text-sm text-navy-900/50">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="p-6 text-sm text-navy-900/50">No documents in this category yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-soft text-navy-900/60">
              <tr>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Visibility</th>
                <th className="px-6 py-3 font-semibold">Uploaded</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-navy-900">{doc.title}</p>
                    {doc.description && <p className="text-xs text-navy-900/50">{doc.description}</p>}
                  </td>
                  <td className="px-6 py-3 text-navy-900/60">
                    {Number(doc.is_public) === 1 ? 'All partners' : (doc.firm_names || 'No firms assigned')}
                  </td>
                  <td className="px-6 py-3 text-navy-900/60">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => handleDelete(doc.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
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
