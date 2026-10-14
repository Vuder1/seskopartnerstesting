import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { EmptyState, ProgressBar, ProjectStatusPill } from '../../components/ui.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'

export default function ProjectTracker() {
  const { ui } = useLocale()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects.php')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader eyebrow="Project tracker" title={ui.nav.projects} subtitle={ui.trackerSub} />

      <section className="panel p-5">
        <p className="eyebrow">{ui.dash.projectsEyebrow}</p>
        <h2 className="mt-1 text-[17px] font-extrabold tracking-[-0.03em] text-navy">{ui.dash.projectsTitle}</h2>

        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted">Loading…</p>
          ) : projects.length === 0 ? (
            <EmptyState>{ui.dash.noProjects}</EmptyState>
          ) : (
            projects.map((project) => (
              <NavLink key={project.id} to={`/portal/projects/${project.id}`} className="list-row !py-4">
                <span className="icon-tile"><Icon name="building" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-navy">{project.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-2">
                    {project.reference_code ? `Ref ${project.reference_code} · ` : ''}{ui.dash.current}: <strong className="font-bold text-navy-700">{project.current_stage}</strong>
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <ProgressBar value={Number(project.stage_complete)} total={Number(project.stage_total)} className="max-w-[320px]" />
                    <span className="text-[10px] font-semibold text-muted-2">{project.stage_complete} / {project.stage_total}</span>
                  </div>
                </div>
                <ProjectStatusPill status={project.status} />
                <Icon name="chevron" className="h-4 w-4 flex-none text-muted-2" />
              </NavLink>
            ))
          )}
        </div>
      </section>
    </>
  )
}
