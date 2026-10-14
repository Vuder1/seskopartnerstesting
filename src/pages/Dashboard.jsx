import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import InquiryForm from '../components/InquiryForm.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { EmptyState, ProgressBar, ProjectStatusPill } from '../components/ui.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

function StatCard({ icon, value, label, note }) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="icon-tile"><Icon name={icon} /></span>
        <span className="pt-1 text-right text-[10px] text-muted-2">{note}</span>
      </div>
      <p className="mt-5 text-[30px] font-extrabold leading-none tracking-[-0.045em] text-navy">{value ?? '–'}</p>
      <p className="mt-1.5 text-[11px] text-muted">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { t, ui } = useLocale()
  const d = ui.dash
  const [projects, setProjects] = useState(null)
  const [docCount, setDocCount] = useState(null)
  const [specCount, setSpecCount] = useState(null)

  useEffect(() => {
    const json = (url) => fetch(url).then((r) => r.json()).catch(() => ({}))
    json('/api/projects.php').then((data) => setProjects(data.projects || []))
    json('/api/documents.php?category=download_center').then((data) => setDocCount((data.documents || []).length))
    json('/api/documents.php?category=technical_specs').then((data) => setSpecCount((data.documents || []).length))
  }, [])

  const active = (projects || []).filter((p) => p.status !== 'completed')
  const stageDone = (projects || []).reduce((n, p) => n + Number(p.stage_complete || 0), 0)
  const stageTotal = (projects || []).reduce((n, p) => n + Number(p.stage_total || 0), 0)
  const cards = t.portal.cards
  const quick = [
    { to: '/documents', icon: 'download', title: cards[0].title, desc: cards[0].desc },
    { to: '/specs', icon: 'specs', title: cards[1].title, desc: cards[1].desc },
    { to: '/portal', icon: 'projects', title: cards[2].title, desc: cards[2].desc },
  ]

  return (
    <>
      <PageHeader eyebrow={d.eyebrow} title={d.title} subtitle={d.sub} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon="projects" value={projects ? active.length : null} label={d.kpi.projects} note={d.kpiNote.projects} />
        <StatCard icon="check" value={projects ? `${stageDone} / ${stageTotal}` : null} label={d.kpi.stages} note={d.kpiNote.stages} />
        <StatCard icon="file" value={docCount} label={d.kpi.docs} note={d.kpiNote.docs} />
        <StatCard icon="specs" value={specCount} label={d.kpi.specs} note={d.kpiNote.specs} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="panel p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{d.projectsEyebrow}</p>
              <h2 className="mt-1 text-[17px] font-extrabold tracking-[-0.03em] text-navy">{d.projectsTitle}</h2>
            </div>
            <NavLink to="/portal" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-navy hover:text-accent-600">
              {d.viewAll} <Icon name="arrow" className="h-3.5 w-3.5" />
            </NavLink>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {projects === null ? (
              <p className="py-6 text-center text-sm text-muted">Loading…</p>
            ) : projects.length === 0 ? (
              <EmptyState>{d.noProjects}</EmptyState>
            ) : (
              projects.slice(0, 5).map((p) => (
                <NavLink key={p.id} to={`/portal/projects/${p.id}`} className="list-row">
                  <span className="icon-tile"><Icon name="building" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-navy">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-2">
                      {p.reference_code ? `${p.reference_code} · ` : ''}{d.current}: {p.current_stage}
                    </p>
                    <ProgressBar value={Number(p.stage_complete)} total={Number(p.stage_total)} className="mt-2 max-w-[220px]" />
                  </div>
                  <div className="hidden text-right sm:block">
                    <ProjectStatusPill status={p.status} />
                    <p className="mt-1.5 text-[10px] text-muted-2">{p.stage_complete} / {p.stage_total}</p>
                  </div>
                  <Icon name="chevron" className="h-4 w-4 flex-none text-muted-2" />
                </NavLink>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <p className="eyebrow">{d.quickEyebrow}</p>
          <h2 className="mt-1 text-[17px] font-extrabold tracking-[-0.03em] text-navy">{d.quickTitle}</h2>
          <div className="mt-4 grid grid-cols-1 gap-2.5">
            {quick.map((q) => (
              <NavLink key={q.to} to={q.to} className="list-row items-start">
                <span className="icon-tile"><Icon name={q.icon} /></span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-navy">{q.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">{q.desc}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      </div>

      <section id="inquiry" className="panel mt-5 scroll-mt-6 p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <p className="eyebrow-accent">{t.portal.inquiryEyebrow}</p>
            <h2 className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.04em] text-navy">{t.portal.inquiryHeading}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">{t.portal.inquiryP}</p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  )
}
