# Hospital Doctor Portal – Backend Integration Contract

Covers the live-data migration for:
- `src/app/hospital/doctor/dashboard/page.tsx`
- `src/app/hospital/doctor/schedule/page.tsx`
- `src/app/hospital/doctor/layout.tsx`

Both backend fixes shipped in this PR are documented below alongside the one remaining non-blocking gap.

---

## Fixed in this PR — was Gap 1

### `GET /api/doctors/dashboard` (new endpoint, Doctor only)

**Backend files changed:** `src/doctors/doctors.controller.ts`, `src/doctors/doctors.service.ts`

The hospital-wide stats endpoints (`GET /hospitals/:id/dashboard/stats`, `/weekly-revenue`, `/daily-appointments`) are all guarded by `@Roles(Role.HOSPITAL_ADMIN)` and call `validateHospitalAccess` which checks `hospital.userId === req.user.sub`. A doctor's `userId` will never match, so adding the DOCTOR role to those routes would still throw 403 inside the service.

A dedicated endpoint scoped entirely to the calling doctor's own records was added instead:

```
GET /api/doctors/dashboard
@Roles(Role.DOCTOR)
```

Response shape:
```json
{
  "todayAppointments":    4,
  "totalPatients":        31,
  "completedConsults":    18,
  "totalAppointments":    42,
  "appointmentsByStatus": { "COMPLETED": 18, "CANCELLED": 3, "SCHEDULED": 12, ... },
  "weeklyVisits": [
    { "label": "Jun 2 – Jun 8",  "count": 8 },
    { "label": "Jun 9 – Jun 15", "count": 11 },
    { "label": "Jun 16 – Jun 22","count": 7  },
    { "label": "Jun 23 – Jun 29","count": 5  }
  ],
  "doctorName":     "Alice Mutoni",
  "specialization": "Cardiologist",
  "hospitalName":   "E-Vuze General Hospital"
}
```

The frontend dashboard uses this for all four stat cards, the weekly visit chart, and the patient category donut. The layout uses `doctorName` and `specialization` for the topbar.

---

## Fixed in this PR — was Gap 3

### `GET /api/appointments?from=&to=` (date-range filter added, Doctor role)

**Backend files changed:** `src/appointments/appointments.controller.ts`, `src/appointments/appointments.service.ts`

`from` and `to` are now optional query params. When provided, the DOCTOR branch of `findAll` applies an inclusive date filter:

```typescript
if (from) dateFilter.gte = new Date(from);
if (to) {
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);
  dateFilter.lte = toDate;
}
```

Other roles (PATIENT, HOSPITAL_ADMIN, SUPER_ADMIN) ignore the params — no behaviour change for them.

The schedule page now passes `?from=YYYY-MM-DD&to=YYYY-MM-DD` on every render and re-fetches when the user navigates weeks or months, satisfying the test plan requirement that "navigating weeks fires a new request scoped to that doctor".

---

## Remaining gap — `condition` / `healthStatus` fields (non-blocking)

The original mock data had `condition` (e.g. `HYPERTENSION`) and `healthStatus` (e.g. `STABLE`) per appointment. Neither field exists on the `Appointment` Prisma model or in `appointmentInclude`.

**Current workaround:** The recent appointments table shows `reason` (free-text from booking) and `type` (`IN_PERSON` / `ONLINE`) as the closest available substitutes.

**Backend action required (optional):** Expose `triageVitals.diagnosis` inside `appointmentInclude`, or add a `clinicalStatus` enum column to the `Appointment` model.

---

## Summary

| # | Gap | Status |
|---|---|---|
| 1 | Doctor-scoped dashboard stats endpoint | ✅ Fixed — `GET /doctors/dashboard` added |
| 2 | Notifications endpoint not working for doctors | ✅ Not a real gap — `userType` param is unused in the service; filters by `userId` only |
| 3 | No date-range filter on `GET /appointments` | ✅ Fixed — `?from=&to=` added for DOCTOR role |
| 4 | Doctor name absent from JWT | ✅ Resolved — `doctorName` returned by `GET /doctors/dashboard` |
| 5 | `condition` / `healthStatus` absent from appointments | ⚠ Non-blocking — `reason` used as substitute |
