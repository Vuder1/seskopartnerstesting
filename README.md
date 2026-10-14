# SESKO Partners - design testing

A sandbox copy of the sesko-partners portal (`../sesko-partners-preview`) re-skinned with the
design of the ASAŞ "Window Exchange Hub" demo (https://veronikavanivska.github.io/asas/).
Functionality, routes, roles and API contracts are the same as the real portal; only the
look and the page layouts changed. Nothing here is deployed anywhere.

## Run it

```
npm install
npm run dev          # demo mode: in-browser fixtures, no backend, no real data
npm run dev:live     # proxies /api to https://sesko-partners.com (REAL accounts and data)
npm run build        # production build (expects the real PHP backend)
npm run build:demo   # static demo build -> dist-demo/
```

Demo mode (`.env.demo`, `VITE_DEMO=1`) swaps `fetch('/api/...')` for `src/demo/mockApi.js`.
The login screen shows two demo accounts with "Use" buttons, like the ASAŞ original:

| Account | Email | Password |
| --- | --- | --- |
| Internal team (admin, all permissions) | admin@demo.sesko | demo-admin-1 |
| Partner (Demo Glazing Co.) | partner@demo.sesko | demo-partner-1 |

`dev:live` rewrites the request `Origin` header to the live site so its `check_origin()` accepts
it. Anything you do there (approve, discard, upload, comment) happens on production.

## What changed vs. sesko-partners-preview

- **Design tokens** (`tailwind.config.js`, `src/index.css`): navy `#1f3a5f` + red `#d72638`,
  Inter, 17px soft panels, pills, segmented tabs. The old `teal` accent is now `accent` (red);
  red is reserved for primary actions and the active nav item, links are navy.
- **Auth** (`layouts/AuthLayout.jsx`, `pages/auth/AuthPage.jsx`): split-screen login/register.
  `/`, `/login` and `/register` all open it while signed out; pending/rejected accounts see a
  status card instead of the form.
- **App shell** (`layouts/AppShell.jsx`): sidebar + page header for both partners and admins
  (mobile: slide-over drawer). Replaces the old marketing-style Header/Footer/PageHero and the
  dark admin tab bar.
- **Pages**: partner dashboard with KPI cards (`pages/Dashboard.jsx`), project tracker and
  detail (two-column timeline + summary), document browser with file tiles, admin pages
  restyled (segmented tabs, panels, pills). Business logic in the admin pages is untouched.
- **New copy** lives in `src/i18n/ui.js` (EN/PL); the legacy `translations.js` is unchanged.

## What is not in this repo

This repo is the front-end only. The PHP backend (`public/api`, `server/`) and production
secrets stay in the private sesko-partners project, and so does a local Playwright capture
of the ASAŞ demo (`_asas-reference/`) that the design was taken from. Those folders exist on
the author's machine but are git-ignored. None of ASAŞ's content or branding is used here.

## Publishing the preview

Pushing to `main` runs `.github/workflows/pages.yml`, which builds the demo
(`npm run build:pages`, base path = repo name, with a `404.html` copy so deep links work on
GitHub Pages) and deploys it. In the repo settings, Pages > Source must be "GitHub Actions".
