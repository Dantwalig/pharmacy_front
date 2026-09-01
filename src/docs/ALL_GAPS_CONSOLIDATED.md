# Hospital Platform — All Backend Gaps (Consolidated)

> **Audience:** Backend lead, backend engineers, and product team  
> **Purpose:** Single source of truth for every frontend → backend gap across the entire hospital platform plus other portals. Replaces reading 10+ individual integration notes.  
> **Last updated:** 2026-08-28  
> **Status icons:** ✅ Working · ⚠️ Partial/indirect · ❌ Missing · 🔧 Fixed in a previous PR

---

## Table of Contents

1. [Auth & Middleware](#1-auth--middleware)
2. [Hospital Admin Portal](#2-hospital-admin-portal)
3. [Doctor Portal](#3-doctor-portal)
4. [Nurse Portal](#4-nurse-portal)
5. [Receptionist Portal](#5-receptionist-portal)
6. [Super Admin Portal](#6-super-admin-portal)
7. [Branch Manager Portal](#7-branch-manager-portal)
8. [Pharmacy Owner Portal](#8-pharmacy-owner-portal)
9. [Patient Portal](#9-patient-portal)
10. [Cross-Cutting Code Issues](#10-cross-cutting-code-issues-resolved)

---

## 1. Auth & Middleware

### 1-A — Doctor login was broken for seeded doctors 🔧 Fixed

**Source:** `HOSPITAL_AUTH_INTEGRATION.md`

All seeded doctors were created via `prisma.doctor.create(...)` only. `auth.service.ts`'s `login()` only queried `prisma.staff` and `prisma.hospitalStaff` — never `prisma.doctor` — so every doctor login returned `401 Unauthorized: Staff profile not found`.

**Fix shipped:** DOCTOR branch now falls back to `prisma.doctor.findFirst({ where: { userId } })` and returns `doctorId`, `firstName`, `lastName`, `specialization`, `hospitalId`, `hospitalName` in the JWT payload.

### 1-B — Successful DOCTOR login had no `Doctor.id` 🔧 Fixed

**Source:** `HOSPITAL_AUTH_INTEGRATION.md`

`Appointment.doctorId` and `Prescription.doctorId` reference `Doctor.id`, not `User.id`. The HospitalStaff login branch never included `doctorId`, so even correct onboarding produced an unusable token for appointments/prescriptions.

**Fix shipped:** Login response now always includes `doctorId: doctor.id` for DOCTOR role.

### 1-C — Hospital routes had no auth guard 🔧 Fixed

**Source:** `HOSPITAL_AUTH_INTEGRATION.md`

`src/middleware.tsx` had an explicit `// TODO: add hospital auth` comment; `/hospital/:path*` wasn't even in the middleware matcher, so all four hospital roles had zero protection — anyone could navigate to `/hospital/admin/dashboard` without a token.

**Fix shipped:** Added full role-based guard to middleware; `/hospital/admin/*`, `/hospital/doctor/*`, `/hospital/nurse/*` each reject the wrong role. `HOSPITAL_ADMIN` also checks `payload.status` (PENDING → `/pending-approval`, anything other than APPROVED → redirect).

### 1-D — No frontend for staff onboarding/activation ❌

**Source:** `HOSPITAL_AUTH_INTEGRATION.md`

`POST /auth/onboard/hospital-staff` and `POST /auth/hospital-staff/activate` both exist on the backend. No frontend page calls either. A hospital admin cannot add a doctor/nurse/receptionist through the UI; newly onboarded staff have no activation page to land on.

**Action needed (frontend):** "Add Staff" flow on `/hospital/admin/staff` calling `onboard/hospital-staff`; an `/hospital/activate` page for the emailed activation link.

### 1-E — RECEPTIONIST login shows a not-yet-available toast 🔧 Fixed

**Source:** `HOSPITAL_AUTH_INTEGRATION.md`

The backend fully supports the RECEPTIONIST role in auth, but `AuthContext.login()`'s RECEPTIONIST case showed "The receptionist portal is not available yet" and logged the user out. Fixed: auth routing now redirects RECEPTIONIST to `/hospital/receptionist/dashboard`.

---

## 2. Hospital Admin Portal

### 2-A — Dashboard & Departments

| # | Status | Gap |
| - | ------ | --- |
| D-1 | 🔧 Fixed | `appointmentsByStatus.CONFIRMED` was always 0 — backend only counted SCHEDULED/COMPLETED/CANCELLED, silently dropping ARRIVED/IN_TRIAGE/READY_FOR_DOCTOR/NO_SHOW. Fixed by bucketing ARRIVED+IN_TRIAGE+READY_FOR_DOCTOR → CONFIRMED, NO_SHOW → CANCELLED. |
| D-2 | 🔧 Fixed | `GET /hospitals/:id/departments` endpoint didn't exist. Added to `hospitals.controller.ts`, aggregating doctors by specialization server-side. |
| D-3 | ⚠️ Migration pending | `Doctor.isDepartmentHead` and `HospitalStaff.department` fields added to schema but `npx prisma migrate dev` hasn't run — any query touching Doctor or HospitalStaff will throw "column does not exist" until migrated. SQL fix: `ALTER TABLE "doctors" ADD COLUMN "isDepartmentHead" BOOLEAN NOT NULL DEFAULT false; ALTER TABLE "hospital_staff" ADD COLUMN "department" TEXT;` |
| D-4 | ❌ Not fixed (no spec) | "Procured Value" stat card and "Recent Activity" multi-source feed — no Procurement/PurchaseOrder model exists in schema. Treated as a net-new feature requiring a product spec before scoping. Interim: shows `monthlyRevenue` labelled as "Monthly Revenue." |
| D-5 | ⚠️ Non-blocking | `DEPT_META` icon map is keyed by exact specialization strings (7 values). Any other specialization falls back to a default teal Stethoscope icon gracefully. |
| D-6 | 🔧 Fixed | `GET /hospitals/:id/dashboard/stats` and `GET /hospitals/:id/dashboard/weekly-revenue` were HOSPITAL_ADMIN-only with `validateHospitalAccess()` (owner-check). Added `Role.DOCTOR` and a new `validateHospitalReadAccess()` sibling (allows doctor whose `hospitalId` matches) so doctor dashboard can use the same endpoints. |

### 2-B — Reports

| # | Status | Gap |
| - | ------ | --- |
| R-1 | ✅ | `GET /reports/department/metrics` → Average wait times chart. Backed by `mv_department_daily_metrics`. Note: `avgWaitMinutesApprox` is scheduled-time → triage, not true check-in → seen-by-doctor. |
| R-2 | ❌ | Patient Satisfaction chart — no feedback/rating model in schema anywhere. No `AppointmentFeedback` table. Proposed model: `AppointmentFeedback { id, appointmentId (unique), patientId, hospitalId, rating (1-5), comment?, createdAt }`. Proposed endpoint: `GET /hospitals/:id/dashboard/satisfaction` returning `[{ name: "Excellent", value: 50 }, ...]`. |
| R-3 | ⚠️ | Staff Per Department — derived client-side from `GET /hospitals/:id/doctors`. Nurses can't be attributed to any department (no department field on HospitalStaff until migration in D-3 runs). |
| R-4 | ❌ | Admitted Patients over time — no monthly aggregation endpoint. Proposed: `GET /hospitals/:id/dashboard/admissions-trend?months=N` backed by `mv_monthly_admissions` materialized view (same refresh-job pattern as existing views). |

### 2-C — Settings

| # | Status | Gap |
| - | ------ | --- |
| S-1 | 🔧 Fixed | `PATCH /hospitals/:id` — hospital profile update route now implemented in backend. DTO: `{ name?, address?, phone? }`. Uses `validateHospitalAccess()` ownership check. |
| S-2 | ❌ | Fees — no `HospitalFee` model or route. Proposed: `GET/POST /hospitals/:id/fees` and `PATCH/DELETE /hospitals/:id/fees/:feeId`. |
| S-3 | ❌ | Announcements — no `HospitalAnnouncement` model or route. Proposed: `GET/POST /hospitals/:id/announcements` and `DELETE /hospitals/:id/announcements/:id`. |
| S-4 | ❌ | Departments write — no `HospitalDepartment` model. Derived read-only from doctor specializations. Proposed: `GET/POST /hospitals/:id/departments` and `PATCH /hospitals/:id/departments/:deptId`. |

### 2-D — Staff Directory

| # | Status | Gap |
| - | ------ | --- |
| ST-1 | ❌ | `GET /hospitals/:id/staff` missing. `GET /hospitals/:id/doctors` only returns doctors. No listing endpoint for nurses or receptionists. Staff directory is doctors-only. Proposed: return `HospitalStaff[]` with `{ id, firstName, lastName, phone, status, createdAt, user: { email, role } }` — scope `user` select to avoid leaking `password`/`refreshToken`. |

### 2-E — Schedule

| # | Status | Gap |
| - | ------ | --- |
| SC-1 | ✅ | `GET /doctors/:doctorId/slots?date=` returns available (bookable) slots — not existing bookings. Used correctly for the "Open slots" panel. Schedule grid uses `GET /appointments`. **Security note:** this route has no `@UseGuards()` or `@Roles()` — appears to be accidentally public. If intentional, add `@Public()` decorator. |
| SC-2 | 🔧 Fixed | `AppointmentStatus` enum mismatch: frontend had `PENDING | CONFIRMED | READY_FOR_DOCTOR | COMPLETED | CANCELLED`. Real Prisma enum is `SCHEDULED | COMPLETED | CANCELLED | NO_SHOW | ARRIVED | IN_TRIAGE | READY_FOR_DOCTOR`. Fixed frontend type and all tab/dropdown references. |

### 2-F — Appointments Write

| # | Status | Gap |
| - | ------ | --- |
| AW-1 | 🔧 Fixed | Status dropdown on appointments page wired to `PATCH /appointments/:id/status` via `handleStatusChange`. Check-in, Cancel, and status transitions all work. Reschedule (date change) still has no dedicated endpoint. |

---

## 3. Doctor Portal

### 3-A — Dashboard

| # | Status | Gap |
| - | ------ | --- |
| Dr-1 | ✅ | `GET /api/doctors/dashboard` — doctor-scoped stats (today's appointments, total patients, completed consults, weekly visits, doctor name, specialization, hospital name). |
| Dr-2 | ✅ | `GET /api/appointments` — doctor-scoped via JWT; date-range filter `?from=&to=` added. |
| Dr-3 | ✅ | `GET /api/notifications` — used for notification panel. |

### 3-B — Appointments

| # | Status | Gap |
| - | ------ | --- |
| Dr-4 | ✅ | `GET /api/appointments/:id` — single appointment with `diagnosisSummary` and `doctorRecommendations`. |
| Dr-5 | ✅ | `PATCH /api/appointments/:id/status` — status transition. |
| Dr-6 | ❌ | Patient demographics in appointments (`gender`, `dateOfBirth`, triage vitals) — missing from `appointmentInclude` in `appointments.service.ts`. Vitals column shows `—`. Proposed: add `patient.gender`, `patient.dateOfBirth`, `triageVitals` to the include shape. |
| Dr-7 | ❌ | `GET /hospitals/:id/patients` — route exists and `@Roles(Role.DOCTOR)` is declared, but `getHospitalPatients` calls `validateHospitalAccess()` which checks `hospital.userId === userId` (owner-only). DOCTOR userId never matches the hospital owner, so doctors always get 403. **Backend bug:** role decorator and service guard are inconsistent. Patient list must still be derived from appointments; missing `age`, `gender`, `dateOfBirth`. |

### 3-C — Prescription

| # | Status | Gap |
| - | ------ | --- |
| Dr-8 | ✅ | `POST /api/prescriptions/hospital-issue` — issues a prescription (patientId, hospitalId, diagnosis, medications[]). |
| Dr-9 | ❌ | `GET /api/prescriptions/for-patient/:patientId` (by UUID) — doesn't exist. Existing route is `GET /prescriptions/patient/:mrn` (by MRN). Appointments include `patientId` (UUID) but NOT `mrn`, so prescription history cannot be loaded. Every prescription session shows a gap notice. Proposed: add UUID-based route scoped to `Role.DOCTOR` and `Role.HOSPITAL_ADMIN`, or include `mrn` in appointments include. |
| Dr-10 | 🔧 Fixed | `GET /hospitals/:hospitalId/drug-stock` now allows `Role.DOCTOR` (backend fix). Prescription form (`doctor/prescription/page.tsx`) fetches drug stock after appointments load, populates a native `<datalist>` for medication name autocomplete (`brandName + dosageStrength`). Silently no-ops if fetch fails — form still usable as free text. |

### 3-D — Settings / Profile

| # | Status | Gap |
| - | ------ | --- |
| Dr-11 | ✅ | `PUT /auth/change-password` — password change. |
| Dr-12 | ✅ | `GET /doctors/dashboard` — used to populate profile display (`doctorName`, `specialization`, `hospitalName`). |
| Dr-13 | ❌ | `PATCH /doctors/me` (DOCTOR role) — doesn't exist. `PATCH /doctors/:id` is HOSPITAL_ADMIN-only. Profile form is read-only for doctors. Proposed: add `PATCH /doctors/me` for `Role.DOCTOR`. |
| Dr-14 | ❌ | Missing fields on `/doctors/dashboard` — `licenseNumber`, `workingHours`, `phone` not in the response. Department tab shows `—` for license and hours. Proposed: add a `GET /doctors/me` or extend dashboard response. |

### 3-E — Messages

| # | Status | Gap |
| - | ------ | --- |
| Dr-15 | ❌ | Real-time messaging — no `MessagesModule` exists. Page falls back to `GET /notifications?userType=doctor`. Send-message input is disabled. Proposed: `GET /messages/threads`, `GET /messages/threads/:id`, `POST /messages/threads/:id/send`. |

### 3-F — Consultations & Patient

| # | Status | Gap |
| - | ------ | --- |
| Dr-16 | ⚠️ | `doctor/consultations` and `doctor/patient` — both use appointment data as proxy for patient list. `doctorName` is derived from `a.doctor.user.hospitalStaff.firstName` which is `null` for most doctors (HospitalStaff is for nurse/receptionist accounts, not doctors). Should use `Doctor.firstName`/`Doctor.lastName` directly. Pre-existing bug, not introduced here. |

---

## 4. Nurse Portal

### 4-A — Patients Page

| # | Status | Gap |
| - | ------ | --- |
| N-P-1 | ✅ | `GET /inpatient/admissions?hospitalId=` — used as patient list proxy. Returns admitted patients only (not discharged or outpatient). |
| N-P-2 | ❌ | No `GET /hospitals/:id/patients` endpoint — only admitted patients visible. A hospital-wide patient roster (all patients, not just admitted) does not exist. |

### 4-B — Vitals Page

| # | Status | Gap |
| - | ------ | --- |
| N-V-1 | ⚠️ | Two-step pattern: fetch admissions → fetch `GET /inpatient/admissions/:id/vitals` for the most-recent ACTIVE admission only. Only one patient's vitals are shown at a time. |
| N-V-2 | ❌ | No hospital-wide vitals feed. Proposed: `GET /hospitals/:id/nurse/vitals?date=ISO8601` returning all vitals records across current admissions. |
| N-V-3 | 🔧 Fixed | Save/Update Assessment buttons wired to `POST /inpatient/admissions/:id/vitals` with `{ readings: VitalReadingDto[], checklist: VitalsChecklistDto, nurseNotes? }`. Active admission ID tracked from the admissions list. Buttons disabled while saving or when no active admission found. Success/failure via `react-hot-toast`. |

### 4-C — Medications (MAR) Page

| # | Status | Gap |
| - | ------ | --- |
| N-M-1 | ⚠️ | N+1 pattern: one `GET /inpatient/admissions/:id/mar` call per admitted patient via `Promise.allSettled`. Tolerates partial failures but doesn't scale. |
| N-M-2 | ❌ | No hospital-wide MAR feed. Proposed: `GET /hospitals/:id/nurse/mar?date=ISO8601` returning all MAR records for current admissions in one call. |
| N-M-3 | 🔧 Fixed | Record button POSTs to `POST /inpatient/admissions/:id/mar` with `{ administeredAt: now, ... }`. Mark Missed also POSTs (MAR entries are immutable — no PATCH endpoint exists) with `notes: 'DOSE NOT ADMINISTERED — marked as missed by nurse'` as clinical documentation. Both optimistically update row status in local state. |

### 4-D — Dashboard

| # | Status | Gap |
| - | ------ | --- |
| N-D-1 | 🔧 Fixed | `GET /nurses/dashboard` endpoint exists and nurse dashboard page (`nurse/dashboard/page.tsx`) already calls it. Stats cards (vitals recorded today, active admissions, critical alerts, new assessments) all wired to real data. |

---

## 5. Receptionist Portal

### 5-A — Missing GET Endpoints (all 9 listed as missing in Swagger)

| # | Endpoint | FE behaviour when missing |
| - | -------- | ------------------------ |
| Rec-1 | `GET /hospitals/:id/receptionist/dashboard` | Hardcoded fallback stat values (28 min avg wait, 8/4/3/1 cards) |
| Rec-2 | `GET /hospitals/:id/receptionist/notifications` | Empty notification list |
| Rec-3 | `PATCH /hospitals/:id/receptionist/notifications/read-all` | Button disabled |
| Rec-4 | `PATCH /hospitals/:id/receptionist/notifications/:id/read` | Item read state doesn't persist |
| Rec-5 | `GET /hospitals/:id/receptionist/queue` | Hardcoded queue mock |
| Rec-6 | `GET /hospitals/:id/receptionist/dashboard-stats` | Hardcoded stats |
| Rec-7 | `GET /hospitals/:id/receptionist/appointments` | Hardcoded appointment list |
| Rec-8 | `GET /hospitals/:id/receptionist/profile` | Profile form starts empty |
| Rec-9 | `GET /hospitals/:id/receptionist/leaves` | Leave history empty |

### 5-B — Missing Write Endpoints

| # | Endpoint | Body |
| - | -------- | ---- |
| Rec-W1 | `POST /hospitals/:id/receptionist/leaves` | `{ leaveType, startDate, endDate, reason?, fileName? }` |
| Rec-W2 | `PATCH /hospitals/:id/receptionist/leaves/:id` | `{ status: 'CANCELLED' }` (only valid while status === 'PENDING') |
| Rec-W3 | `PATCH /hospitals/:id/receptionist/profile` | `{ fullName?, phone?, email?, username?, department?, address?, dateOfJoining? }` |
| Rec-W4 | `PATCH /hospitals/:id/receptionist/appointments/:id` | Check-in: `{ status: 'ARRIVED' }` · Cancel: `{ status: 'CANCELLED' }` · Reschedule: `{ scheduledAt: ISO8601 }` |

### 5-C — No Receptionist Seed

No receptionist user is seeded in the database (`prisma/seed.ts` has no `RECEPTIONIST` role record). Cannot test the receptionist portal login end-to-end without manually creating one.

---

## 6. Super Admin Portal

**Branch:** `fix/nelly_super_admin_api_hardening`

| # | Status | Endpoint | Description |
| - | ------ | -------- | ----------- |
| SA-1 | 🔧 Fixed | `GET /super-admin/branches/pending` | Branch approval queue — implemented in `fix/nelly_super_admin_api_hardening` |
| SA-2 | 🔧 Fixed | `PATCH /super-admin/branches/:id/approve` | Approve a branch — implemented |
| SA-3 | 🔧 Fixed | `PATCH /super-admin/branches/:id/reject` | Reject a branch (requires `{ reason }`) — implemented |
| SA-4 | 🔧 Fixed | `GET /super-admin/pharmacies/unverified-locations` | Pharmacy location review map — implemented |
| SA-5 | 🔧 Fixed | `PATCH /super-admin/pharmacies/:id/verify-location` | Verify/flag a pharmacy location — implemented |

**Working:** `GET /super-admin/analytics`, `GET /super-admin/revenue`, `GET /super-admin/pharmacies`, `GET /super-admin/pharmacies/pending`, `PATCH /super-admin/pharmacies/:id/approve`, `PATCH /super-admin/pharmacies/:id/reject`, `GET /super-admin/patients`

---

## 7. Branch Manager Portal

| # | Status | Endpoint | Description |
| - | ------ | -------- | ----------- |
| B-1 | 🔧 Fixed | `GET /stock-transfers/branch` | Transfer list — endpoint now implemented in backend |
| B-2 | 🔧 Fixed | `POST /stock-transfers` | Create transfer — endpoint now implemented |
| B-3 | 🔧 Fixed | `PATCH /stock-transfers/:id/status` | Accept/reject incoming transfers — implemented |
| B-4 | 🔧 Fixed | `GET /branches/my-branch-details` | Branch coordinates for map — endpoint now implemented |

**Working:** `GET /medications/pharmacy/my-medications`, `GET /branches/my-branches`, `GET /attendance/*`, `GET /orders/pharmacy-orders`

---

## 8. Pharmacy Owner Portal

| # | Status | Endpoint | Note |
| - | ------ | -------- | ---- |
| C-1 | ⚠️ | `GET /pharmacies/dashboard/stats` | May be implemented — `unwrapItem` applied defensively because backend inconsistently wraps responses. Confirm response shape. |
| C-2 | ⚠️ | `GET /pharmacies/dashboard/analytics` | Same caveat as C-1 |
| C-3 | ⚠️ | `GET /pharmacies/dashboard/daily-revenue` | Same caveat as C-1 |
| C-4 | ⚠️ | `GET /pharmacies/dashboard/weekly-revenue` | Same caveat as C-1 |
| C-5 | ⚠️ | `GET /pharmacies/profile/me` | Greeting falls back to generic if missing |

---

## 9. Patient Portal

| # | Status | Endpoint | Description |
| - | ------ | -------- | ----------- |
| P-1 | ⚠️ | `GET /notifications?userType=patient` | Polling every POLLING_INTERVAL_MS — stale on failure |
| P-2 | ❌ | `GET /medications/search?q=` | Patient medication search |
| P-3 | ❌ | `GET /pharmacies/nearby?lat=&lng=` | Nearby pharmacy list and map |

**Working:** `GET /orders/my-orders`, `GET /orders/:id`, `GET /prescriptions/my-prescriptions`

---

## 10. Cross-Cutting Code Issues (Resolved)

| # | Issue | Fix |
| - | ----- | --- |
| X-1 | Mixed API import styles — 8 files used `import { api }` (named) vs default. | Standardised to `import api from '@/lib/api'` everywhere. |
| X-2 | Inconsistent response unwrapping — ~20 call sites used inline `res.data?.data ?? res.data` patterns. | Added `unwrapItem<T>()` to `src/lib/api.ts` for object unwraps; array unwraps use existing `unwrapData()`. |
| X-3 | `useHospitalId()` dev fallback leaked into production — could return a dev hospital's ID for a logged-out production user. | Now only falls back to `NEXT_PUBLIC_DEV_HOSPITAL_ID` when `NODE_ENV !== 'production'` AND no session exists. |
| X-4 | No route-level auth guard for `/hospital/*`. | Added to `src/middleware.tsx` matcher; role-specific path guards for admin/doctor/nurse; HOSPITAL_ADMIN also checks approval status. |

---

## Priority Order for Backend Sprint

> Items marked 🔧 Fixed have been resolved and removed from this list.

1. **Rec-1 through Rec-9 + Rec-W1 through Rec-W4** — All receptionist endpoints missing; the portal has zero real data. Highest impact.
2. **Dr-9** — Prescription history by patient UUID — blocks every prescription session from showing history. MRN must be included in appointments, or a UUID-based route added.
3. **Dr-7** — Backend bug: `validateHospitalAccess()` is owner-only but `@Roles(Role.DOCTOR)` is declared. Fix the service guard to use `validateHospitalReadAccess()` so doctors can fetch hospital patients.
4. **D-3** — Run pending Prisma migration (`isDepartmentHead`, `department` fields) before next backend deploy — any doctor or HospitalStaff query will throw "column does not exist" until migrated.
5. **Dr-13 + Dr-14** — Doctor self-service profile edit (`PATCH /doctors/me`) and missing `licenseNumber`, `workingHours`, `phone` fields on dashboard response.
6. **N-V-2, N-M-2** — Nurse portal hospital-wide aggregation endpoints to replace N+1 pattern (`GET /hospitals/:id/nurse/vitals`, `GET /hospitals/:id/nurse/mar`).
7. **S-2 through S-4** — Hospital settings write endpoints (fees, announcements, departments write).
8. **R-2, R-4** — Patient satisfaction chart and admissions-trend chart (need new models: `AppointmentFeedback`, `mv_monthly_admissions`).
9. **Dr-6** — Add `patient.gender`, `patient.dateOfBirth`, `triageVitals` to `appointmentInclude` in `appointments.service.ts`.
10. **Dr-15** — Real-time messaging (`MessagesModule`) — no model exists yet.
