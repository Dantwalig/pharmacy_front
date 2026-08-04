# Hospital Admin Portal - Integration Audit Report
**Date:** 2026-08-04  
**Branch:** qa/portal-integration-audit  
**Method:** Static source-code analysis (every page file read in full)

---

## Summary Table

| Page | Route | Previously On | Network Calls | Verdict |
|---|---|---|---|---|
| Dashboard | /hospital/admin/dashboard | Real API | GET /hospitals/:id/dashboard/stats, /daily-appointments, /drug-stock | PASS ✓ |
| Departments | /hospital/admin/departments | Real API | GET /hospitals/:id/doctors | PASS ✓ (minor caveat) |
| Finance | /hospital/admin/finance | Real API (claimed) | None | STILL MOCK |
| Inventory | /hospital/admin/inventory | Real API (claimed) | None | STILL MOCK |
| Staff | /hospital/admin/staff | Mock | GET /hospitals/:id/doctors | PASS (doctors only) |
| Appointments | /hospital/admin/appointments | Mock | GET /appointments, PATCH /appointments/:id/status | PASS ✓ |
| Schedule | /hospital/admin/schedule | Mock | GET /hospitals/:id/doctors, GET /appointments, GET /doctors/:id/slots | PASS ✓ |
| Settings | /hospital/admin/settings | Mock | GET /hospitals/:id, GET /hospitals/:id/doctors | PARTIAL |

---

## Previously-Real-API Pages - Regression Check

### 1. Dashboard - PASS ✓ (No regression)
**File:** `src/app/hospital/admin/dashboard/page.tsx`

**Network requests confirmed in code:**
- `useHospitalDashboardStats(hospitalId)` hook - calls the dashboard stats endpoint
- `GET /hospitals/${hospitalId}/dashboard/daily-appointments` - for volume chart
- `GET /hospitals/${hospitalId}/drug-stock` - for low-stock badge count

**Integration status:** All three data sources are wired and active. Stat cards display `-` while loading and populate from real data. Low-stock count is derived from the drug stock response (`items.filter(d => d.lowStockAlert).length`).

Name in hero comes from `useHospitalAdminUser()` hook (auth context), not hardcoded.

**Verdict:** PASS. No regression.

---

### 2. Departments - PASS ✓ (minor hardcoded fallback)
**File:** `src/app/hospital/admin/departments/page.tsx`

**Network requests confirmed in code:**
- `GET /hospitals/${hospitalId}/doctors`

**Integration status:** Doctors are fetched and mapped to department groups and the employee directory. Both `serviceGroups` and `employees` state variables are populated from the API response.

**Minor caveat:** There is a hardcoded `EMPLOYEES` array in the file:
```js
const EMPLOYEES: Employee[] = [
  { name: 'Ella Mutesi', ... },
  { name: 'Kelly Butera', ... },
  { name: 'Mary Kagabo', ... },
  { name: 'Howard Magaju', ... },
];
```
This is used as the **initial value** for `employees` state but is immediately overwritten when the API returns data (`if (mapped.length) setEmployees(mapped)`). If the API returns an empty array, these 4 mock employees will remain visible. Similarly, `SERVICE_GROUPS` has hardcoded service group data that only gets replaced if `derived.length > 0`.

**Verdict:** PASS. Minor concern: if the hospital has no doctors the hardcoded fallback names appear.

---

### 3. Finance - STILL MOCK ⚠️
**File:** `src/app/hospital/admin/finance/page.tsx`

**Network requests:** None. Zero API calls in the entire file.

**Mock data imports detected:**
```
import { MOCK_INVOICES } from '@/mock/hospital/finance';
```

**Hardcoded data visible in UI:**
- Revenue chart: `REVENUE_CHART_DATA` - 7 hardcoded monthly data points (JAN–JUL)
- KPI cards: Hardcoded strings - `'RWF 123,456'`, `'RWF 54,321'`, `'+12.5% from last week'`
- Payment breakdown: `PAYMENT_BREAKDOWN` - mobile money 1,530,769 RWF / cash 2,037,670 RWF - hardcoded
- Refund table: `REFUNDS` - 4 hardcoded refund records (RF-005 through RF-008)
- Invoice table: `MOCK_INVOICES` from mock file

This page was previously described as "Real API" in the task description. **This is incorrect** - the source code shows it has never been migrated. All data is hardcoded or from mock imports.

**Verdict:** STILL MOCK. The "Real API" status in the task was inaccurate.

---

### 4. Inventory - STILL MOCK ⚠️
**File:** `src/app/hospital/admin/inventory/page.tsx`

**Network requests:** None. Zero API calls.

**Hardcoded data:**
```js
const ITEMS: InventoryItem[] = [
  { id: 'amox-500', name: 'Amoxicillin 500mg', ... },
  { id: 'ibu-400', name: 'Ibuprofen 400mg', ... },
  { id: 'lisinopril-10', name: 'Lisinopril 10mg', ... },
  { id: 'gloves-sterile', name: 'Surgical Sterile Gloves', ... },
  { id: 'masks-n95', name: 'N95 Respirator Masks', ... },
  { id: 'ecg-monitor', name: 'ECG Patient Monitor', ... },
  { id: 'defib-auto', name: 'Automated Defibrillator', ... },
];
```

The "Save" button on quantity edit only updates local React state (`setItems(...)`). No `PATCH` or `POST` to the backend.

**Note:** The admin Dashboard **does** call `GET /hospitals/:id/drug-stock` for the low-stock count badge. However the Inventory page itself never uses this endpoint and shows different hardcoded data instead.

This page was also previously described as "Real API." **This is incorrect** - it has never been migrated.

**Verdict:** STILL MOCK. The "Real API" status in the task was inaccurate.

---

## Previously-Mock Pages - Migration Check

### 5. Staff - PASS (doctors only, nurses/receptionists pending)
**File:** `src/app/hospital/admin/staff/page.tsx`

**Network requests:**
- `GET /hospitals/${hospitalId}/doctors`

**Integration status:** Staff page has been migrated to call real API. The page maps doctor records to `HospitalStaffMember[]` and populates stat cards (total, active, inactive, department count) from live data. Pagination, search, and filter all work on the live dataset.

**Limitation acknowledged in code:**
```js
// GET /hospitals/:id/doctors - the backend only returns doctors here.
// TODO: add nurses once GET /hospitals/:id/staff is available. Nurses and
// receptionists exist on the backend (HospitalStaff model) but there is no
// endpoint to list them yet...
```

The Role filter dropdown shows Doctor / Nurse / Receptionist options, but filtering by Nurse or Receptionist will return empty results because only doctors are fetched.

**Verdict:** PASS for doctors. Nurse/Receptionist rows are a known pending gap (Gap ST-1 in docs).

---

### 6. Appointments - PASS ✓
**File:** `src/app/hospital/admin/appointments/page.tsx`

**Network requests:**
- `GET /appointments` on mount (admin JWT-scoped)
- `PATCH /appointments/${appointmentId}/status` on status change

**Integration status:** Fully migrated. The page uses the real backend appointment shape (`{ id, date, status, reason, type, patient: { firstName, lastName }, doctor: { firstName, lastName, specialization } }`). Status change is wired and shows toast on success/failure.

Backend appointment statuses are correctly mapped: `SCHEDULED`, `ARRIVED`, `IN_TRIAGE`, `READY_FOR_DOCTOR`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.

**Verdict:** PASS ✓.

---

### 7. Schedule - PASS ✓
**File:** `src/app/hospital/admin/schedule/page.tsx`

**Network requests:**
- `GET /hospitals/${hospitalId}/doctors` - for the sidebar doctor list
- `GET /appointments` - for the calendar event grid (admin-scoped)
- `GET /doctors/${selectedDoctorId}/slots?date=YYYY-MM-DD` - for open availability slots when a doctor is selected

**Integration status:** All three calls are made with real data. The weekly/monthly calendar grid is populated from real appointments (matched by `doctorId` and `date`). The mini-calendar in the sidebar is driven by real doctor data.

Doctor colors are deterministic (hash of doctor ID), so no hardcoded color map is needed.

Open-slots panel degrades gracefully if the endpoint is missing: `slotsError` state renders "Could not load slots."

**Verdict:** PASS ✓.

---

### 8. Settings - PARTIAL
**File:** `src/app/hospital/admin/settings/page.tsx`

**Network requests:**
- `GET /hospitals/${hospitalId}` - loads hospital name, address, phone, email
- `GET /hospitals/${hospitalId}/doctors` - to derive department list
- `PATCH /hospitals/${hospitalId}` - on Save (expected to 404, see below)

**What works:**
- General tab reads real hospital profile from `GET /hospitals/:id`
- Departments tab derives real department list from `GET /hospitals/:id/doctors`

**What is demo/broken:**
- Fees tab: `DEMO_FEES` hardcoded (Gap S-2 - no HospitalFee model in Prisma schema)
- Announcements tab: `DEMO_ANNOUNCEMENTS` hardcoded (Gap S-3 - no HospitalAnnouncement model)
- Save button calls `PATCH /hospitals/:id` which **does not exist in the backend** (Gap S-1) - will show error toast: "Save is not available yet - the backend has no hospital-profile update endpoint"
- Department "Head" column always shows `-` (no isDepartmentHead field in backend)

**Code documents this clearly** with `// TODO: no backend endpoint yet - see gap doc` comments.

**Verdict:** PARTIAL. Reads work; save fails by design; fees and announcements are demo data.

---

## Correction to Task Description

The task stated Finance and Inventory were "previously on Real API." Code analysis shows this is incorrect:

| Page | Task claims | Actual state |
|---|---|---|
| Finance | Real API | STILL MOCK - no API calls, `MOCK_INVOICES` imported, all KPIs hardcoded |
| Inventory | Real API | STILL MOCK - no API calls, 7 hardcoded items, save is local-only |

These pages were likely confused with the Dashboard (which does call `/drug-stock`) and Departments (which does call `/doctors`).

---

## Remaining Gaps (developer handoff)

| # | Page | Gap | Action needed |
|---|---|---|---|
| A-1 | Finance | Entire page on mock/hardcoded data | Migrate to `GET /hospitals/:id/invoices` for invoice table; derive KPIs from response; replace MOCK_INVOICES |
| A-2 | Finance | Revenue chart hardcoded | Wire to `GET /hospitals/:id/dashboard/weekly-revenue` or equivalent |
| A-3 | Finance | Refunds hardcoded | Need backend endpoint for refunds - confirm with backend team |
| A-4 | Inventory | Entire page on hardcoded items | Migrate to `GET /hospitals/:id/drug-stock` (same endpoint Dashboard uses) |
| A-5 | Inventory | Save quantity is local-only | Wire to stock update endpoint - confirm with backend team |
| A-6 | Staff | Nurse/Receptionist staff not listed | Pending `GET /hospitals/:id/staff` backend endpoint (Gap ST-1) |
| A-7 | Settings | Save hospital profile fails | Backend needs `PATCH /hospitals/:id` (Gap S-1) |
| A-8 | Settings | Fees tab is demo data | Backend needs HospitalFee model and `GET/POST /hospitals/:id/fees` (Gap S-2) |
| A-9 | Settings | Announcements tab is demo data | Backend needs HospitalAnnouncement model and endpoints (Gap S-3) |
| A-10 | Departments | Hardcoded fallback employees visible if API returns empty | Remove `EMPLOYEES` constant; show "No staff found" instead |
