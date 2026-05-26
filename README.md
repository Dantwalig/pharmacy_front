# Pharmacy Front

The web frontend for the Ubwenge Lab pharmacy platform — a multi-role
application that connects patients, pharmacies, branches, on-site staff, and
platform administrators around medication ordering, inventory, and fulfilment.

> Internal Ubwenge Lab project. Proprietary — © Ubwenge Lab. All rights reserved. See [LICENSE](LICENSE).

---

## Table of contents

- [Overview](#overview)
- [The five portals](#the-five-portals)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Architecture highlights](#architecture-highlights)
- [Conventions](#conventions)
- [Internationalization](#internationalization)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Overview

`pharmacy_front` is a [Next.js](https://nextjs.org) (App Router) application.
A single codebase serves five distinct user roles, each with its own portal
under a top-level route segment. Access is enforced at the edge by middleware
that reads the signed-in user's role and account status from their session
token.

The app talks to a separate backend API (not in this repo) over HTTP, using a
JWT access/refresh token scheme stored in cookies.

---

## The five portals

| Portal | Route prefix | Who it's for | Notes |
|---|---|---|---|
| **Patient** | `/patient/*` | End users ordering medication | Gated behind a feature flag (see [Environment variables](#environment-variables)) |
| **Pharmacy** | `/pharmacy/*` | Pharmacy owners / representatives | Access depends on application status: `PENDING` → review screen, `REJECTED` → rejection screen, `APPROVED` → full portal |
| **Branch** | `/branch/*` | Branch managers | Manages a single branch's staff, inventory, attendance, transfers |
| **Staff** | `/staff/*` | Pharmacists, cashiers, nurses | Day-to-day order/prescription handling; first login forces a password change |
| **Super-admin** | `/super-admin/*` | Platform administrators | Approves pharmacies/branches, reviews locations, platform analytics |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| UI library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (design tokens via `@theme` — see [`src/DESIGN_TOKENS.md`](src/DESIGN_TOKENS.md)) |
| Icons | Heroicons |
| HTTP client | axios (with auth + token-refresh interceptors) |
| Auth/session | `js-cookie` + `jwt-decode` |
| i18n | `i18next` / `react-i18next` (English, French, Kinyarwanda) |
| Maps | Leaflet + react-leaflet (+ `leaflet.heat` for heatmaps) |
| Charts | Recharts |
| Notifications | `react-hot-toast` |
| Linting | ESLint 9 (`eslint-config-next`) |

---

## Getting started

### Prerequisites

- **Node.js 20+**
- **npm** (the repo ships a `package-lock.json`)
- A running instance of the backend API (defaults to `http://localhost:4000/api`)

### Setup

```bash
# 1. Clone
git clone https://github.com/Ubwenge-Lab/pharmacy_front.git
cd pharmacy_front

# 2. Install dependencies
npm install

# 3. Create your local env file
cp .env.example .env.local
#    then edit .env.local to point at your backend

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Patient portal not showing?** It's disabled by default. Set
> `NEXT_PUBLIC_ENABLE_PATIENT_FEATURES=true` in `.env.local`, or append
> `?dev_mode=true` to any URL to enable it locally for 7 days.

---

## Environment variables

All variables are build-time public (`NEXT_PUBLIC_*`) and safe to expose to the
browser. Copy [`.env.example`](.env.example) to `.env.local` and adjust.

| Variable | Required | Default if unset | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Recommended | `http://localhost:4000/api` | Base URL of the backend API |
| `NEXT_PUBLIC_ENABLE_PATIENT_FEATURES` | No | `false` | Set to `true` to expose the `/patient/*` portal. The `dev_mode` cookie also bypasses this locally. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | No | `info@ubwengelab.rw` | Support contact surfaced in the UI |

---

## Available scripts

| Script | Command | What it does |
|---|---|---|
| Dev | `npm run dev` | Start the dev server with hot reload (Turbopack) |
| Build | `npm run build` | Production build + type-check |
| Start | `npm run start` | Serve the production build |
| Lint | `npm run lint` | Run ESLint |

> `npm run build` runs a full TypeScript pass. Treat a clean build as the bar
> for merging.

---

## Project structure

```
src/
├── app/                    # App Router — one folder per route
│   ├── patient/            # Patient portal (feature-flagged)
│   ├── pharmacy/           # Pharmacy owner portal
│   ├── branch/             # Branch manager portal
│   ├── staff/              # Pharmacist / cashier / nurse portal
│   ├── super-admin/        # Platform admin portal
│   ├── login/ signup/ ...  # Public auth & onboarding routes
│   └── layout.tsx          # Root layout (providers, i18n, toasts)
├── components/
│   ├── shared/             # Cross-portal components (StatusBadge, LoadingSpinner, …)
│   ├── map/                # Leaflet map building blocks
│   ├── guards/             # Client-side route guards
│   └── <portal>/           # Per-portal sidebars, topbars, views
├── context/                # React context providers (AuthContext, CartContext)
├── hooks/                  # Reusable hooks (useFetch, useGeolocation, …)
├── lib/
│   ├── api.ts              # axios instance + auth API + token refresh
│   ├── auth.ts             # token & cached-user helpers
│   ├── constants.ts        # shared constants (FDA categories, polling, …)
│   ├── i18n/               # i18n setup + en/fr/rw translation dictionaries
│   └── …
├── features/               # Feature-scoped data/helpers (e.g. map data)
├── services/               # API service wrappers
├── types/                  # Shared TypeScript types
├── middleware.tsx          # Edge auth & role/status routing
└── DESIGN_TOKENS.md        # Brand tokens & UI conventions
```

---

## Architecture highlights

- **Role-based routing at the edge.** `src/middleware.tsx` runs on every
  `/patient`, `/pharmacy`, `/branch`, `/staff`, and `/super-admin` request. It
  reads the session token, derives the user's role and account status, and
  redirects anyone who doesn't belong.
- **Status-aware pharmacy access.** Pharmacy accounts route differently based
  on `PENDING` / `REJECTED` / `APPROVED` application status.
- **Centralised API layer.** All requests go through the shared axios instance
  in `src/lib/api.ts`, which attaches the access token and transparently
  refreshes it on a `401` using the refresh token.
- **Auth context.** `AuthContext` exposes `login`, `logout`, and the current
  user, and handles post-login routing per role.

For a deeper walkthrough, see [`docs/architecture.md`](docs/architecture.md).

---

## Conventions

- **Design tokens & UI patterns** are documented in
  [`src/DESIGN_TOKENS.md`](src/DESIGN_TOKENS.md). Use brand token utilities
  (`bg-brand-navy`, `text-brand-teal`, …) rather than raw hex values.
- **Status pills** use the shared `StatusBadge`
  (`src/components/shared/StatusBadge.tsx`) — don't hand-roll status colours.
- **Icons** come from Heroicons; size them with Tailwind (`w-5 h-5`).

---

## Internationalization

The UI ships in **English, French, and Kinyarwanda**. Strings live in
`src/lib/i18n/{en,fr,rw}.ts` and are accessed with the `useTranslation` hook.
See [`docs/i18n.md`](docs/i18n.md) for how to add or change strings, including
the review workflow for French and Kinyarwanda.

---

## Documentation

| Doc | What's in it |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Portals, routing, auth flow, API layer |
| [`docs/i18n.md`](docs/i18n.md) | Translation setup and contribution workflow |
| [`docs/support-tickets-api-spec.md`](docs/support-tickets-api-spec.md) | Support tickets API contract |
| [`src/DESIGN_TOKENS.md`](src/DESIGN_TOKENS.md) | Brand tokens and UI conventions |

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, commit conventions,
the translation workflow, and the pull-request checklist.

## Security

See [`SECURITY.md`](SECURITY.md) for how to report a vulnerability and a summary
of the app's security model.

## License

Proprietary. Copyright © Ubwenge Lab. All rights reserved. See
[`LICENSE`](LICENSE). Not for use, copying, or distribution outside Ubwenge Lab
without prior written permission.
