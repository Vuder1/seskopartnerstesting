import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CommentThread from '../../components/CommentThread.jsx'
import Icon from '../../components/Icon.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import PinnedFiles from '../../components/PinnedFiles.jsx'
import { BackLink, ProgressBar, ProjectStatusPill, StagePill } from '../../components/ui.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'

const marker = {
  complete: 'border-navy bg-navy text-white',
  in_progress: 'border-accent-500 bg-white text-navy-2 ring-4 ring-accent-500/15',
  pending: 'border-line bg-white text-muted-2',
}

function Marker({ status, size = 'h-8 w-8', dot = 'h-2.5 w-2.5', check = 'h-4 w-4' }) {
  return (
    <span className={`absolute left-0 top-0 flex items-center justify-center rounded-full border-2 ${size} ${marker[status]}`}>
      {status === 'complete' ? <Icon name="check" className={check} stroke={2.4} /> : status === 'in_progress' ? <span className={`block rounded-full bg-accent-500 ${dot}`} /> : null}
    </span>
  )
}

function Substage({ substage, isLast }) {
  return (
    <li id={`substage-${substage.id}`} className="relative scroll-mt-24 pb-5 pl-9 last:pb-0">
      {!isLast && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${substage.status === 'complete' ? 'bg-navy' : 'bg-line'}`} />}
      <Marker status={substage.status} size="h-6 w-6" dot="h-1.5 w-1.5" check="h-3 w-3" />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-bold text-navy">{substage.label}</p>
        <StagePill status={substage.status} />
        <span className="text-[10px] text-muted-2">{new Date(substage.updated_at).toLocaleDateString()}</span>
      </div>
      {substage.note && <p className="mt-1.5 text-[13px] text-muted">{substage.note}</p>}
      {substage.files && substage.files.length > 0 && (
        <div className="mt-2">
          <PinnedFiles substageId={substage.id} files={substage.files} isAdmin={false} onChanged={() => {}} />
        </div>
      )}
      <CommentThread substageId={substage.id} commentCount={substage.comment_count} />
    </li>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { ui } = useLocale()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/project.php?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setProject(data.project)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!project || !window.location.hash) return
    const el = document.getElementById(window.location.hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [project])

  const done = project ? project.stages.filter((s) => s.status === 'complete').length : 0
  const total = project ? project.stages.length : 0

  return (
    <>
      <BackLink to="/portal">{ui.nav.projects}</BackLink>
      <PageHeader
        eyebrow={project?.reference_code ? `Ref ${project.reference_code}` : 'Project'}
        title={project ? project.name : 'Project'}
        actions={project && <ProjectStatusPill status={project.status} />}
      />

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="panel p-5 sm:p-6">
            <p className="eyebrow">Timeline</p>
            <h2 className="mb-6 mt-1 text-[17px] font-extrabold tracking-[-0.03em] text-navy">Project progress</h2>
            <ol className="relative">
              {project.stages.map((stage, i) => (
                <li key={stage.id} id={`stage-${stage.id}`} className="relative scroll-mt-24 pb-9 pl-12 last:pb-0">
                  {i < project.stages.length - 1 && (
                    <span className={`absolute left-[15px] top-8 h-full w-0.5 ${stage.status === 'complete' ? 'bg-navy' : 'bg-line'}`} />
                  )}
                  <Marker status={stage.status} />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[15px] font-extrabold tracking-[-0.02em] text-navy">{stage.label}</p>
                    <StagePill status={stage.status} />
                    <span className="text-[10px] text-muted-2">{new Date(stage.updated_at).toLocaleDateString()}</span>
                  </div>
                  {stage.note && <p className="mt-2 text-[13px] leading-relaxed text-muted">{stage.note}</p>}
                  {stage.files && stage.files.length > 0 && (
                    <div className="mt-2.5">
                      <PinnedFiles stageId={stage.id} files={stage.files} isAdmin={false} onChanged={() => {}} />
                    </div>
                  )}
                  <CommentThread stageId={stage.id} commentCount={stage.comment_count} />

                  {stage.substages && stage.substages.length > 0 && (
                    <ol className="relative mt-4 rounded-xl border border-line bg-surface-soft p-4">
                      {stage.substages.map((substage, j) => (
                        <Substage key={substage.id} substage={substage} isLast={j === stage.substages.length - 1} />
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <aside className="space-y-5">
            <section className="panel p-5">
              <p className="eyebrow">Summary</p>
              <p className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.045em] text-navy">{done} / {total}</p>
              <p className="mt-1.5 text-[11px] text-muted">stages complete</p>
              <ProgressBar value={done} total={total} className="mt-3" />
              <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[12px]">
                <div className="flex justify-between gap-3"><dt className="text-muted-2">Status</dt><dd className="font-bold text-navy"><ProjectStatusPill status={project.status} /></dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-2">Created</dt><dd className="font-bold text-navy">{new Date(project.created_at).toLocaleDateString()}</dd></div>
                {project.reference_code && <div className="flex justify-between gap-3"><dt className="text-muted-2">Reference</dt><dd className="font-bold text-navy">{project.reference_code}</dd></div>}
              </dl>
            </section>

            {(project.description || (project.files && project.files.length > 0)) && (
              <section className="panel p-5">
                <p className="eyebrow">Request details</p>
                {project.description && <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-navy-700">{project.description}</p>}
                {project.files && project.files.length > 0 && (
                  <div className="mt-3">
                    <PinnedFiles projectId={project.id} files={project.files} isAdmin={false} onChanged={() => {}} />
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
