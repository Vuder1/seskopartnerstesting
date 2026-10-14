// In-browser stand-in for the PHP backend, enabled with VITE_DEMO=1
// (npm run dev / npm run build:demo). It answers the same /api/* calls the
// real UI makes, with fixture data, and never touches the network.

const SESSION_KEY = 'sesko_demo_user'
const ago = (days, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString().slice(0, 19).replace('T', ' ')

const USERS = {
  'admin@demo.sesko': { id: 1, firm_id: null, name: 'Anna Admin', email: 'admin@demo.sesko', role: 'admin', status: 'approved', perm_users: 1, perm_firms: 1, perm_documents: 1, perm_projects: 1, perm_inquiries: 1, password: 'demo-admin-1' },
  'partner@demo.sesko': { id: 2, firm_id: 1, firm_name: 'Demo Glazing Co.', name: 'Ola Partner', email: 'partner@demo.sesko', role: 'client', status: 'approved', password: 'demo-partner-1' },
}

const db = {
  firms: [
    { id: 1, name: 'Demo Glazing Co.', created_at: ago(120) },
    { id: 2, name: 'Northgate Developers', created_at: ago(40) },
    { id: 3, name: 'Sample Facade Group', created_at: ago(15) },
  ],
  pending: [
    { id: 11, name: 'Piotr Nowak', email: 'piotr@example.com', role: 'client', status: 'pending', company_name_typed: 'Okna Przykladowe Sp. z o.o.', firm_id: null, firm_name: null, created_at: ago(1) },
    { id: 12, name: 'Mary Collins', email: 'mary@example.com', role: 'client', status: 'pending', company_name_typed: 'Sample Glass & Glazing', firm_id: null, firm_name: null, created_at: ago(2) },
  ],
  approved: [
    { id: 2, name: 'Ola Partner', email: 'partner@demo.sesko', role: 'client', status: 'approved', company_name_typed: 'Demo Glazing Co.', firm_id: 1, firm_name: 'Demo Glazing Co.', created_at: ago(120) },
    { id: 13, name: 'Tom Rivera', email: 'tom@example.com', role: 'client', status: 'approved', company_name_typed: 'Northgate Developers', firm_id: 2, firm_name: 'Northgate Developers', created_at: ago(40) },
  ],
  rejected: [
    { id: 14, name: 'Spam Bot', email: 'bot@example.com', role: 'client', status: 'rejected', company_name_typed: 'Free Offers Ltd', firm_id: null, firm_name: null, created_at: ago(9) },
  ],
  admins: [
    { id: 1, name: 'Anna Admin', email: 'admin@demo.sesko', perm_users: 1, perm_firms: 1, perm_documents: 1, perm_projects: 1, perm_inquiries: 1, created_at: ago(200) },
    { id: 5, name: 'Marek Kowalski', email: 'marek@demo.sesko', perm_users: 0, perm_firms: 0, perm_documents: 1, perm_projects: 1, perm_inquiries: 1, created_at: ago(90) },
  ],
  documents: [
    { id: 1, category: 'download_center', title: 'SESKO Capabilities Brochure 2026', description: 'Plant, systems and certifications overview.', original_filename: 'sesko-capabilities-2026.pdf', file_size: 3_400_000, mime_type: 'application/pdf', is_public: 1, created_at: ago(12) },
    { id: 2, category: 'download_center', title: 'Factory walkthrough video', description: 'Środa Śląska plant, CNC line and crate packing.', original_filename: 'factory-walkthrough.mp4', file_size: 48_000_000, mime_type: 'video/mp4', is_public: 1, created_at: ago(30) },
    { id: 3, category: 'download_center', title: 'Reynaers MasterLine 8 - product sheet', description: '', original_filename: 'masterline8.pdf', file_size: 1_250_000, mime_type: 'application/pdf', is_public: 1, created_at: ago(55) },
    { id: 4, category: 'technical_specs', title: 'Aluprof MB-79N installation drawings', description: 'DWG pack with thermal break details.', original_filename: 'mb79n-drawings.zip', file_size: 12_800_000, mime_type: 'application/zip', is_public: 1, created_at: ago(20) },
    { id: 5, category: 'technical_specs', title: 'Reynaers CW 50 performance data', description: 'Air / water / wind load test summary.', original_filename: 'cw50-performance.pdf', file_size: 2_100_000, mime_type: 'application/pdf', is_public: 0, firm_names: 'Demo Glazing Co.', created_at: ago(8) },
    { id: 6, category: 'technical_specs', title: 'Ornilux Mikado - bird-friendly glass spec', description: '', original_filename: 'ornilux-mikado.pdf', file_size: 860_000, mime_type: 'application/pdf', is_public: 1, created_at: ago(3) },
  ],
  inquiries: [
    { id: 5, source_site: 'seskoarchitecture.com', name: 'Dana Whitfield', email: 'dana@example.com', phone: null, company: 'Sample Property Group', message: 'We manage a retail strip center and want to replace storefront glazing on three units with a more energy-efficient aluminum system. Could you send information on getting a quote?', status: 'new', converted_project_id: null, created_at: ago(1), attachments: [] },
    { id: 6, source_site: 'seskostudio.com', name: 'Jonas Berg', email: 'jonas@example.com', phone: '555-0100', company: null, message: 'Looking to replace the windows throughout our home, about 12 windows total. How does the quote process work?', status: 'new', converted_project_id: null, created_at: ago(2), attachments: [] },
    { id: 4, source_site: 'seskoarchitecture.com', name: 'Cedric Moore', email: 'c.moore@example.com', phone: null, company: 'Sample Architects', message: 'Request for MB-86 pricing on a 6,000 sq ft lofts conversion.', status: 'converted', converted_project_id: 3, created_at: ago(18), attachments: [] },
    { id: 3, source_site: 'seskostudio.com', name: 'Test Person', email: 'test@example.com', phone: null, company: null, message: 'Test submission.', status: 'archived', converted_project_id: null, created_at: ago(30), attachments: [] },
  ],
  notes: { 1: [{ id: 1, body: 'Client asked to confirm RAL 7016 before materials order. Waiting on written approval.', created_at: ago(2), author_name: 'Marek Kowalski' }] },
  comments: {},
  notifications: [
    { id: 1, type: 'comment', message: 'New reply from SESKO on "Materials Order"', link_path: '/portal/projects/1', is_read: 0, created_at: ago(0, 3) },
    { id: 2, type: 'stage_update', message: '"Quotation" status changed to complete', link_path: '/portal/projects/1', is_read: 0, created_at: ago(1) },
    { id: 3, type: 'file_added', message: 'New file attached to the project: shop-drawings-rev2.pdf', link_path: '/portal/projects/2', is_read: 1, created_at: ago(5) },
  ],
}

const file = (id, name, size, mime = 'application/pdf') => ({ id, original_filename: name, file_size: size, mime_type: mime, created_at: ago(3) })
const stage = (id, label, status, extra = {}) => ({ id, label, status, note: null, updated_at: ago(extra.age ?? 4), files: [], comment_count: 0, substages: [], ...extra })

db.projects = [
  {
    id: 1, firm_id: 1, firm_name: 'Demo Glazing Co.', name: 'Northgate Business Park office building renovation', reference_code: 'NG-2201', status: 'active',
    description: 'Aluminum curtain wall system (~4,500 sq ft, four stories) with triple-glazed units for the main facade; supplier confirmation needed within 6 weeks ahead of fall construction start.',
    source_site: 'seskoarchitecture.com', ai_review_status: 'approved', created_at: ago(40),
    files: [file(101, 'RFQ-package.pdf', 2_400_000)],
    assignees: [{ id: 5, name: 'Marek Kowalski' }],
    stages: [
      stage(11, 'Project Started', 'complete', { age: 38, note: 'Kick-off call held, scope confirmed.' }),
      stage(12, 'Quotation', 'complete', { age: 30, files: [file(111, 'Quotation-NG-2201.pdf', 410_000)], comment_count: 2 }),
      stage(13, 'Materials Order', 'in_progress', { age: 3, note: 'Profiles ordered, glass lead time 6-7 weeks.', comment_count: 1,
        substages: [
          { id: 131, label: 'Profile order', status: 'complete', note: 'Confirmed with Reynaers.', updated_at: ago(6), files: [], comment_count: 0 },
          { id: 132, label: 'Glass order', status: 'in_progress', note: 'Waiting on RAL confirmation.', updated_at: ago(2), files: [file(112, 'glass-spec.pdf', 220_000)], comment_count: 1 },
        ] }),
      stage(14, 'In Production', 'pending', { age: 3 }),
      stage(15, 'In Delivery', 'pending', { age: 3 }),
      stage(16, 'Delivered', 'pending', { age: 3 }),
    ],
  },
  {
    id: 2, firm_id: 1, firm_name: 'Demo Glazing Co.', name: '355 E 86th Street', reference_code: 'E86-44', status: 'active',
    description: 'Mixed-use building, 44,500 sq ft facade/window area, Reynaers MasterLine 8.', source_site: 'seskoarchitecture.com', ai_review_status: 'approved', created_at: ago(25), files: [], assignees: [],
    stages: [
      stage(21, 'Project Started', 'complete', { age: 24 }),
      stage(22, 'Quotation', 'in_progress', { age: 2, note: 'Revision 2 sent for review.', comment_count: 3 }),
      stage(23, 'Materials Order', 'pending'), stage(24, 'In Production', 'pending'), stage(25, 'In Delivery', 'pending'), stage(26, 'Delivered', 'pending'),
    ],
  },
  {
    id: 3, firm_id: 1, firm_name: 'Demo Glazing Co.', name: '10 Quincy', reference_code: 'QN-210', status: 'completed',
    description: 'Mixed-use building, lofts. Aluprof MB-86.', source_site: 'seskoarchitecture.com', ai_review_status: 'approved', created_at: ago(300), files: [], assignees: [{ id: 1, name: 'Anna Admin' }],
    stages: ['Project Started', 'Quotation', 'Materials Order', 'In Production', 'In Delivery', 'Delivered'].map((l, i) => stage(31 + i, l, 'complete', { age: 280 - i * 30 })),
  },
  {
    id: 4, firm_id: 2, firm_name: 'Northgate Developers', name: 'Residential sliding patio doors replacement', reference_code: null, status: 'active',
    description: 'Homeowner renovating a back wall with large sliding glass doors (~16 ft wide, 2-3 panels) opening onto the patio.',
    source_site: 'seskostudio.com', ai_review_status: 'pending', created_at: ago(1), files: [], assignees: [],
    stages: ['Project Started', 'Quotation', 'Materials Order', 'In Production', 'In Delivery', 'Delivered'].map((l, i) => stage(41 + i, l, i === 1 ? 'in_progress' : 'pending')),
  },
]

const clone = (v) => JSON.parse(JSON.stringify(v))
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const publicUser = (u) => { if (!u) return null; const { password, ...rest } = u; return rest }
const sessionUser = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null } }

function bodyObject(init) {
  const b = init?.body
  if (!b) return {}
  if (b instanceof FormData) {
    const o = {}
    for (const [k, v] of b.entries()) o[k] = typeof v === 'string' ? v : v.name
    return o
  }
  return {}
}

function clientProjectSummary(p) {
  const done = p.stages.filter((s) => s.status === 'complete').length
  const current = p.stages.find((s) => s.status === 'in_progress') || p.stages.find((s) => s.status === 'pending') || p.stages[p.stages.length - 1]
  return { id: p.id, name: p.name, reference_code: p.reference_code, status: p.status, current_stage: current.label, stage_complete: done, stage_total: p.stages.length }
}

function handle(method, path, params, body) {
  const me = sessionUser()
  const isAdmin = me?.role === 'admin'

  switch (path) {
    case '/api/me.php':
      return json({ user: publicUser(me), csrfToken: me ? 'demo-csrf' : null })
    case '/api/login.php': {
      const u = USERS[(body.email || '').toLowerCase()]
      if (!u || u.password !== body.password) return json({ error: 'Invalid email or password.' }, 401)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(u)))
      return json({ user: publicUser(u), csrfToken: 'demo-csrf' })
    }
    case '/api/logout.php':
      sessionStorage.removeItem(SESSION_KEY)
      return json({ success: true })
    case '/api/register.php':
    case '/api/contact.php':
      return json({ success: true })
    case '/api/notifications.php':
      if (method === 'POST') {
        db.notifications.forEach((n) => { if (body.id === 'all' || String(n.id) === String(body.id)) n.is_read = 1 })
        return json({ success: true })
      }
      if (params.get('count_only')) return json({ unread: db.notifications.filter((n) => !n.is_read).length })
      return json({ notifications: clone(db.notifications) })
    case '/api/projects.php':
      return json({ projects: db.projects.filter((p) => p.firm_id === (me?.firm_id ?? 1)).map(clientProjectSummary) })
    case '/api/project.php': {
      const p = db.projects.find((x) => x.id === Number(params.get('id')))
      return p ? json({ project: clone(p) }) : json({ error: 'Not found' }, 404)
    }
    case '/api/stage_comments.php': {
      const key = params.get('stage_id') ? `s${params.get('stage_id')}` : `u${params.get('substage_id') || body.substage_id}`
      const k2 = body.stage_id ? `s${body.stage_id}` : key
      if (method === 'POST') {
        const list = (db.comments[k2] ||= [])
        list.push({ id: Date.now(), body: body.body, review_status: 'published', created_at: ago(0), author_name: me?.name || 'You', author_role: me?.role === 'admin' ? 'admin' : 'client', attachments: [] })
        return json({ success: true })
      }
      const seed = key === 's12' ? [
        { id: 1, body: 'Could you confirm the glass makeup for the north elevation?', review_status: 'published', created_at: ago(31), author_name: 'Tom Rivera', author_role: 'client', attachments: [] },
        { id: 2, body: 'Confirmed - 44.2 / 16 argon / 33.1 low-E, Ug 0.6. Updated quotation attached.', review_status: 'published', created_at: ago(30), author_name: 'Marek Kowalski', author_role: 'admin', attachments: [] },
      ] : []
      return json({ comments: [...seed, ...(db.comments[key] || [])] })
    }
    case '/api/documents.php': {
      const cat = params.get('category'); const q = (params.get('search') || '').toLowerCase(); const sort = params.get('sort') || 'date_desc'
      let docs = db.documents.filter((d) => d.category === cat && (d.is_public || me?.firm_id === 1) && (!q || (d.title + d.description).toLowerCase().includes(q)))
      const by = { date_desc: (a, b) => b.created_at.localeCompare(a.created_at), date_asc: (a, b) => a.created_at.localeCompare(b.created_at), title_asc: (a, b) => a.title.localeCompare(b.title), title_desc: (a, b) => b.title.localeCompare(a.title) }[sort]
      return json({ documents: clone(docs.sort(by)) })
    }
  }

  if (path.startsWith('/api/admin/')) {
    if (!isAdmin) return json({ error: 'Forbidden' }, 403)
    switch (path) {
      case '/api/admin/users.php':
        if (method === 'POST') {
          const u = [...db.pending, ...db.rejected].find((x) => String(x.id) === String(body.user_id))
          if (body.action === 'approve' && u) { u.status = 'approved'; db.pending = db.pending.filter((x) => x !== u); db.approved.push(u) }
          if (body.action === 'reject' && u) { u.status = 'rejected'; db.pending = db.pending.filter((x) => x !== u); db.rejected.push(u) }
          return json({ success: true })
        }
        if (params.get('role') === 'admin') return json({ admins: clone(db.admins) })
        { const s = params.get('status') || 'pending'
          const list = s === 'all' ? [...db.pending, ...db.approved, ...db.rejected] : db[s] || []
          return json({ users: clone(list) }) }
      case '/api/admin/firms.php':
        if (method === 'POST') {
          if (body.action === 'delete') db.firms = db.firms.filter((f) => String(f.id) !== String(body.id))
          else if (body.name) db.firms.push({ id: Date.now(), name: body.name, created_at: ago(0) })
          return json({ success: true })
        }
        return json({ firms: clone(db.firms) })
      case '/api/admin/documents.php':
        if (method === 'POST') {
          if (body.action === 'delete') db.documents = db.documents.filter((d) => String(d.id) !== String(body.document_id))
          else db.documents.unshift({ id: Date.now(), category: body.category, title: body.title, description: body.description, original_filename: body.file || 'file.pdf', file_size: 1_000_000, mime_type: 'application/pdf', is_public: body.is_public === '1' ? 1 : 0, created_at: ago(0) })
          return json({ success: true })
        }
        return json({ documents: clone(db.documents.filter((d) => !params.get('category') || d.category === params.get('category'))) })
      case '/api/admin/projects.php':
        if (method === 'POST') {
          const p = db.projects.find((x) => String(x.id) === String(body.project_id))
          if (body.action === 'update_project_status' && p) p.status = body.status
          if (body.action === 'approve_ai_project' && p) p.ai_review_status = 'approved'
          if (body.action === 'assign_user' && p && !p.assignees.some((a) => String(a.id) === String(body.user_id))) { const a = db.admins.find((x) => String(x.id) === String(body.user_id)); if (a) p.assignees.push({ id: a.id, name: a.name }) }
          if (body.action === 'unassign_user' && p) p.assignees = p.assignees.filter((a) => String(a.id) !== String(body.user_id))
          if (body.action === 'create') db.projects.unshift({ id: Date.now(), firm_id: Number(body.firm_id), firm_name: (db.firms.find((f) => String(f.id) === body.firm_id) || {}).name, name: body.name, reference_code: body.reference_code || null, status: 'active', description: null, source_site: null, ai_review_status: 'approved', created_at: ago(0), files: [], assignees: [], stages: ['Project Started', 'Quotation', 'Materials Order', 'In Production', 'In Delivery', 'Delivered'].map((l, i) => stage(Date.now() + i, l, 'pending')) })
          return json({ success: true })
        }
        if (params.get('id')) {
          const p = db.projects.find((x) => x.id === Number(params.get('id')))
          return p ? json({ project: { ...clone(p), available_admins: db.admins.map((a) => ({ id: a.id, name: a.name })) } }) : json({ error: 'Not found' }, 404)
        }
        return json({ projects: db.projects.map((p) => ({ id: p.id, name: p.name, reference_code: p.reference_code, status: p.status, ai_review_status: p.ai_review_status, source_site: p.source_site, created_at: p.created_at, firm_name: p.firm_name })) })
      case '/api/admin/inquiries.php': {
        if (method === 'POST') {
          const q = db.inquiries.find((x) => String(x.id) === String(body.id))
          if (body.action === 'archive' && q) q.status = 'archived'
          if (body.action === 'convert_to_project' && q) { q.status = 'converted'; q.converted_project_id = 4 }
          return json({ success: true, project_id: 4 })
        }
        if (params.get('stats') === '1') {
          const count = (key) => Object.entries(db.inquiries.reduce((m, i) => ((m[i[key]] = (m[i[key]] || 0) + 1), m), {})).map(([k, c]) => ({ [key]: k, c }))
          return json({ by_status: count('status'), by_source: count('source_site'), avg_days_to_convert: 3.5 })
        }
        const s = params.get('status')
        return json({ inquiries: clone(db.inquiries.filter((i) => !s || s === 'all' || i.status === s)) })
      }
      case '/api/admin/internal_notes.php': {
        const pid = Number(params.get('project_id') || body.project_id)
        if (method === 'POST') {
          if (body.action === 'add') (db.notes[pid] ||= []).push({ id: Date.now(), body: body.body, created_at: ago(0), author_name: me.name })
          return json({ success: true })
        }
        return json({ notes: clone(db.notes[pid] || []) })
      }
    }
  }
  return json({ error: 'Not found (demo)' }, 404)
}

export function installMockApi() {
  const realFetch = window.fetch.bind(window)
  window.fetch = async (input, init = {}) => {
    const raw = typeof input === 'string' ? input : input.url
    if (!raw.startsWith('/api/')) return realFetch(input, init)
    const url = new URL(raw, window.location.origin)
    await new Promise((r) => setTimeout(r, 90))
    return handle((init.method || 'GET').toUpperCase(), url.pathname, url.searchParams, bodyObject(init))
  }
}
