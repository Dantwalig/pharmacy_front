# Hospital Admin  Dashboard & Departments  Backend Integration Notes

> Scope: `src/app/hospital/admin/dashboard/page.tsx` and
> `src/app/hospital/admin/departments/page.tsx`. Both pages now fetch live data
> from the backend instead of `MOCK_ADMIN` / `MOCK_DEPARTMENTS`.

---

## Endpoints used

Confirmed directly against `back-end/src/hospitals/hospitals.controller.ts` and
`hospitals.service.ts` (source-verified, not assumed from the mock fields).

| Endpoint | Method | Role | Used by |
|---|---|---|---|
| `/hospitals/:id/dashboard/stats` | GET | `HOSPITAL_ADMIN` | Dashboard  stat cards |
| `/hospitals/:id/dashboard/weekly-revenue` | GET | `HOSPITAL_ADMIN` | Dashboard  revenue line chart |
| `/hospitals/:id/drug-stock` | GET | `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST` | Dashboard  "Low Stock/Expiry" card + Recent Activity (additional call, see Gap 4) |
| `/hospitals/:id/doctors` | GET | `HOSPITAL_ADMIN`, `PATIENT`, `DOCTOR`, `NURSE`, `RECEPTIONIST` | Departments  derived client-side (see Gap 1) |

Response shapes for `dashboard/stats`, `dashboard/weekly-revenue`, and `doctors`
already matched `DashboardStats`, `WeeklyRevenue`, and `DoctorProfile` in
`src/types/hospital.ts` exactly  no type changes were needed for those three.

---

## Gaps found during integration

### Gap 1  No `/departments` endpoint exists  **FIXED**
There was no `GET /hospitals/:id/departments` (or equivalent) route anywhere
in `hospitals.controller.ts`.

**Fix shipped:** added `GET /hospitals/:id/departments` to
`hospitals.controller.ts` (open to `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`,
`NURSE`, `RECEPTIONIST`) and `HospitalsService.getDepartments(hospitalId)`,
which aggregates doctors by `specialization` server-side  the same logic
the frontend's `deriveDepartments()` was doing client-side, just centralized.
Note this method checks the hospital exists (matching the simpler pattern
`findDoctors()` already uses) rather than calling the private
`validateHospitalAccess()` helper used by `getStats()`  that helper only
allows the hospital's *owning admin* (`hospital.userId === userId`), which
would have 403'd every doctor/nurse/receptionist caller.

### Gap 2  `nurseCount` has no backend source  **FIXED (schema migration pending  see below)**
`GET /hospitals/:id/doctors` only returns doctors. There was no per-department
nurse listing anywhere in the API, and `HospitalStaff` (where nurses live)
had no department field at all.

**Fix shipped:** added `department String?` to the `HospitalStaff` model in
`schema.prisma`. `getDepartments()` now also queries
`hospitalStaff.findMany({ where: { hospitalId, department: { not: null } } })`
and counts nurses per department from that field.

**⚠️ Migration not yet applied to the database** — see "Pending migration"
below. Until it's applied, any query touching `Doctor` or `HospitalStaff`
will fail with a Postgres "column does not exist" error, because the
regenerated Prisma client now expects this column to exist.

### Gap 3  `Department.head` and `Department.status` have no backend field  **FIXED (schema migration pending  see below)**
- `head` (department head doctor) didn't exist anywhere in the schema.
- `status: 'ACTIVE' | 'INACTIVE'` was a frontend-only concept, always
  defaulted to `'ACTIVE'`.

**Fix shipped:** added `isDepartmentHead Boolean @default(false)` to the
`Doctor` model. `getDepartments()` now sets `head` to the name of whichever
doctor in that specialization has `isDepartmentHead === true` (or `null` if
none does), and computes `status` as `'ACTIVE'` if at least one doctor in
that specialization has `isAvailable === true`, else `'INACTIVE'` — a
computed value, not a stored one, since "deactivating a department" isn't a
real feature yet and doesn't need its own column.

Same pending-migration caveat as Gap 2 applies here too — both fields were
added in the same schema change.

### Gap 4  "Procured Value" and "Recent Activity" dashboard cards have no clean backend match  **Not fixed — by decision, documented only**
The original Figma/mock dashboard had a "Procured Value" stat card and a
multi-source "Recent Activity" feed (new appointments + low-stock alerts +
procurement deliveries, per `hospital_portal_api_mapping.md` Tab 1.4).
`GET /hospitals/:id/dashboard/stats` has no procurement/spend field at all,
and **there is no Procurement/PurchaseOrder model anywhere in the schema** —
confirmed by searching `schema.prisma` for any procurement-related model.

This is not a bug to fix — it's a net-new feature with no existing data to
build against. Building a schema/endpoint for it without a product spec
(what counts as "procured," who records it, against which inventory) would
mean inventing the feature, not integrating with it. Decision made: leave
this gap as-is and treat it as a follow-up feature task, not part of this
integration.

**What's still shipped as the interim stand-in:** the stat card shows
`monthlyRevenue` (labelled "Monthly Revenue") as the closest available
metric  this is revenue, not procurement spend, and remains an imperfect
substitute. "Recent Activity" still only surfaces a low-stock-count alert
from `GET /hospitals/:id/drug-stock`.

### Gap 5  `appointmentsByStatus.CONFIRMED` is always `0`  **FIXED**
In `hospitals.service.ts::getStats()`, the SQL status-breakdown loop only
checked for `'SCHEDULED'`, `'COMPLETED'`, and `'CANCELLED'`. The backend's
actual `AppointmentStatus` enum has **no `CONFIRMED` value at all**  it's
`SCHEDULED | COMPLETED | CANCELLED | NO_SHOW | ARRIVED | IN_TRIAGE |
READY_FOR_DOCTOR`. So this wasn't just a missing branch  4 of 7 possible
statuses were being silently dropped from the breakdown entirely, not just
`CONFIRMED`.

**Fix shipped:** since there's no exact backend equivalent to map from, a
judgment call was made and documented rather than silently decided:
`ARRIVED`, `IN_TRIAGE`, and `READY_FOR_DOCTOR` are now bucketed into
`CONFIRMED` (they all represent a patient who has shown up and is actively
progressing through the visit, as opposed to merely `SCHEDULED`), and
`NO_SHOW` is bucketed into `CANCELLED` (neither resulted in a completed
visit). Every status row now lands in a bucket; none are dropped. If this
mapping doesn't match how the product actually wants these statuses
grouped, that's a product decision to revisit  the fix here was "stop
silently losing data," not "guess the perfect taxonomy."

### Gap 6  Hospital admin auth — RESOLVED (see `src/docs/HOSPITAL_AUTH_INTEGRATION.md`)
~~Hospital admin auth is not wired into `AuthContext`~~ — this is now fixed.
`src/types/index.ts`'s `User` type now has `hospitalId`, `hospitalName`,
`hospitalStatus`, and `status` fields, and `src/context/AuthContext.tsx`'s
`login()` now has a real `HOSPITAL_ADMIN` case that routes to
`/hospital/admin/dashboard` (gated on `hospitalStatus === 'APPROVED'`, with
`PENDING`/`REJECTED` handled like the existing `PHARMACY` case).

`src/lib/hospital.ts`'s `useHospitalId()` is **intentionally still kept** —
it now reads the real `user.hospitalId` first, and only falls back to
`NEXT_PUBLIC_DEV_HOSPITAL_ID` when there is no authenticated session at all
(dev-only, gated by `NODE_ENV !== 'production'`). This lets teammates keep
building hospital UI without logging in every time, while real sessions get
the real `hospitalId` automatically. See the full auth integration writeup,
including the remaining gaps (no name field on doctor/nurse login response,
no receptionist portal yet), in `src/docs/HOSPITAL_AUTH_INTEGRATION.md`.

### Gap 7  `DEPT_META` icon/color map is keyed by exact specialization strings  **Non-blocking**
`doctor.specialization` is a free-text field on the backend (the existing
`findDoctors()` filter even does a case-insensitive `contains` match,
confirming it's not an enum). Any specialization value not already in
`DEPT_META` (Cardiology, General Medicine, Paediatrics, Surgery, Neurology,
Orthopaedics, Dermatology) falls back to a default teal `Stethoscope` icon 
this already degrades gracefully, no code change required, just noting it for
whoever expands the doctor roster.

---

## ⚠️ Pending migration  required before Gap 2/3 work at runtime

`back-end/src/prisma/schema.prisma` now has two new fields (added for Gap
2/3 above):
- `Doctor.isDepartmentHead Boolean @default(false)`
- `HospitalStaff.department String?`

`npx prisma generate` has been run, so the TypeScript client and backend
build both already expect these columns. **The actual database does not
have them yet** — running `npx prisma migrate dev` from this environment
failed because the direct (non-pooled) connection
(`db.lsjjjtdqnexufakpcuyr.supabase.co:5432`, required for migrations) doesn't
resolve over DNS here, even though the app's normal pooled connection
(`aws-1-eu-west-2.pooler.supabase.com:6543`) works fine for regular queries.

**Action needed before the next backend restart/deploy:**
```bash
cd back-end
npx prisma migrate dev --name add_department_and_dept_head_fields --schema=src/prisma/schema.prisma
```
Run this from a network where the direct Supabase connection resolves (a
different network, a VPN, or directly against Supabase's own infrastructure).
**Do not restart or redeploy the backend before this runs** — the
regenerated client will throw "column does not exist" on any query touching
`Doctor` or `HospitalStaff`, including the doctor-login fix in
`HOSPITAL_AUTH_INTEGRATION.md` and the existing `:id/doctors` endpoint, not
just the new departments endpoint.

If the direct connection genuinely never becomes reachable from anywhere on
your network, the fallback is to run the equivalent SQL directly in
Supabase's SQL editor:
```sql
ALTER TABLE "doctors" ADD COLUMN "isDepartmentHead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "hospital_staff" ADD COLUMN "department" TEXT;
```
then run `npx prisma migrate resolve --applied add_department_and_dept_head_fields`
(after generating the migration folder with `--create-only`) so Prisma's
migration history stays in sync and doesn't think this migration is still
pending on the next `migrate dev`.

---

## Loading / error states implemented
- Dashboard: full-page skeleton (hero + 4 stat cards + 2 chart panels) while
  loading; red error banner with the thrown message if the stats call fails.
  The weekly-revenue and drug-stock calls are non-fatal  if either fails, the
  page still renders with that section in an empty/unavailable state instead
  of blocking the whole page.
- Departments: skeleton department cards (6) while loading; red error banner
  if the doctors call fails; explicit empty state if the hospital has zero
  doctors.

## Verification performed
- `npx tsc --noEmit`  0 errors
- `grep -n "MOCK_ADMIN" src/app/hospital/admin/dashboard/page.tsx`  no results
- `grep -n "MOCK_DEPARTMENTS" src/app/hospital/admin/departments/page.tsx`  no results
- Confirmed real hospital UUID with doctors seeded for local testing:
  `50000000-0000-0000-0000-000000000001` (King Faisal Hospital, 2 doctors,
  admin `admin@kingfaisal.com`).
