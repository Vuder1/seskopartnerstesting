import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PinnedFiles from '../../components/PinnedFiles.jsx'
import CommentThread from '../../components/CommentThread.jsx'
import InternalNotes from '../../components/InternalNotes.jsx'

const statusOptions = ['pending', 'in_progress', 'complete']
const projectStatusOptions = ['active', 'completed', 'on_hold']
const sourceSiteLabels = {
  'seskostudio.com': 'Studio',
  'seskoarchitecture.com': 'Architecture',
  other: 'Other',
}
const STATUS_DOT = { pending: 'bg-navy-900/25', in_progress: 'bg-accent-500', complete: 'bg-emerald-500' }
const STATUS_TEXT = { pending: 'text-navy-900/50', in_progress: 'text-navy-2', complete: 'text-emerald-600' }

function StatusDot({ status }) {
  return <span className={`h-2.5 w-2.5 flex-none rounded-full ${STATUS_DOT[status] || STATUS_DOT.pending}`} />
}

function ReorderButtons({ onMove, isFirst, isLast, size = 'text-sm' }) {
  return (
    <div className="flex flex-none flex-col gap-0.5">
      <button type="button" disabled={isFirst} onClick={(e) => { e.stopPropagation(); onMove(-1) }} className={`${size} leading-none text-navy-900/40 hover:text-accent-600 disabled:opacity-20`} title="Move up">▲</button>
      <button type="button" disabled={isLast} onClick={(e) => { e.stopPropagation(); onMove(1) }} className={`${size} leading-none text-navy-900/40 hover:text-accent-600 disabled:opacity-20`} title="Move down">▼</button>
    </div>
  )
}

async function post(action, fields, csrfToken) {
  const body = new FormData()
  body.append('action', action)
  Object.entries(fields).forEach(([k, v]) => body.append(k, v))
  await fetch('/api/admin/projects.php', {
    method: 'POST',
    body,
    headers: { 'X-CSRF-Token': csrfToken || '' },
  })
}

function SubstageRow({ substage, edit, onEditChange, dirty, csrfToken, onChanged, onMove, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(false)

  async function remove() {
    if (!confirm(`Remove substage "${substage.label}"?`)) return
    await post('delete_substage', { substage_id: substage.id }, csrfToken)
    onChanged()
  }

  const fileCount = (substage.files || []).length
  const commentCount = substage.comment_count || 0

  return (
    <div id={`substage-${substage.id}`} className={`scroll-mt-24 rounded-md border ${dirty ? 'border-amber-400 bg-amber-50' : 'border-line bg-surface-soft'}`}>
      <div role="button" tabIndex={0} onClick={() => setExpanded((v) => !v)} onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
        className="flex cursor-pointer items-center gap-2 px-3 py-2.5">
        <ReorderButtons onMove={onMove} isFirst={isFirst} isLast={isLast} size="text-xs" />
        <StatusDot status={edit.status} />
        <span className="text-sm font-medium text-navy-900">{edit.label}</span>
        <span className={`text-xs ${STATUS_TEXT[edit.status] || STATUS_TEXT.pending}`}>{edit.status.replace('_', ' ')}</span>
        {edit.note && <span className="flex-1 truncate text-xs italic text-navy-900/40">"{edit.note}"</span>}
        {!edit.note && <span className="flex-1" />}
        {(fileCount > 0 || commentCount > 0) && (
          <span className="flex-none text-xs text-navy-900/40">
            {fileCount > 0 && `${fileCount} file${fileCount > 1 ? 's' : ''}`}{fileCount > 0 && commentCount > 0 && ' · '}{commentCount > 0 && `${commentCount} comment${commentCount > 1 ? 's' : ''}`}
          </span>
        )}
        {dirty && <span className="flex-none rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Unsaved</span>}
        <span className="flex-none text-navy-900/30">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="border-t border-line px-3 pb-3 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={edit.label}
              onChange={(e) => onEditChange('label', e.target.value)}
              className="min-w-[160px] flex-1 rounded-[10px] border border-line px-3 py-1.5 text-sm font-medium focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
            <select value={edit.status} onChange={(e) => onEditChange('status', e.target.value)} className="rounded-[10px] border border-line bg-white px-2 py-1.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10">
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button onClick={remove} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
          </div>
          <input
            type="text"
            value={edit.note}
            onChange={(e) => onEditChange('note', e.target.value)}
            placeholder="Note visible to the client (optional)"
            className="mt-2 w-full rounded-[10px] border border-line px-3 py-1.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
          />

          <div className="mt-3 border-t border-line pt-3">
            <PinnedFiles substageId={substage.id} files={substage.files || []} csrfToken={csrfToken} isAdmin onChanged={onChanged} />
            <CommentThread substageId={substage.id} commentCount={substage.comment_count} />
          </div>
        </div>
      )}
    </div>
  )
}

function AssigneeChips({ project, csrfToken, onChanged }) {
  const assigned = project.assignees || []
  const available = (project.available_admins || []).filter((a) => !assigned.some((x) => x.id === a.id))

  async function assign(e) {
    const userId = e.target.value
    if (!userId) return
    await post('assign_user', { project_id: project.id, user_id: userId }, csrfToken)
    e.target.value = ''
    onChanged()
  }

  async function unassign(userId) {
    await post('unassign_user', { project_id: project.id, user_id: userId }, csrfToken)
    onChanged()
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-900/50">Assigned:</span>
      {assigned.length === 0 && <span className="text-xs text-navy-900/40">Nobody yet</span>}
      {assigned.map((a) => (
        <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-2.5 py-1 text-xs font-medium text-navy-2">
          {a.name}
          <button onClick={() => unassign(a.id)} aria-label={`Unassign ${a.name}`} className="text-navy-2/60 hover:text-accent-900">×</button>
        </span>
      ))}
      {available.length > 0 && (
        <select
          defaultValue=""
          onChange={assign}
          className="rounded-full border border-dashed border-navy-900/25 bg-white px-2.5 py-1 text-xs font-medium text-navy-900/50 focus:border-accent-500 focus:outline-none"
        >
          <option value="" disabled>+ Add staff…</option>
          {available.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      )}
    </div>
  )
}

function StageCard({ stage, edit, onEditChange, dirty, substageEdits, onSubstageEditChange, isSubstageDirty, csrfToken, onChanged, onMove, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(stage.status === 'in_progress')
  const [newSubstageLabel, setNewSubstageLabel] = useState('')

  async function remove() {
    if (!confirm(`Remove stage "${stage.label}"? This also removes its substages.`)) return
    await post('delete_stage', { stage_id: stage.id }, csrfToken)
    onChanged()
  }

  async function addSubstage(e) {
    e.preventDefault()
    if (!newSubstageLabel.trim()) return
    await post('add_substage', { stage_id: stage.id, label: newSubstageLabel }, csrfToken)
    setNewSubstageLabel('')
    onChanged()
  }

  async function moveSubstage(substage, direction) {
    const ids = stage.substages.map((s) => s.id)
    const i = ids.indexOf(substage.id)
    const j = i + direction
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    const body = new FormData()
    body.append('action', 'reorder_substages')
    body.append('stage_id', stage.id)
    ids.forEach((id) => body.append('substage_ids[]', id))
    await fetch('/api/admin/projects.php', { method: 'POST', body, headers: { 'X-CSRF-Token': csrfToken || '' } })
    onChanged()
  }

  const fileCount = (stage.files || []).length
  const commentCount = stage.comment_count || 0
  const substageCount = stage.substages.length

  return (
    <div id={`stage-${stage.id}`} className={`scroll-mt-24 rounded-lg border ${dirty ? 'border-amber-400 bg-amber-50/40' : 'border-line bg-white'}`}>
      <div role="button" tabIndex={0} onClick={() => setExpanded((v) => !v)} onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
        className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4">
        <ReorderButtons onMove={onMove} isFirst={isFirst} isLast={isLast} />
        <StatusDot status={edit.status} />
        <span className="text-base font-semibold text-navy-900">{edit.label}</span>
        <span className={`text-sm ${STATUS_TEXT[edit.status] || STATUS_TEXT.pending}`}>{edit.status.replace('_', ' ')}</span>
        {edit.note && <span className="max-w-xs flex-1 truncate text-sm italic text-navy-900/40">"{edit.note}"</span>}
        {!edit.note && <span className="flex-1" />}
        <span className="flex-none text-xs text-navy-900/40">
          {[
            fileCount > 0 && `${fileCount} file${fileCount > 1 ? 's' : ''}`,
            commentCount > 0 && `${commentCount} comment${commentCount > 1 ? 's' : ''}`,
            substageCount > 0 && `${substageCount} substage${substageCount > 1 ? 's' : ''}`,
          ].filter(Boolean).join(' · ')}
        </span>
        {dirty && <span className="flex-none rounded bg-amber-400 px-2 py-1 text-xs font-bold uppercase text-white">Unsaved</span>}
        <span className="flex-none text-lg text-navy-900/30">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={edit.label}
              onChange={(e) => onEditChange('label', e.target.value)}
              className="min-w-[200px] flex-1 rounded-[10px] border border-line px-3 py-2 text-base font-semibold text-navy-900 focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
            <button onClick={remove} className="flex-none text-sm font-semibold text-red-600 hover:underline">Remove</button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
            <select value={edit.status} onChange={(e) => onEditChange('status', e.target.value)} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10">
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <input
              type="text"
              value={edit.note}
              onChange={(e) => onEditChange('note', e.target.value)}
              placeholder="Note visible to the client (optional)"
              className="rounded-[10px] border border-line px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>

          <div className="mt-3 border-t border-line pt-3">
            <PinnedFiles stageId={stage.id} files={stage.files || []} csrfToken={csrfToken} isAdmin onChanged={onChanged} />
            <CommentThread stageId={stage.id} commentCount={stage.comment_count} />
          </div>

          {stage.substages.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-line pl-6 pt-4">
              {stage.substages.map((substage, i) => (
                <SubstageRow
                  key={substage.id}
                  substage={substage}
                  edit={substageEdits[substage.id] || { label: substage.label, status: substage.status, note: substage.note || '' }}
                  onEditChange={(field, value) => onSubstageEditChange(substage.id, field, value)}
                  dirty={isSubstageDirty(substage)}
                  csrfToken={csrfToken}
                  onChanged={onChanged}
                  onMove={(dir) => moveSubstage(substage, dir)}
                  isFirst={i === 0}
                  isLast={i === stage.substages.length - 1}
                />
              ))}
            </div>
          )}

          <form onSubmit={addSubstage} className="mt-3 flex flex-wrap gap-2 pl-6">
            <input
              type="text"
              value={newSubstageLabel}
              onChange={(e) => setNewSubstageLabel(e.target.value)}
              placeholder="New substage (e.g. Revision 1)"
              className="min-w-[200px] flex-1 rounded-[10px] border border-line px-3 py-1.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
            <button type="submit" className="rounded-md border border-navy/25 px-3 py-1.5 text-sm font-semibold text-navy-2 transition-colors hover:bg-navy-soft">
              + Add Substage
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function AdminProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStageLabel, setNewStageLabel] = useState('')
  const [stageEdits, setStageEdits] = useState({})
  const [substageEdits, setSubstageEdits] = useState({})
  const [saving, setSaving] = useState(false)
  const prevProjectRef = useRef(null)

  async function load() {
    const res = await fetch(`/api/admin/projects.php?id=${id}`)
    const data = await res.json()
    setProject(data.project || null)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!project) return
    const prev = prevProjectRef.current

    setStageEdits((prevEdits) => {
      const next = {}
      project.stages.forEach((stage) => {
        const prevStage = prev?.stages?.find((s) => s.id === stage.id)
        const current = prevEdits[stage.id]
        const wasDirty = current && prevStage && (
          current.label !== prevStage.label || current.status !== prevStage.status || (current.note || '') !== (prevStage.note || '')
        )
        next[stage.id] = wasDirty ? current : { label: stage.label, status: stage.status, note: stage.note || '' }
      })
      return next
    })

    setSubstageEdits((prevEdits) => {
      const next = {}
      project.stages.forEach((stage) => {
        const prevStage = prev?.stages?.find((s) => s.id === stage.id)
        stage.substages.forEach((sub) => {
          const prevSub = prevStage?.substages?.find((s) => s.id === sub.id)
          const current = prevEdits[sub.id]
          const wasDirty = current && prevSub && (
            current.label !== prevSub.label || current.status !== prevSub.status || (current.note || '') !== (prevSub.note || '')
          )
          next[sub.id] = wasDirty ? current : { label: sub.label, status: sub.status, note: sub.note || '' }
        })
      })
      return next
    })

    prevProjectRef.current = project
  }, [project])

  function isStageDirty(stage) {
    const e = stageEdits[stage.id]
    if (!e) return false
    return e.label !== stage.label || e.status !== stage.status || (e.note || '') !== (stage.note || '')
  }

  function isSubstageDirty(sub) {
    const e = substageEdits[sub.id]
    if (!e) return false
    return e.label !== sub.label || e.status !== sub.status || (e.note || '') !== (sub.note || '')
  }

  const dirtyCount = project
    ? project.stages.filter(isStageDirty).length + project.stages.reduce((n, s) => n + s.substages.filter(isSubstageDirty).length, 0)
    : 0

  async function saveAll() {
    const edits = { stages: {}, substages: {} }
    project.stages.forEach((stage) => {
      if (isStageDirty(stage)) edits.stages[stage.id] = stageEdits[stage.id]
      stage.substages.forEach((sub) => {
        if (isSubstageDirty(sub)) edits.substages[sub.id] = substageEdits[sub.id]
      })
    })
    if (Object.keys(edits.stages).length === 0 && Object.keys(edits.substages).length === 0) return

    setSaving(true)
    const body = new FormData()
    body.append('action', 'bulk_save_stages')
    body.append('edits', JSON.stringify(edits))
    await fetch('/api/admin/projects.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    setSaving(false)
    load()
  }

  async function addStage(e) {
    e.preventDefault()
    if (!newStageLabel.trim()) return
    await post('add_stage', { project_id: id, label: newStageLabel }, csrfToken)
    setNewStageLabel('')
    load()
  }

  async function moveStage(stage, direction) {
    const ids = project.stages.map((s) => s.id)
    const i = ids.indexOf(stage.id)
    const j = i + direction
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    const body = new FormData()
    body.append('action', 'reorder_stages')
    body.append('project_id', id)
    ids.forEach((sid) => body.append('stage_ids[]', sid))
    await fetch('/api/admin/projects.php', { method: 'POST', body, headers: { 'X-CSRF-Token': csrfToken || '' } })
    load()
  }

  async function updateProjectStatus(status) {
    await post('update_project_status', { project_id: id, status }, csrfToken)
    load()
  }

  async function approveAiProject() {
    await post('approve_ai_project', { project_id: id }, csrfToken)
    load()
  }

  async function discardAiProject() {
    if (!confirm(`Discard the AI-drafted project "${project.name}"? This cannot be undone.`)) return
    await post('discard_ai_project', { project_id: id }, csrfToken)
    navigate('/admin/projects')
  }

  if (loading) return <p className="text-sm text-navy-900/50">Loading…</p>
  if (!project) return <p className="text-sm text-navy-900/50">Project not found.</p>

  return (
    <div>
      <NavLink to="/admin/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-2 hover:underline">
        <span aria-hidden="true">&larr;</span> Back to Projects
      </NavLink>

      {project.ai_review_status === 'pending' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            This project was created by AI from an inbound email and is not visible to the client yet. Review it, then approve or discard.
          </p>
          <div className="flex flex-none gap-2">
            <button onClick={approveAiProject} className="btn-primary">Approve</button>
            <button onClick={discardAiProject} className="btn-outline-dark">Discard</button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-heading">{project.name}</h2>
          <p className="mt-1 text-sm text-navy-900/60">
            {project.firm_name}{project.reference_code ? ` · Ref: ${project.reference_code}` : ''}
            {project.source_site && ` · ${sourceSiteLabels[project.source_site] || project.source_site}`}
          </p>
        </div>
        <select
          value={project.status}
          onChange={(e) => updateProjectStatus(e.target.value)}
          className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
        >
          {projectStatusOptions.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <AssigneeChips project={project} csrfToken={csrfToken} onChanged={load} />

      <InternalNotes projectId={project.id} />

      {(project.description || (project.files && project.files.length > 0)) && (
        <div className="mt-4 rounded-panel border border-line bg-surface-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-900/50">Request Details</p>
          {project.description && <p className="mt-2 whitespace-pre-wrap text-sm text-navy-900/80">{project.description}</p>}
          {project.files && project.files.length > 0 && (
            <div className="mt-3">
              <PinnedFiles projectId={project.id} files={project.files} csrfToken={csrfToken} isAdmin onChanged={load} />
            </div>
          )}
        </div>
      )}

      <div className="sticky top-0 z-10 mt-6 flex items-center justify-between rounded-panel border border-line bg-white/95 px-4 py-3 shadow-panel backdrop-blur">
        <p className="text-sm text-navy-900/60">
          {dirtyCount > 0 ? `${dirtyCount} unsaved change${dirtyCount > 1 ? 's' : ''}` : 'Edit labels, statuses, and notes below, then save all at once.'}
        </p>
        <button
          onClick={saveAll}
          disabled={dirtyCount === 0 || saving}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {project.stages.map((stage, i) => (
          <StageCard
            key={stage.id}
            stage={stage}
            edit={stageEdits[stage.id] || { label: stage.label, status: stage.status, note: stage.note || '' }}
            onEditChange={(field, value) => setStageEdits((prev) => ({ ...prev, [stage.id]: { ...prev[stage.id], [field]: value } }))}
            dirty={isStageDirty(stage)}
            substageEdits={substageEdits}
            onSubstageEditChange={(subId, field, value) => setSubstageEdits((prev) => ({ ...prev, [subId]: { ...prev[subId], [field]: value } }))}
            isSubstageDirty={isSubstageDirty}
            csrfToken={csrfToken}
            onChanged={load}
            onMove={(dir) => moveStage(stage, dir)}
            isFirst={i === 0}
            isLast={i === project.stages.length - 1}
          />
        ))}
      </div>

      <form onSubmit={addStage} className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={newStageLabel}
          onChange={(e) => setNewStageLabel(e.target.value)}
          placeholder="New stage label"
          className="min-w-[240px] flex-1 rounded-[10px] border border-line px-4 py-2.5 text-sm focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
        />
        <button type="submit" className="btn-primary">Add Stage</button>
      </form>
    </div>
  )
}
