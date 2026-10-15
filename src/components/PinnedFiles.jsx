import { useState } from 'react'
import { blockInDemo } from '../demo/demoConfig.js'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PinnedFiles({ projectId, stageId, substageId, files, csrfToken, isAdmin, onChanged }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    const body = new FormData()
    body.append('action', 'upload_stage_file')
    if (substageId) body.append('substage_id', substageId)
    else if (stageId) body.append('stage_id', stageId)
    else body.append('project_id', projectId)
    body.append('file', file)
    try {
      const res = await fetch('/api/admin/projects.php', {
        method: 'POST',
        body,
        headers: { 'X-CSRF-Token': csrfToken || '' },
      })
      const data = await res.json()
      if (res.ok) {
        onChanged()
      } else {
        setError(data.error || 'Upload failed.')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(attachmentId) {
    if (!confirm('Remove this file?')) return
    const body = new FormData()
    body.append('action', 'delete_attachment')
    body.append('attachment_id', attachmentId)
    await fetch('/api/admin/projects.php', {
      method: 'POST',
      body,
      headers: { 'X-CSRF-Token': csrfToken || '' },
    })
    onChanged()
  }

  return (
    <div>
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface-soft px-3 py-2 text-sm">
              <a onClick={blockInDemo} href={`/api/project_download.php?id=${f.id}`} className="flex-1 truncate font-medium text-navy-2 hover:underline">
                {f.original_filename}
              </a>
              <span className="flex-none text-xs text-navy-900/40">{formatSize(f.file_size)}</span>
              {isAdmin && (
                <button onClick={() => handleDelete(f.id)} className="flex-none text-xs font-semibold text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <div className="mt-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-navy-2 hover:underline">
            {uploading ? 'Uploading…' : '+ Attach official file'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
