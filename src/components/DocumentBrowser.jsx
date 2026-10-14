import { useEffect, useState } from 'react'
import { blockInDemo } from '../demo/demoConfig.js'
import Icon from './Icon.jsx'
import PageHeader from './PageHeader.jsx'
import { EmptyState, FileTile, SearchInput } from './ui.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

const sortOptions = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'title_asc', label: 'Title (A–Z)' },
  { value: 'title_desc', label: 'Title (Z–A)' },
]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Matches download.php's own $previewableTypes - only types a browser renders
// natively in its own sandboxed viewer get a Preview link.
const PREVIEWABLE_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'video/mp4']

export default function DocumentBrowser({ category, eyebrow, title, subtitle, icon = 'download' }) {
  const { ui } = useLocale()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date_desc')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    const params = new URLSearchParams({ category, sort })
    if (search) params.set('search', search)

    fetch(`/api/documents.php?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setDocs(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [category, search, sort])

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <section className="panel p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder={ui.docsSearch} className="min-w-[220px] flex-1" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-[10px] border border-line bg-white px-3 text-[13px] font-semibold text-navy focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted">Loading…</p>
          ) : docs.length === 0 ? (
            <EmptyState>{search ? 'No documents match your search.' : 'No documents available yet. Check back soon.'}</EmptyState>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="list-row flex-wrap sm:flex-nowrap">
                <FileTile name={doc.original_filename || doc.title} mime={doc.mime_type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-navy">{doc.title}</p>
                  {doc.description && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">{doc.description}</p>}
                  <p className="mt-0.5 text-[10px] text-muted-2">{formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-none items-center gap-2">
                  {PREVIEWABLE_MIME_TYPES.includes(doc.mime_type) && (
                    <a
                      onClick={blockInDemo}
                      href={`/api/download.php?id=${doc.id}&inline=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-dark !px-3.5 !py-2"
                    >
                      <Icon name="eye" className="h-4 w-4" /> Preview
                    </a>
                  )}
                  <a onClick={blockInDemo} href={`/api/download.php?id=${doc.id}`} className="btn-primary !px-3.5 !py-2 !shadow-none">
                    <Icon name={icon} className="h-4 w-4" /> Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}
