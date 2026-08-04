# Nurse Portal - Integration Audit Report
**Date:** 2026-08-04  
**Branch:** qa/portal-integration-audit  
**Method:** Static source-code analysis (every page file read in full)

---

## Summary Table

| Page | Route | Network Calls | Data Source | Verdict |
|---|---|---|---|---|
| Dashboard | /hospital/nurse/dashboard | None | Mock files | STILL MOCK |
| Patients | /hospital/nurse/patients | GET /inpatient/admissions | Real API | PASS |
| Vitals | /hospital/nurse/vitals | GET /inpatient/admissions, GET /inpatient/admissions/:id/vitals | Real API (read only) | PARTIAL |
| Notes | /hospital/nurse/notes | None | Mock files | STILL MOCK |
| Medications | /hospital/nurse/medications | GET /inpatient/admissions, GET /inpatient/admissions/:id/mar | Real API | PASS |
| Messages | /hospital/nurse/messages | None | Mock file | STILL MOCK |
| Settings | /hospital/nurse/settings | None | Hardcoded constants | STILL MOCK |

---

## Page-by-Page Findings

### 1. Dashboard - STILL MOCK
**File:** `src/app/hospital/nurse/dashboard/page.tsx`

**Network requests:** None. Zero API calls in the entire file.

**Mock data imports detected:**
```
import { nurseDashboardStats, nurseDashboardCardsData, nursePatients, nurseSchedule } from '@/mock/hospital/nurse';
import { MOCK_NURSE } from '@/mock/hospital/user';
```

**Mock data visible in UI:**
- Hero greeting uses `MOCK_NURSE.firstName` → will display **"Claudine"** for every logged-in nurse
- Stat cards show `nurseDashboardStats.totalPatients`, `.pendingTasks`, `.unreadMessages` - fixed values from mock file
- Patient Overview table renders `nursePatients` - Alice B, Bob K, Carol N, etc.
- Today's Schedule renders `nurseSchedule` - fixed mock items

**Verdict:** STILL MOCK. No integration work has been done on this page.

---

### 2. Patients - PASS
**File:** `src/app/hospital/nurse/patients/page.tsx`

**Network requests:**
- `GET /inpatient/admissions?hospitalId=${hospitalId}` on mount

**Integration status:** Real API. The page fetches inpatient admissions and maps them to patient rows. Mock fallback (`MOCK_PATIENTS`) is triggered only if:
- `hospitalId` is null (not logged in), OR
- API throws an error AND `NODE_ENV !== 'production'`

In production the error path shows an error message instead of mock data. An amber warning banner is rendered whenever the mock fallback is active, so testers can see it clearly.

**Field mapping confirmed in code:**
- `patient.firstName + patient.lastName` → name column
- `patient.mrn || patient.id` → patient ID
- `item.reason` → condition
- `item.updatedAt || item.createdAt` → last visit

**Verdict:** PASS.

---

### 3. Vitals - PARTIAL (reads real data, write not wired)
**File:** `src/app/hospital/nurse/vitals/page.tsx`

**Network requests:**
- `GET /inpatient/admissions?hospitalId=${hospitalId}` on mount
- `GET /inpatient/admissions/${primaryAdmission.id}/vitals` (for first ACTIVE admission)

**What works:** Fetches admissions list, selects the first ACTIVE one, fetches its vitals history, and populates the Recent Records table and the vitals entry form with the latest reading.

**What is broken - submit not wired:**
The vitals entry form has three action buttons at the bottom:
```jsx
<button>Save Assessment</button>
<button>Update Assessment</button>
<button>View History</button>
```
None of them have an `onClick` handler that posts to the backend. `POST /inpatient/admissions/:id/vitals` is never called. A nurse can edit the fields but submitting does nothing.

**Hardcoded fallback:**
```js
const RECENT_RECORDS = [
  { date: '20/07/25', time: '14:00', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Ange' },
  ...
];
```
These appear only when no real records exist for the admission, or when mock fallback is active.

**Verdict:** PARTIAL. Real data is read correctly. POST submit is missing.

---

### 4. Notes - STILL MOCK
**File:** `src/app/hospital/nurse/notes/page.tsx`

**Network requests:** None.

**Mock data imports detected:**
```
import { MOCK_PATIENTS } from '@/mock/hospital/consultations';
import { MOCK_NURSE } from '@/mock/hospital/user';
```

**Mock data visible in UI:**
- Patient dropdown populated from `MOCK_PATIENTS` - will show "Alice B", "Bob K", etc. for every nurse
- Nurse name in submitted notes = `MOCK_NURSE.firstName + MOCK_NURSE.lastName` → "Claudine Umutoni"
- Submit function (`submitDocumentation`) appends to local React state only - notes are lost on page refresh and never sent to the backend
- Date hardcoded as `'2026-06-09'`

**Verdict:** STILL MOCK. All data is local; nothing persists.

---

### 5. Medications - PASS
**File:** `src/app/hospital/nurse/medications/page.tsx`

**Network requests:**
- `GET /inpatient/admissions?hospitalId=${hospitalId}` on mount
- `GET /inpatient/admissions/${admission.id}/mar` for each admission (parallel, using `Promise.allSettled`)

**Integration status:** Real API. The page fetches all MAR (Medication Administration Records) entries across all current admissions and maps them to the table. Stats are derived from the live data, not hardcoded.

Mock fallback (`MOCK_MEDICATIONS`, `MOCK_MEDICATION_STATS`) triggers only if hospitalId is null or API throws in dev. Amber banner is shown when active.

**Note:** The Record/Mark-as-Missed buttons do not call any API - they appear to be UI-only stubs. Recording administration is not wired to `PUT /inpatient/admissions/:id/mar/:id` or equivalent.

**Verdict:** PASS for data display. Action buttons (Record, Missed) are UI stubs not wired to backend.

---

### 6. Messages - STILL MOCK
**File:** `src/app/hospital/nurse/messages/page.tsx`

**Network requests:** None.

**Mock data imports detected:**
```
import { MOCK_CONVERSATIONS } from '@/mock/hospital/messages';
```

**Mock data visible in UI:**
- Conversation list populated directly from `MOCK_CONVERSATIONS` - "Dr. Mugabo" will appear for every nurse
- Send message only updates local React state - messages are never sent via WebSocket or API
- No socket.io connection attempted

**Verdict:** STILL MOCK.

---

### 7. Settings - STILL MOCK
**File:** `src/app/hospital/nurse/settings/page.tsx`

**Network requests:** None. `useAuth()` is not called.

**Hardcoded data:**
```js
const mockNurse = {
  name: 'Claudine Umutoni',
  email: 'claudine.umutoni@evuze.rw',
  phone: '+250789384713',
  ...
};
```

**Mock data visible in UI:**
- Profile card and form pre-filled with `mockNurse` constants - will show "Claudine Umutoni" for every nurse
- Save Changes button calls `setEditingProfile(false)` - no API call
- Change Password form has no submit handler connected to `POST /auth/change-password`
- Department details show `mockNurse.specialization`, `mockNurse.licenseNumber` etc.

**Verdict:** STILL MOCK.

---

## Mock Data Still Present

Pages where mock patient names or hardcoded values appear to a logged-in real nurse:

| Page | Mock markers visible |
|---|---|
| Dashboard | "Claudine" (nurse name), "Alice B", "Bob K", "Carol N", "Dan M", "Eve O", "Frank P" (patient list), fixed schedule items |
| Notes | "Alice B"–"Frank P" in patient dropdown, "Claudine Umutoni" as note author |
| Messages | "Dr. Mugabo" in conversation list |
| Settings | "Claudine Umutoni", "claudine.umutoni@evuze.rw", "+250789384713" |

---

## Remaining Gaps (developer handoff)

| # | Page | Gap | Endpoint needed |
|---|---|---|---|
| N-1 | Dashboard | Entire page still on mock - no API calls | `GET /nurses/dashboard` → `{ totalPatients, pendingTasks, unreadMessages }`; nurse name from auth context |
| N-2 | Dashboard | Patient overview table shows mock patients | Remove `nursePatients` import; reuse admissions from `GET /inpatient/admissions` |
| N-3 | Dashboard | Schedule shows mock items | No backend endpoint for nurse schedule yet; mark as TODO |
| N-4 | Vitals | Submit button has no handler | `POST /inpatient/admissions/:id/vitals` with `{ readings, nurseNotes }` payload |
| N-5 | Notes | Patient list from mock | Fetch `GET /inpatient/admissions?hospitalId=...` and derive patient list from admissions |
| N-6 | Notes | Submit saves to local state only | `POST /notes` or equivalent - endpoint needs to be confirmed with backend team |
| N-7 | Messages | Entire page on mock | Wire to Socket.IO `/chat` gateway: `join_room`, `send_message` events; load history from `GET /chat/:appointmentId/history` |
| N-8 | Settings | Hardcoded nurse profile | Load from auth context or `GET /nurses/profile`; wire Save to `PATCH` endpoint; wire Change Password to `POST /auth/change-password` |
| N-9 | Medications | Record/Missed buttons unhooked | Wire to MAR update endpoint once confirmed with backend |
