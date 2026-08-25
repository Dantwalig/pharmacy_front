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

### Gap 1  `DOCTOR` role login is broken for every seeded doctor  **FIXED**
Originally documented as "no name field in the response"  manual testing
against the running backend (logging in as `eric@kingfaisal.com` /
`Test@1234`) surfaced a deeper problem: **doctor login failed outright** with
`401 Unauthorized: Staff profile not found`.

**Root cause (confirmed by reading `back-end/src/auth/auth.service.ts` and
`back-end/prisma/seed.ts`):** the seed script creates doctors as
`prisma.doctor.create(...)` records only, and `auth.service.ts`'s `login()`
method never queried `prisma.doctor` at all for the `DOCTOR` role  only
`prisma.staff` and `prisma.hospitalStaff`, neither of which the seeded
doctors have a row in.

**Fix shipped in `back-end/src/auth/auth.service.ts`:** added a fallback
branch  if `role === 'DOCTOR'` and no `HospitalStaff` row exists, the
login method now queries `prisma.doctor.findFirst({ where: { userId } })`
directly. If found, it generates tokens scoped to `doctor.hospitalId` and
returns a response carrying `doctorId`, `firstName`, `lastName`,
`specialization`, and `hospitalName`  closing this gap and Gap 1b below in
the same change. Doctors onboarded the correct way (via
`onboard/hospital-staff`, which already creates both a `HospitalStaff` and
`Doctor` row) continue to use the existing `HospitalStaff` branch, which was
also updated (see Gap 1b) to surface the same fields.

### Gap 1b  Even a successful DOCTOR login had no `Doctor.id`  **FIXED**
This was a second, independent problem from Gap 1  fixing Gap 1 alone would
not have fixed this.

**Root cause (confirmed by reading `auth.service.ts` and `schema.prisma`
together):** `Appointment.doctorId` and `Prescription.doctorId` both
reference `Doctor.id`  not `User.id`. The `HospitalStaff`-branch login
response never included it, so even a doctor onboarded the *correct* way
(with both a `HospitalStaff` and `Doctor` row) would log in successfully but
have no ID usable for `GET /appointments?doctorId=:id` or creating a
prescription.

**Fix shipped:** the existing `hospitalStaff` branch in `login()` now also
queries `prisma.doctor.findFirst({ where: { userId } })` when
`role === 'DOCTOR'`, and includes `doctorId: doctor.id` and `specialization`
in the response alongside the existing `hospitalId`/`hospitalName`. The same
branch was also extended to return `firstName`/`lastName` for every hospital
staff role (doctor, nurse, receptionist)  those fields already existed on
`HospitalStaff` but were never selected into the response, which was the
literal "no name field" complaint this gap started as.

**Net result for whoever picks up doctor-side integration work (dashboard,
appointments, schedule, prescription, consultations):** the login response
for a `DOCTOR` now reliably includes `doctorId`, `firstName`, `lastName`,
`specialization`, `hospitalId`, and `hospitalName`, regardless of whether
the doctor was seeded directly or onboarded through the staff flow.

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

### Gap 6  No route-level auth guard existed for any `/hospital/*` route  RESOLVED
`src/middleware.tsx` already had working role-based guards for
`/super-admin`, `/pharmacy`, `/patient`, `/branch`, and `/staff`, but
`/hospital/*` had an explicit `// TODO: add hospital auth once login flow is
confirmed  for now all /hospital/* routes are open` and its `config.matcher`
didn't even include `/hospital/:path*`, so the middleware function never ran
for hospital paths at all. This meant **none** of the four hospital roles
(admin, doctor, nurse, receptionist) had any protection  not "admin-only,"
literally none. Anyone could navigate straight to e.g.
`/hospital/admin/dashboard` with no token and no redirect.

**Resolution shipped:** added `/hospital/:path*` to the matcher (excluding
`/hospital/register`, which must stay public), and added a guard block
mirroring the existing `isStaffRoute` pattern:
- No token, or an undecodable token  redirect to `/`.
- Role must be `HOSPITAL_ADMIN`, `DOCTOR`, or hospital-side `NURSE` (the same
  `hospitalId`-presence discriminator used everywhere else in this doc) 
  any other role redirects to `/`.
- Path-specific check: `/hospital/admin/*` requires `HOSPITAL_ADMIN`,
  `/hospital/doctor/*` requires `DOCTOR`, `/hospital/nurse/*` requires the
  hospital-`NURSE` discriminator  cross-role access (e.g. a doctor visiting
  `/hospital/admin/dashboard`) now redirects instead of silently rendering.
- `HOSPITAL_ADMIN` additionally checks `payload.status` (the hospital's
  approval status, present in the JWT for that role only): `PENDING` 
  `/pending-approval`, anything else but `APPROVED`  redirect to `/`.

This was previously untested end-to-end for the same reason Gap 1 blocks
real doctor logins  there was no way to get a real hospital-staff token to
verify against until that's fixed. The guard logic itself was written
against the confirmed JWT payload shape from `generateTokens()` in
`auth.service.ts`, not guessed.

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

<!-- Hospital Nurse Auth Helper -->
**Resolution shipped:** the frontend now uses a shared helper,
`isHospitalNurse(user)`, from `src/lib/auth.ts` (and reused by the
hospital nurse topbar hook and the hospital guard). The `NURSE` case in
`AuthContext.login()` routes through that helper instead of keeping an inline
`userData.hospitalId` check. If the helper returns true → routes to
`/hospital/nurse/dashboard` (or `/hospital/nurse/settings` if
`requiresPasswordChange`). If false → unchanged existing behavior, routes to
`/staff/dashboard` / `/staff/change-password`. The pre-existing pharmacy-nurse
flow is untouched.