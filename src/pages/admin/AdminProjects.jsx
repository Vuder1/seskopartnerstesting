import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const sourceSiteLabels = {
  'seskostudio.com': 'Studio',
  'seskoarchitecture.com': 'Architecture',
  other: 'Other',
}

const DEFAULT_STAGES = [
  'Project Started',
  'Quotation',
  'Materials Order',
  'In Production',
  'In Delivery',
  'Delivered',
]

function CreateProjectForm({ firms, csrfToken, onCreated }) {
  const [firmId, setFirmId] = useState('')
  const [name, setName] = useState('')
  const [referenceCode, setReferenceCode] = useState('')
  const [stages, setStages] = useState(DEFAULT_STAGES)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateStage(i, value) {
    setStages((prev) => prev.map((s, idx) => (idx === i ? value : s)))
  }

  function addStageField() {
    setStages((prev) => [...prev, ''])
  }

  function removeStageField(i) {
    setStages((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanStages = stages.map((s) => s.trim()).filter(Boolean)
    if (!firmId || !name.trim() || cleanStages.length === 0) {
      setError('Firm, project name, and at least one stage are required.')
      return
    }
    setSubmitting(true)
    setError('')

    const body = new FormData()
    body.append('action', 'create')
    body.append('firm_id', firmId)
    body.append('name', name)
    body.append('reference_code', referenceCode)
    cleanStages.forEach((s) => body.append('stage_labels[]', s))

    try {
      const res = await fetch('/api/admin/projects.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setFirmId('')
        setName('')
        setReferenceCode('')
        setStages(DEFAULT_STAGES)
        onCreated()
      } else {
        setError(data.error || 'Could not create project.')
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
          <label className="mb-1 block text-sm font-medium text-navy-900">Firm</label>
          <select value={firmId} onChange={(e) => setFirmId(e.target.value)} className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10">
            <option value="">Select a firm…</option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>{firm.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Project name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-900">Reference code (optional)</label>
          <input type="text" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} className="w-full rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-navy-900">Project stages (in order)</p>
        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 flex-none text-sm text-navy-900/40">{i + 1}.</span>
              <input
                type="text"
                value={stage}
                onChange={(e) => updateStage(i, e.target.value)}
                placeholder="e.g. Order Confirmed"
                className="w-full rounded-[10px] border border-line px-4 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
              />
              {stages.length > 1 && (
                <button type="button" onClick={() => removeStageField(i)} className="flex-none text-sm text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addStageField} className="mt-2 text-sm font-semibold text-navy-2 hover:underline">
          + Add another stage
        </button>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Creating…' : 'Create Project'}
      </button>
    </form>
  )
}

export default function AdminProjects() {
  const { csrfToken } = useAuth()
  const [projects, setProjects] = useState([])
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [projectsRes, firmsRes] = await Promise.all([
        fetch('/api/admin/projects.php'),
        fetch('/api/admin/firms.php'),
      ])
      const projectsData = await projectsRes.json()
      const firmsData = await firmsRes.json()
      setProjects(projectsData.projects || [])
      setFirms(firmsData.firms || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(e, project) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Remove project "${project.name}"? This also permanently deletes its stages, files, and conversations. This cannot be undone.`)) return
    const body = new FormData()
    body.append('action', 'delete_project')
    body.append('project_id', project.id)
    await fetch('/api/admin/projects.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    load()
  }

  async function handleAiAction(e, project, action) {
    e.preventDefault()
    e.stopPropagation()
    if (action === 'discard_ai_project' && !confirm(`Discard the AI-drafted project "${project.name}"? This cannot be undone.`)) return
    const body = new FormData()
    body.append('action', action)
    body.append('project_id', project.id)
    await fetch('/api/admin/projects.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button onClick={() => setCreating((v) => !v)} className={creating ? 'btn-outline-dark' : 'btn-primary'}>
          {creating ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {creating && (
        <div className="mt-6">
          <CreateProjectForm firms={firms} csrfToken={csrfToken} onCreated={() => { setCreating(false); load() }} />
        </div>
      )}

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-navy-900/50">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-navy-900/50">No projects yet.</p>
        ) : (
          projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/admin/projects/${project.id}`}
              className="block rounded-panel border border-line bg-white p-5 shadow-panel transition-colors hover:border-navy/25"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900">{project.name}</p>
                  <p className="text-sm text-navy-900/50">{project.firm_name}{project.reference_code ? ` · Ref: ${project.reference_code}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {project.ai_review_status === 'pending' && (
                    <span className="rounded-md bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Pending Review (AI)
                    </span>
                  )}
                  {project.source_site && (
                    <span className="rounded-md bg-navy-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-900/50">
                      {sourceSiteLabels[project.source_site] || project.source_site}
                    </span>
                  )}
                  <span className="rounded-md bg-navy-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-2">
                    {project.status}
                  </span>
                  {project.ai_review_status === 'pending' && (
                    <>
                      <button onClick={(e) => handleAiAction(e, project, 'approve_ai_project')} className="text-sm font-semibold text-navy-2 hover:underline">
                        Approve
                      </button>
                      <button onClick={(e) => handleAiAction(e, project, 'discard_ai_project')} className="text-sm font-semibold text-red-600 hover:underline">
                        Discard
                      </button>
                    </>
                  )}
                  <button onClick={(e) => handleDelete(e, project)} className="text-sm font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </NavLink>
          ))
        )}
      </div>
    </div>
  )
}
