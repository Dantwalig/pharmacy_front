# Doctor Portal — Remaining Pages API Gaps

**Branch:** `feat/doctor-real-api-pages`  
**Pages migrated:** `doctor/appointments`, `doctor/appointments/[id]`, `doctor/messages`, `doctor/prescription`, `doctor/settings`

---

## What works (real API)

| Page | Endpoint | Notes |
|------|----------|-------|
| `doctor/appointments` | `GET /api/appointments` | Doctor-scoped via JWT. Supports `?from=` and `?to=` date filters. Response includes `patient.firstName/lastName/phone`, `hospital.name`, `type`, `reason`, `status`. |
| `doctor/appointments/[id]` | `GET /api/appointments/:id` | Returns single appointment with same include shape. Also includes `diagnosisSummary` and `doctorRecommendations` when set. |
| `doctor/prescription` (form submit) | `POST /api/prescriptions/hospital-issue` | Issues a prescription. Requires `patientId`, `hospitalId`, `diagnosis`, and `medications[]` (name, dosage, frequency, duration, optional quantity). |
| `doctor/settings` (password) | `PUT /api/auth/change-password` | Accepts `currentPassword`, `newPassword`, `confirmPassword`. |
| `doctor/settings` (profile load) | `GET /api/doctors/dashboard` | Returns `doctorName`, `specialization`, `hospitalName`. Used to populate profile display. |

---

## Gap 1 — No real-time messaging API

**Page:** `doctor/messages`  
**Expected endpoint:** `GET /api/messages` or WebSocket room  
**Current fallback:** Page loads `GET /api/notifications?userType=doctor` and displays notifications as conversation threads. The send-message input is disabled.  
**Impact:** Doctors cannot send messages to nurses, receptionists, or other doctors through the portal.  
**Suggested backend work:** Add a `MessagesModule` with at minimum:
- `GET /api/messages/threads` — list conversation threads for the authenticated user
- `GET /api/messages/threads/:id` — load messages in a thread
- `POST /api/messages/threads/:id/send` — send a message

---

## Gap 2 — Prescription history by patient UUID

**Page:** `doctor/prescription` (right panel, prescription history)  
**Expected endpoint:** `GET /api/prescriptions/for-patient/:patientId` (by UUID)  
**Actual endpoint:** `GET /api/prescriptions/patient/:mrn` (by MRN, requires `?hospitalId=`)  
**Problem:** The appointments response (`GET /api/appointments`) includes `patientId` (UUID) but does NOT include the patient's MRN. Without MRN the doctor cannot load a patient's prescription history.  
**Impact:** Past prescriptions are hidden; the form tab shows a gap notice.  
**Suggested backend work:** Add `GET /api/prescriptions/for-patient/:patientId` scoped to `Role.DOCTOR` and `Role.HOSPITAL_ADMIN`, or include `mrn` in the appointments `patient` include.

---

## Gap 3 — Doctor cannot edit own profile

**Page:** `doctor/settings` (Profile tab)  
**Expected endpoint:** `PATCH /api/doctors/me` or `PATCH /api/doctors/:id` (DOCTOR role)  
**Actual endpoint:** `PATCH /api/doctors/:id` — guarded to `Role.HOSPITAL_ADMIN` only  
**Impact:** The profile form fields are displayed as read-only. Doctors cannot update their phone, email, or specialization themselves.  
**Suggested backend work:** Add `PATCH /api/doctors/me` for `Role.DOCTOR` or expand the guard on the existing endpoint.

---

## Gap 4 — Doctor profile endpoint returns limited fields

**Page:** `doctor/settings` (Department tab)  
**Endpoint used:** `GET /api/doctors/dashboard`  
**Missing fields:** `licenseNumber`, `workingHours`, `phone`  
**Actual response includes:** `doctorName`, `specialization`, `hospitalName`, and stats counts  
**Impact:** License number and working hours show as "—" in the Department tab.  
**Suggested backend work:** Either add a `GET /api/doctors/me` endpoint that returns the full Doctor record (including `licenseNumber`, `workingHours`), or extend the dashboard response to include them.

---

## Gap 5 — Drug stock search for prescription form

**Page:** `doctor/prescription` (medication name input)  
**Previous mock:** `MOCK_DRUG_STOCK` dropdown showed available drugs with stock levels  
**Current state:** Plain text input for medication name (the `POST /prescriptions/hospital-issue` DTO accepts any string for `name`)  
**Suggested backend work:** Expose `GET /api/inventory/hospital/:hospitalId/drugs` or `GET /api/hospitals/:hospitalId/drug-stock` accessible to `Role.DOCTOR`, returning `{ brandName, genericName, dosageStrength, dosageForm, quantity }`.

---

## Swagger reference

Confirmed endpoints visible in Swagger at `GET /api/docs`:

- `GET /api/appointments` — ✅ exists, doctor-scoped
- `GET /api/appointments/:id` — ✅ exists
- `POST /api/prescriptions/hospital-issue` — ✅ exists (Doctor only)
- `PUT /api/auth/change-password` — ✅ exists
- `GET /api/doctors/dashboard` — ✅ exists (Doctor only)
- `GET /api/notifications` — ✅ exists (used as messages fallback)

Missing from Swagger (backend not yet built):

- `GET /api/messages/threads` — ❌ not implemented
- `GET /api/prescriptions/for-patient/:patientId` — ❌ not implemented
- `PATCH /api/doctors/me` — ❌ not implemented
- `GET /api/inventory/hospital/:hospitalId/drugs` — ❌ not implemented (for prescription drug search)
