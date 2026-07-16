# Hospital Frontend ↔ Backend Gaps

> **Scope of this entry:** `admin/appointments`, `admin/schedule`, `admin/staff`,
> `admin/settings`, `admin/reports`, `receptionist/*`.
> **Source-verified against:** `back-end/src/hospitals/*`, `back-end/src/appointments/*`,
> `back-end/src/reports/*`, `back-end/src/doctors/availability/*`, `back-end/src/prisma/schema.prisma`.
> **Last updated:** 2026-07-15

This file is the running list of frontend↔backend mismatches across the
hospital portal. Each entry below is either confirmed working (✅), confirmed
missing (❌), or missing with a **proposed endpoint spec** so the backend team
can implement it without needing to reverse-engineer intent from the frontend
code. Specs are written to match existing conventions in this codebase
(`validateHospitalAccess`-style ownership checks, `class-validator` DTOs,
`@Roles()` guards, the `mv_department_daily_metrics` materialized-view pattern
for aggregations) — not invented from scratch.

> **Update (2026-07-11):** Rebasing this branch onto `dev` surfaced that
> `doctor/appointments/page.tsx` had been independently wired to real data by
> someone else on `dev` while this branch was in flight, using the same old
> incorrect `PENDING`/`CONFIRMED` status values this PR's `AppointmentStatus`
> fix removes. Reconciled by updating that page's tabs, status map, and
> dropdown options to the real 7-value enum, using the same colour palette as
> `admin/appointments` for consistency. While reconciling, found that page's
> `doctorName` derivation reads `a.doctor.user.hospitalStaff.firstName` —
> which will be `null` for essentially every doctor, since `HospitalStaff` is
> the nurse/receptionist account table, not something a doctor's own login
> user has. `Doctor.firstName`/`Doctor.lastName` exist directly on the
> already-included `doctor` object and would work instead. Left a comment in
> the code rather than fixing it outright — it's a pre-existing bug on that
> page, not something this PR's changes touched or caused, and it's someone
> else's page in flight.

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Confirmed implemented and reachable |
| ⚠️ | Endpoint exists but only usable indirectly / with caveats |
| ❌ | Confirmed missing — proposed spec given below |

---

## admin/reports

| Chart | Status | Source |
|---|---|---|
| Average wait times by Department | ✅ | `GET /reports/department/metrics` |
| Staff Per Department | ⚠️ | derived from `GET /hospitals/:id/doctors` |
| Patient Satisfaction | ❌ | proposed below (Gap R-2) |
| Admitted Patients over time | ❌ | proposed below (Gap R-3) |

### Gap R-2 — Patient Satisfaction

No feedback/rating/survey model exists anywhere in `schema.prisma` for
patients (only `Doctor.rating`, a different metric). Kept on demo data.

**Proposed model:**
```prisma
model AppointmentFeedback {
  id            String      @id @default(uuid())
  appointmentId String      @unique
  patientId     String
  hospitalId    String
  rating        Int         // 1-5, mapped to Excellent/Good/Poor bands on read
  comment       String?
  createdAt     DateTime    @default(now())

  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  patient       Patient     @relation(fields: [patientId], references: [id])
  hospital      Hospital    @relation(fields: [hospitalId], references: [id])

  @@index([hospitalId])
  @@map("appointment_feedback")
}
```

**Proposed endpoint:**
```
GET /hospitals/:id/dashboard/satisfaction
@Roles(Role.HOSPITAL_ADMIN, Role.DOCTOR)   -- same pattern as dashboard/stats
```
Response, matching the frontend's `SatisfactionSlice[]` shape directly so no
mapping layer is needed:
```ts
[
  { name: "Excellent", value: 50, color: "#1E4D8C" },
  { name: "Good",      value: 35, color: "#3B82F6" },
  { name: "Poor",      value: 15, color: "#93C5FD" },
]
```
(`value` as a percentage of total rated appointments; bucket boundaries e.g.
4-5★ = Excellent, 3★ = Good, 1-2★ = Poor — product should confirm exact
bucketing, this is a reasonable default.)

### Gap R-3 — Admitted Patients over time

`GET /inpatient/admissions` exists but returns a raw, unpaginated, undated
list — no monthly aggregation. Kept on demo data.

**Proposed endpoint**, following the same materialized-view pattern already
used for `mv_department_daily_metrics`:
```
GET /hospitals/:id/dashboard/admissions-trend?months=10
@Roles(Role.HOSPITAL_ADMIN, Role.DOCTOR)
```
Response, matching `AdmissionsTrendPoint[]` directly:
```ts
[
  { month: "Jan", admitted: 42, out: 30 },
  { month: "Feb", admitted: 38, out: 28 },
  ...
]
```
Backed by a new `mv_monthly_admissions` view, grouping `InpatientAdmission`
by `DATE_TRUNC('month', admittedAt)` for `admitted`, and by
`DATE_TRUNC('month', dischargedAt)` for `out`, same refresh-job pattern as
`src/reports/jobs/refresh-views.job.ts`.

---

## admin/settings

| Section | GET | PATCH/PUT |
|---|---|---|
| General (hospital profile) | ✅ | ❌ (Gap S-1) |
| Fees | ❌ (Gap S-2) | ❌ (Gap S-2) |
| Announcements | ❌ (Gap S-3) | ❌ (Gap S-3) |
| Departments | ⚠️ derived, read-only | ❌ (Gap S-4) |

### Gap S-1 — `PATCH /hospitals/:id`

No update route exists for hospital profile fields. `GET /hospitals/:id`
works and returns `HospitalDto`.

**Proposed endpoint:**
```
PATCH /hospitals/:id
@Roles(Role.HOSPITAL_ADMIN)
```
```ts
export class UpdateHospitalDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(30)  phone?: string;
}
```
Reuse the existing `validateHospitalAccess(hospitalId, userId)` ownership
check already used by `updateDrugStock` (hospital owner only, 404 if not
found, 403 if not owned). `email` deliberately excluded — `Hospital` has no
`email` column, it lives on the linked `User` row, updating it crosses into
the auth domain and needs separate handling (uniqueness, re-verification).

### Gap S-2 — Fees

No `HospitalFee` model or route at all.

**Proposed model:**
```prisma
model HospitalFee {
  id         String   @id @default(uuid())
  hospitalId String
  service    String
  price      Decimal  @db.Decimal(12, 2)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  hospital   Hospital @relation(fields: [hospitalId], references: [id], onDelete: Cascade)

  @@index([hospitalId])
  @@map("hospital_fees")
}
```
**Proposed endpoints** (standard CRUD, `Role.HOSPITAL_ADMIN`, same ownership
check as Gap S-1):
```
GET    /hospitals/:id/fees
POST   /hospitals/:id/fees        { service: string, price: number }
PATCH  /hospitals/:id/fees/:feeId { service?: string, price?: number, isActive?: boolean }
DELETE /hospitals/:id/fees/:feeId
```

### Gap S-3 — Announcements

No `HospitalAnnouncement` model or route at all.

**Proposed model:**
```prisma
model HospitalAnnouncement {
  id         String   @id @default(uuid())
  hospitalId String
  title      String
  body       String?
  type       String   // 'Urgent' | 'Formal' | 'General'
  postedAt   DateTime @default(now())

  hospital   Hospital @relation(fields: [hospitalId], references: [id], onDelete: Cascade)

  @@index([hospitalId])
  @@map("hospital_announcements")
}
```
**Proposed endpoints** (same pattern as Gap S-2):
```
GET    /hospitals/:id/announcements
POST   /hospitals/:id/announcements   { title: string, body?: string, type: string }
DELETE /hospitals/:id/announcements/:announcementId
```

### Gap S-4 — Departments

No `HospitalDepartment` model. Currently derived read-only from
`GET /hospitals/:id/doctors` grouped by `specialization`; `head` shown as
`—` since there's no `isDepartmentHead`-style field on `Doctor`.

**Proposed model**, if product wants real departments independent of doctor
specialization (recommended — see note below):
```prisma
model HospitalDepartment {
  id         String   @id @default(uuid())
  hospitalId String
  name       String
  headId     String?  // Doctor.id, optional

  hospital   Hospital @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  head       Doctor?  @relation(fields: [headId], references: [id])

  @@unique([hospitalId, name])
  @@map("hospital_departments")
}
```
**Proposed endpoints:**
```
GET    /hospitals/:id/departments
POST   /hospitals/:id/departments   { name: string, headId?: string }
PATCH  /hospitals/:id/departments/:deptId { name?: string, headId?: string }
```
**Note:** this same model would also fix Gap ST-1's "phone" limitation
indirectly and the Reports "Staff Per Department" chart's undercounting
(nurses currently can't be attributed to any department at all). Recommend
scoping this once, not per-page.

---

## admin/staff

### Gap ST-1 — Nurses and receptionists aren't listable

`GET /hospitals/:id/doctors` only returns doctors. `HospitalStaff` (nurses,
receptionists) has no listing endpoint at all. Staff Directory is
doctors-only until this ships; code has a `// TODO: add nurses once
GET /hospitals/:id/staff is available` comment.

**Proposed endpoint**, mirroring the existing `findDoctors` shape/pattern
exactly (including the `select`-scoped `user` include, not an unscoped
`include`, to avoid leaking `password`/`refreshToken`/`verificationCode`):
```
GET /hospitals/:id/staff
@Roles(Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN)
```
```ts
return this.prisma.hospitalStaff.findMany({
  where: { hospitalId },
  select: {
    id: true, firstName: true, lastName: true, phone: true, status: true, createdAt: true,
    user: { select: { email: true } },
  },
  orderBy: [{ lastName: 'asc' }],
});
```
There's no `role` field distinguishing nurse vs. receptionist on
`HospitalStaff` itself, only implicit via `User.role`. Response should
probably join/include that (`user: { select: { email: true, role: true } }`)
so the frontend can tell nurses and receptionists apart in the Role column.

---

## admin/schedule

### Gap SC-1 — Slots endpoint is availability, not bookings (clarification, not a missing endpoint)

`GET /doctors/:doctorId/slots?date=` (already implemented, unauthenticated —
no `@Roles()` or even `@UseGuards()` on this route, confirmed by reading
`availability.controller.ts` directly) returns free/bookable slot times, not
existing appointments. The schedule page uses it correctly for a separate
"Open slots" panel, and uses `GET /appointments` (real bookings) for the
hourly grid and month view. No backend change needed here — flagging only so
whoever builds a real booking flow on this same endpoint (mentioned
elsewhere as in progress) knows this route is intentionally public and
availability-only, not an accidental gap.

**Worth a small backend follow-up, not blocking:** this route has no auth
guard at all. If it's meant to be public (e.g. for a pre-login booking
widget), that's fine, but it should be an explicit `@Public()` decorator or
similar if this codebase has one, not just an absent `@UseGuards()`, so it
reads as intentional rather than forgotten.

---

## admin/appointments

### Gap A-1 — `AppointmentStatus` type didn't match the real enum (frontend-only, fixed in this PR)

`types/hospital.ts` declared `PENDING | CONFIRMED | READY_FOR_DOCTOR |
COMPLETED | CANCELLED`. The real Prisma enum is `SCHEDULED | COMPLETED |
CANCELLED | NO_SHOW | ARRIVED | IN_TRIAGE | READY_FOR_DOCTOR`. Fixed the
type; no backend change needed, this was purely a frontend/schema drift.

### Optional enhancement — server-side status filtering

`GET /appointments` has no `?status=` query param; the admin/appointments
status filter is client-side over the full fetched list. Not blocking (the
hospital-scoped list is small enough that client-side filtering is fine
today), but worth a note: if appointment volume grows, a
`GET /appointments?status=SCHEDULED` param (matching the `?from=&to=` style
already used elsewhere) would be a natural addition. Not proposing a full
spec since this isn't blocking anything today.

---

## receptionist/* (Hospital Receptionist Portal Gaps)

### Missing Endpoints
1. `GET /hospitals/:hospitalId/receptionist/dashboard` (Missing in Swagger)
2. `GET /hospitals/:hospitalId/receptionist/notifications` (Missing in Swagger)
3. `PATCH /hospitals/:hospitalId/receptionist/notifications/read-all` (Missing in Swagger)
4. `PATCH /hospitals/:hospitalId/receptionist/notifications/:id/read` (Missing in Swagger)
5. `GET /hospitals/:hospitalId/receptionist/queue` (Missing in Swagger)
6. `GET /hospitals/:hospitalId/receptionist/dashboard-stats` (Missing in Swagger)
7. `GET /hospitals/:hospitalId/receptionist/appointments` (Missing in Swagger)
8. `GET /hospitals/:hospitalId/receptionist/profile` (Missing in Swagger)
9. `GET /hospitals/:hospitalId/receptionist/leaves` (Missing in Swagger)

### Missing Data Seeds / Authentication
* **Missing Receptionist User Seed**: The receptionist login is not seeded in the database. This currently causes a `401 Unauthorized` during login since no valid receptionist accounts exist to test this portal fully. The frontend UI currently handles it gracefully by loading the component shell and displaying an error boundary/state when the session is missing or endpoints return a 401.
