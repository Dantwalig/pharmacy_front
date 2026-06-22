# Hospital Auth Integration Notes

> Scope: extended the existing unified login (`src/app/login/page.tsx` →
> `useAuth()` → `src/context/AuthContext.tsx`) to handle hospital roles
> (`HOSPITAL_ADMIN`, `DOCTOR`, hospital-side `NURSE`), added a hospital
> signup page, and replaced direct `MOCK_DOCTOR`/`MOCK_ADMIN`/`MOCK_NURSE`
> imports in the hospital layouts/dashboards with real auth, falling back to
> mocks only in dev when no session exists. No separate hospital-only login
> page was built  by design.

---

## Endpoints used

Confirmed directly against `back-end/src/auth/auth.service.ts`,
`auth.controller.ts`, and `back-end/src/prisma/schema.prisma`
(source-verified, not assumed).

| Endpoint | Method | Used by |
|---|---|---|
| `/auth/login` | POST | All roles, including the 3 new hospital cases added to the `login()` switch |
| `/auth/register/hospital` | POST | New `src/app/hospital/register/page.tsx` |
| `/auth/onboard/hospital-staff` | POST | Already exists on the backend (admin-only, creates DOCTOR/NURSE/RECEPTIONIST)  **not yet called from any frontend page**; hospital admin has no "Add Staff" UI wired to it yet |
| `/auth/hospital-staff/activate` | POST | Already exists on the backend (sets permanent password via emailed link)  **no frontend page consumes this yet** |

---

## The NURSE role collision  how it was resolved

The backend's `UserRole` enum (`back-end/src/prisma/schema.prisma`) has a
single `NURSE` value shared by both a pharmacy/branch-staff nurse and a
hospital nurse  there is no `HOSPITAL_NURSE` variant. The two are
distinguished server-side by which table the staff record lives in
(`staff` vs. `hospitalStaff`), and the login response/JWT payload reflects
that via a `hospitalId` field that is **only present for the hospital
case**.

**Resolution shipped:** `AuthContext.login()`'s `NURSE` case now checks
`userData.hospitalId`. If present → routes to `/hospital/nurse/dashboard`
(or `/hospital/nurse/settings` if `requiresPasswordChange`). If absent →
unchanged existing behavior, routes to `/staff/dashboard` /
`/staff/change-password`. The pre-existing pharmacy-nurse flow is untouched.

---

## Gaps found during integration

### Gap 1  `DOCTOR` role login is broken for every seeded doctor  **Blocking, confirmed by manual testing**
Originally documented as "no name field in the response"  manual testing
against the running backend (logging in as `eric@kingfaisal.com` /
`Test@1234`) surfaced a deeper problem: **doctor login fails outright** with
`401 Unauthorized: Staff profile not found`.

**Root cause (read directly from `back-end/src/auth/auth.service.ts` and
`back-end/prisma/seed.ts`, not assumed):**
- The seed script creates doctors (e.g. `eric@kingfaisal.com`,
  `robert@chuk.com`) as `prisma.doctor.create(...)` records only  the
  `Doctor` model is what holds `firstName`, `lastName`, `specialization`,
  `licenseNumber`, etc.
- `auth.service.ts`'s `login()` method, for any role in
  `['PHARMACIST', 'CASHIER', 'NURSE', 'DOCTOR', 'RECEPTIONIST']`, only ever
  queries `prisma.staff` (pharmacy branch staff) and then
  `prisma.hospitalStaff` (lines 229339). **It never queries `prisma.doctor`
  at all.** Since seeded doctors have no `HospitalStaff` row, both lookups
  return nothing and line 341 throws `Staff profile not found`.
- This means no doctor seeded the way the current seed script does it can
  log in today, independent of anything on the frontend. The `DOCTOR` case
  added to `AuthContext.login()` in this integration is correct and will
  work the moment the backend returns a successful response  it has not
  been exercised end-to-end yet because of this backend bug.

**What shipped on the frontend regardless:** `src/lib/hospital.ts`'s
`useHospitalDoctorUser()` derives a display name from the email's local part
as a stand-in for when a real response does come back, since even a fixed
`hospitalStaff`-style response wouldn't include a name field today. The
specialization/department field is left blank rather than invented.

**Backend action needed (not made  by request, documenting only):** add a
branch in `login()` for `DOCTOR` that queries `prisma.doctor.findFirst({
where: { userId } })` (mirroring the existing `hospitalStaff` branch) and
returns `hospitalId`, `firstName`, `lastName`, and `specialization` from
that record. Until this lands, the `DOCTOR` path in `AuthContext` cannot be
verified against a real login  only against the static response shape
already confirmed for `HOSPITAL_ADMIN`.

### Gap 1b  Even a successful DOCTOR login has no `Doctor.id`  **Blocking for all downstream doctor-side integration work**
Confirmed by reading `back-end/src/auth/auth.service.ts` (the `onboardHospitalStaff`
transaction) and `back-end/prisma/schema.prisma` together  this is a
second, independent problem from Gap 1 above, and it does **not** go away
once Gap 1 is fixed.

**What's confirmed correct:** `POST /auth/onboard/hospital-staff` with
`role: 'DOCTOR'` does the right thing today  inside one transaction it
creates both a `HospitalStaff` row (for login) and a `Doctor` row (for
clinical data), linked by the same `userId`. A doctor onboarded through this
endpoint, not the seed script, would not hit Gap 1 at all.

**What's still broken either way:** `Appointment.doctorId` and
`Prescription.doctorId` both reference `Doctor.id`  not `User.id`, not
`HospitalStaff.id`. The hospital-staff login response is:
```ts
{ id, email, role, hospitalId, hospitalName, status, requiresPasswordChange }
```
That `id` is the `User.id`. **`Doctor.id` is not present anywhere in this
response.** So even after a fully successful login (real or fixed), the
frontend has no ID it can use to call `GET /appointments?doctorId=:id`,
fetch the doctor's own schedule, or create a prescription tied to that
doctor.

**Why this matters beyond this PR:** every doctor-side backend integration
task (dashboard, appointments, schedule, prescription, consultations) will
hit this exact wall the moment it gets past login  not because of
anything wrong in those tasks, but because the one ID they all need to
scope their API calls with was never returned. Whoever picks up that work
should read this gap first rather than rediscover it independently.

**Backend action needed (not made  documenting only):** include
`doctorId: doctor.id` in the hospital-staff login response when
`role === 'DOCTOR'` (a one-line addition to the existing `hospitalStaff`
branch, since the transaction already guarantees a matching `Doctor` row
exists for staff onboarded the correct way), or add a `GET /doctors/me`
lookup the frontend can call once authenticated.

### Gap 2  Hospital admin's display name comes from the Hospital record, not a person  **Non-blocking, workaround shipped**
The `HOSPITAL_ADMIN` login response's `profile` field is the full `Hospital`
record (name, address, status, etc.), not an admin-person record. The
`Hospital` model does have a `representativeName` field, which is used as
the admin's display name in `useHospitalAdminUser()`. This is a reasonable
stand-in since `representativeName` is explicitly collected at hospital
registration time and represents the person who signed up  no backend
change needed unless a hospital admin should ever differ from the original
registering representative.

### Gap 3  No frontend portal exists for `RECEPTIONIST`  **Blocking for that role, not for DOCTOR/ADMIN/NURSE**
The backend fully supports a `RECEPTIONIST` role end-to-end (it's in the
`UserRole` enum, `OnboardHospitalStaffDto` accepts it, and the login
endpoint returns a normal hospital-staff response for it) but there is no
`/hospital/receptionist/*` route tree in the frontend at all.

**What shipped instead:** `AuthContext.login()`'s new `RECEPTIONIST` case
shows an explicit toast ("The receptionist portal is not available yet")
and logs the user back out, rather than silently dropping them into the
wrong portal or a blank page.

**Backend action needed:** none  this is purely a frontend gap. Needs a
design + page-build task (same shape as the nurse portal foundation work)
before this case can route anywhere real.

### Gap 4  Hospital admin onboarding/activation flow has no frontend UI  **Non-blocking for auth itself**
`POST /auth/onboard/hospital-staff` and `POST /auth/hospital-staff/activate`
both exist and work on the backend, but no page calls them. A hospital admin
currently has no way to add a doctor/nurse/receptionist from the UI, and a
newly-onboarded staff member has no page to land on for the "activate your
account" emailed link.

**Backend action needed:** none. Needs a follow-up frontend task: an "Add
Staff" flow on `/hospital/admin/staff` calling `onboard/hospital-staff`, and
an `/hospital/activate` (or similar) page calling `hospital-staff/activate`.

### Gap 5  `useHospitalId()` dev-fallback  RESOLVED
`src/lib/hospital.ts`'s `useHospitalId()` (used by the already-integrated
admin dashboard/departments pages) now reads the real `user.hospitalId`
first and only falls back to `NEXT_PUBLIC_DEV_HOSPITAL_ID` when there is no
authenticated session **and** `NODE_ENV !== 'production'`  a logged-out
production user gets `undefined`, never a real dev hospital's id.

---

## Files changed

- `src/types/index.ts`  extended `UserRole` (`HOSPITAL_ADMIN`, `DOCTOR`,
  `RECEPTIONIST`; `NURSE` already existed and is reused), extended `User`
  with `hospitalId`/`hospitalName`/`hospitalStatus`/`status`, extended
  `DecodedToken` with `hospitalId`/`status`.
- `src/lib/auth.ts`  `getUserFromToken()`'s JWT-decode fallback path now
  also extracts `hospitalId`/`hospitalStatus`/`status`.
- `src/context/AuthContext.tsx`  `login()` switch: added `HOSPITAL_ADMIN`,
  `DOCTOR`, `RECEPTIONIST` cases; split `NURSE` out of the
  `PHARMACIST`/`CASHIER` fallthrough to add the `hospitalId` discriminator.
- `src/lib/hospital.ts`  added `useHospitalAdminUser()`,
  `useHospitalDoctorUser()`, `useHospitalNurseUser()`, each returning real
  auth data when logged in and falling back to the existing
  `MOCK_ADMIN`/`MOCK_DOCTOR`/`MOCK_NURSE` only outside production with no
  session.
- `src/app/hospital/register/page.tsx`  new hospital signup page, posts to
  `/auth/register/hospital` with the exact `RegisterHospitalDto` shape.
- `src/app/hospital/admin/layout.tsx`, `src/app/hospital/doctor/layout.tsx`,
  `src/app/hospital/nurse/layout.tsx`  now use the new hooks instead of
  importing mock users directly.
- `src/app/hospital/admin/dashboard/page.tsx`,
  `src/app/hospital/doctor/dashboard/page.tsx`  same swap for their
  greeting's `firstName`.
- `src/components/hospital/HospitalSidebar.tsx`  logout already called
  `useAuth().logout()` (not `localStorage.clear()`) by the time this task
  started; no change needed, confirmed working correctly.

## Verification performed
- `grep -rn "MOCK_DOCTOR\|MOCK_ADMIN\b\|MOCK_NURSE" src/app/hospital/`  no
  results outside the layouts'/dashboards' own hook calls (which live in
  `src/lib/hospital.ts`, not the pages themselves).
- `grep -n "localStorage.clear()" src/components/hospital/HospitalSidebar.tsx`
   no results.
