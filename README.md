# Pharmacy Front

Frontend for the Ubwenge Lab pharmacy platform — a multi-role system connecting patients, pharmacies, branches, staff, and administrators for medication ordering, inventory, and fulfilment.

---

## Overview

**`pharmacy_front`** is a Next.js (App Router) application serving five distinct roles from a single codebase. Each role has its own portal, enforced at the edge using middleware based on the user’s session token.

The frontend communicates with a separate backend API via HTTP using JWT-based authentication (access + refresh tokens stored in cookies).

---

## Portals

| Portal | Route | Description | Notes |
|--------|------|-------------|------|
| Patient | `/patient/*` | End users ordering medication | Feature-flagged |
| Pharmacy | `/pharmacy/*` | Pharmacy owners / representatives | Access depends on application status |
| Branch | `/branch/*` | Branch managers | Inventory, staff, transfers |
| Staff | `/staff/*` | Pharmacists, cashiers, nurses | First login requires password reset |
| Super Admin | `/super-admin/*` | Platform administrators | Approvals, analytics, oversight |

---

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Language | TypeScript 5 |
| State/Auth | Context API + JWT (cookies) |
| API | Axios (with interceptors + token refresh) |
| i18n | i18next (EN / FR / Kinyarwanda) |
| Maps | Leaflet / react-leaflet |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Icons | Heroicons |
| Linting | ESLint 9 |

---

## Getting Started

### Requirements

- Node.js 20+
- npm
- Running backend API (default: `http://localhost:4000/api`)


### Setup

```bash
git clone https://github.com/Ubwenge-Lab/pharmacy_front.git
cd pharmacy_front

npm install

cp .env.example .env.local
# edit .env.local

npm run dev
```

Open: http://localhost:3000

> Patient portal is disabled by default. Enable it with:
>
> NEXT_PUBLIC_ENABLE_PATIENT_FEATURES=true

---

## Environment Variables

| Variable | Default | Purpose |
|----------|--------|---------|
| NEXT_PUBLIC_API_URL | localhost API | Backend base URL |
| NEXT_PUBLIC_ENABLE_PATIENT_FEATURES | false | Enables patient portal |
| NEXT_PUBLIC_SUPPORT_EMAIL | info@ubwengelab.rw | Support contact |

---

## Scripts

| Command | Purpose |
|---------|--------|
| npm run dev | Development server |
| npm run build | Production build + typecheck |
| npm run start | Run production build |
| npm run lint | Lint code |

---

## Project Structure

src/
├── app/
│   ├── patient/
│   ├── pharmacy/
│   ├── branch/
│   ├── staff/
│   ├── super-admin/
│   └── login/
├── components/
│   ├── shared/
│   ├── map/
│   ├── guards/
│   └── <portal>/
├── context/
├── hooks/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── i18n/
│   └── constants.ts
├── services/
├── types/
├── middleware.tsx
└── DESIGN_TOKENS.md

---

## Architecture Highlights

- Edge-based role routing via middleware
- Status-aware pharmacy onboarding (PENDING, REJECTED, APPROVED)
- Centralized Axios API layer with automatic token refresh
- Auth context managing session + role-based routing

---

## Conventions

- Use design tokens from DESIGN_TOKENS.md
- Use StatusBadge for all status UI
- Use Heroicons for icons only

---

## Internationalization

Supported languages:
- English
- French
- Kinyarwanda

---

## Documentation

- architecture.md — system design
- i18n.md — translation workflow
- support-tickets-api-spec.md — API contract
- DESIGN_TOKENS.md — UI system

---

## Maintainers

Lead: @tresor-01

---

## Contributing

See CONTRIBUTING.md

---

## Security

See SECURITY.md

---

## License

Proprietary — Ubwenge Lab.
