# Receptionist Portal - Integration Audit Report
**Date:** 2026-08-04  
**Branch:** qa/portal-integration-audit  
**Method:** Static source-code analysis (every page file read in full)

---

## Summary Table

| Page | Route | Network Calls | Data Source | Verdict |
|---|---|---|---|---|
| Dashboard | /hospital/receptionist/dashboard | GET /hospitals/:id/receptionist/dashboard | API attempt (custom endpoint) | PARTIAL |
| Appointment List | /hospital/receptionist/appointment-list | GET /hospitals/:id/receptionist/appointments | API attempt (wrong URL) | PARTIAL |
| Checking Queue | /hospital/receptionist/checkingQueue | GET /hospitals/:id/receptionist/queue + dashboard-stats | Both non-existent endpoints | FAIL |
| Notifications | /hospital/receptionist/notifications | GET /hospitals/:id/receptionist/notifications | API attempt | PARTIAL |
| Profile | /hospital/receptionist/profile | GET /hospitals/:id/receptionist/profile | API attempt (read only) | PARTIAL |
| Leave Request | /hospital/receptionist/leave-request | GET /hospitals/:id/receptionist/leaves | API attempt (read only) | PARTIAL |
| Change Password | /hospital/receptionist/change-password | POST /auth/change-password | Real API | PASS |

---

## Rec-Gap Checklist (Rec-1 through Rec-6)

The task refers to gaps documented as Rec-1–Rec-6 in `src/__tests__/hospital/receptionist.dashboard.test.tsx`. Based on the backend controller audit and the frontend code:

| Gap ID | Description | Status |
|---|---|---|
| Rec-1 | GET /hospitals/:id/receptionist/dashboard | **UNKNOWN** - endpoint called by frontend but not confirmed in backend; likely returns 404 |
| Rec-2 | GET /hospitals/:id/receptionist/appointments | **UNKNOWN** - called by frontend; the real endpoint is `GET /appointments` (JWT-scoped) |
| Rec-3 | GET /hospitals/:id/receptionist/queue | **STILL MISSING** - frontend calls it, backend does not have this route |
| Rec-4 | GET /hospitals/:id/receptionist/dashboard-stats | **STILL MISSING** - frontend calls it, no such route in backend |
| Rec-5 | POST /hospitals/:id/patients/register | **RESOLVED in backend** - no frontend page built yet |
| Rec-6 | POST /appointments/:id/check-in (PUT) | **RESOLVED in backend** - button exists in checkingQueue page but has no onClick handler |

---

## Page-by-Page Findings

### 1. Dashboard - PARTIAL
**File:** `src/app/hospital/receptionist/dashboard/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/dashboard
```

**Integration status:** The page makes a real API call and uses `firstName` from auth context (no hardcoded name). However the endpoint `GET /hospitals/:id/receptionist/dashboard` is a custom receptionist-specific route that was not confirmed in the backend audit. It is expected to return `{ newPatientsWeek, checkinsWeek, queue, todayAppointments }`.

If the endpoint returns 404: the page shows an error banner "Failed to load dashboard data or endpoint not available." - the charts render empty (no crash).

If the endpoint returns 200: the page fully renders with real data.

**No hardcoded stat cards** - the dashboard shows charts and tables driven entirely by the API response, so it either works or fails cleanly.

**Verdict:** PARTIAL - call is made; resolution depends on whether the backend endpoint exists.

---

### 2. Appointment List - PARTIAL (wrong URL, hardcoded stats)
**File:** `src/app/hospital/receptionist/appointment-list/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/appointments
```

**Problem 1 - Wrong endpoint URL:**  
The confirmed backend appointment endpoint is `GET /appointments` (JWT-scoped to receptionist role). The frontend calls `/hospitals/:id/receptionist/appointments` which is a custom route not found in the backend audit. This will return a 404.

**Problem 2 - Hardcoded stat cards:**  
```js
const [stats, setStats] = useState<any>({ totalBookings: 8, confirmedToday: 4, checkedIn: 3, cancelled: 1 });
```
The stat cards are initialized with hardcoded values and **never updated** from the API response - the `.then()` handler only calls `setQueue()`, not `setStats()`. The numbers 8/4/3/1 will appear regardless of actual data.

**What works:** The table is driven by the API response (`setQueue(unwrapData(res.data))`), so if the URL were fixed it would render real appointments.

**Verdict:** PARTIAL - stat cards hardcoded, URL is wrong.

---

### 3. Checking Queue - FAIL
**File:** `src/app/hospital/receptionist/checkingQueue/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/queue         ← non-existent
GET /hospitals/${hospitalId}/receptionist/dashboard-stats  ← non-existent
```

**Problems found:**
1. Both endpoints are custom routes with no backend implementation. Both will return 404. The `catch` block sets the same error string for both failures.
2. Stat cards show hardcoded strings in JSX:
   ```jsx
   { title: '28 min', label: 'Average Wait Time' }
   { title: '45 min', label: 'Longest Wait Time' }
   ```
   These strings are baked into the `overviewCards` array - they cannot change regardless of what the API returns.
3. "Check-In Patient" button has **no `onClick`** handler:
   ```jsx
   <button className="...">
     <PlusIcon className="h-4 w-4" />
     {t('hospital.checkInPatient', 'Check-In Patient')}
   </button>
   ```
4. The filter fields (`patient.name`, `patient.id`, `patient.department`, `patient.doctor`, `patient.waitTime`) assume a specific shape in the queue response that may not match what the backend returns.

**Verdict:** FAIL - both API calls target non-existent endpoints; stat cards hardcoded; check-in button unhooked.

---

### 4. Notifications - PARTIAL
**File:** `src/app/hospital/receptionist/notifications/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/notifications            (on mount)
PATCH /hospitals/${hospitalId}/receptionist/notifications/read-all (mark all read)
PATCH /hospitals/${hospitalId}/receptionist/notifications/:id/read (mark one read)
```

**Integration status:** The page makes real API calls for all three operations. There is no mock fallback - if the GET fails, the page shows an error banner and the list is empty. If it succeeds, notifications render from real data.

**Unknown:** Whether `/hospitals/:id/receptionist/notifications` exists in the backend. It was not confirmed in the audit. If it returns 404 the page renders the error banner "Failed to load notifications."

**Verdict:** PARTIAL - fully wired, but endpoint existence is unconfirmed.

---

### 5. Profile - PARTIAL (read works, save unhooked)
**File:** `src/app/hospital/receptionist/profile/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/profile   (on mount)
```

**What works:** Profile fields are loaded from the API response. `fullName`, `phone`, `email`, `username`, `department`, `address`, `dateOfJoining`, `jobTitle`, `roleLabel`, `joinedAt` are all populated from the response.

**What is broken - save not wired:**  
The "Save Changes" button:
```jsx
<button disabled={!editing} onClick={() => setEditing(false)}>
  {t('hospital.saveChanges', 'Save Changes')}
```
It only calls `setEditing(false)` - no `api.put()` or `api.patch()` is called. Profile edits are lost on refresh.

**Unknown:** Whether `GET /hospitals/:id/receptionist/profile` exists in the backend.

**Verdict:** PARTIAL - read side is wired, write side is not.

---

### 6. Leave Request - PARTIAL (read wired, submit is local-only)
**File:** `src/app/hospital/receptionist/leave-request/page.tsx`

**Network requests:**
```
GET /hospitals/${hospitalId}/receptionist/leaves   (on mount)
```

**What works:** Leave history is fetched from the API on load. Balance values (`annualBalance`, `sickBalance`) try to read from the response (`res.data.annualBalance`, `res.data.sickBalance`) - they fall back to hardcoded 14 and 8 days if not present in the response.

**What is broken - submit is local-only:**  
`submitLeaveRequest()` creates a local `LeaveRequest` object and appends it to state:
```js
setHistory((prev) => [newReq, ...prev]);
```
No API call is made. Submitted leave requests disappear on page refresh.

**Cancel also local-only:** `cancelRequest()` only mutates local state.

**Verdict:** PARTIAL - history loads from API; new requests and cancellations are not persisted.

---

### 7. Change Password - PASS
**File:** `src/app/hospital/receptionist/change-password/page.tsx`

**Network requests:**
```
POST /auth/change-password   { currentPassword, newPassword }
```

**Integration status:** Fully wired. The form validates client-side (strength score ≥ 4, fields non-empty, confirm match) then calls `POST /auth/change-password`. Success shows a toast and resets the form. Error shows a failure toast.

This endpoint is confirmed to exist in the backend (`auth.controller.ts`).

**Verdict:** PASS.

---

## Mock Data Still Present

| Page | Hardcoded values |
|---|---|
| Appointment List | Stat cards: 8 total bookings / 4 confirmed / 3 checked in / 1 cancelled - baked into JSX regardless of API data |
| Checking Queue | "28 min" average wait, "45 min" longest wait - baked into JSX; "Patients Being Served: 1" - hardcoded |

No page shows mock patient names (Alice B, Dan M, Frank P) - these pages use real API responses or show empty tables on failure.

---

## Remaining Gaps (developer handoff)

| # | Page | Gap | Action needed |
|---|---|---|---|
| R-1 | Appointment List | Wrong endpoint URL | Change `GET /hospitals/:id/receptionist/appointments` to `GET /appointments` |
| R-2 | Appointment List | Stat cards never update from API | Derive counts from the appointments array: `filter(a => a.status === 'CONFIRMED').length` etc. |
| R-3 | Checking Queue | Two non-existent endpoints called | Replace both with `GET /appointments`, client-filter for ARRIVED status |
| R-4 | Checking Queue | Hardcoded wait times | Remove "28 min" and "45 min" strings; these require a queue-time field the backend doesn't provide yet |
| R-5 | Checking Queue | Check-In button unhooked | Add `onClick={() => api.put('/appointments/:id/check-in')}` - endpoint confirmed in backend |
| R-6 | Profile | Save button unhooked | Wire to `PATCH /hospitals/:id/receptionist/profile` or equivalent |
| R-7 | Leave Request | Submit is local-only | Wire to `POST /hospitals/:id/receptionist/leaves`; cancel to `DELETE` or `PATCH` |
| R-8 | Notifications | Confirm endpoint exists | Verify `GET /hospitals/:id/receptionist/notifications` returns 200 with array body |
| R-9 | Patient Registration | Page does not exist | Create `src/app/hospital/receptionist/patient-registration/page.tsx` using `POST /hospitals/:id/patients/search` and `POST /hospitals/:id/patients/register` |
