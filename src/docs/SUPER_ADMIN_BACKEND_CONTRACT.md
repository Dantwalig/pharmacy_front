# Super Admin Portal — Backend Contract

> **Status:** Frontend complete. Verification endpoints (marked ⚠️) are pending backend implementation.  
> **Last updated:** 2026-06-05  
> **Frontend branch:** `fix/nelly_super_admin_api_hardening`

---

## Authentication

All super-admin endpoints require a valid `Authorization: Bearer <accessToken>` header and the user's role must be `SUPER_ADMIN`.

---

## Endpoints

### 1. Platform Analytics

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/analytics` |
| Auth | Required |
| Status | ✅ Implemented |

**Response shape:**
```json
{
  "totalPatients": 0,
  "totalPharmacies": 0,
  "approvedPharmacies": 0,
  "pendingPharmacies": 0,
  "totalOrders": 0,
  "completedOrders": 0,
  "totalRevenue": 0,
  "platformRevenue": 0,
  "platformFeePerPharmacy": 0
}
```

**Frontend behaviour now:** Populates the four stat cards at the top of the dashboard.  
**Frontend behaviour once live:** No change needed — endpoint already returns data.

---

### 2. Platform Revenue

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/revenue` |
| Auth | Required |
| Status | ✅ Implemented |

**Response shape:**
```json
{
  "totalRevenue": 0,
  "transactionCount": 0
}
```

**Frontend behaviour now:** Populates the Revenue Overview cards in the analytics page.  
**Frontend behaviour once live:** No change needed.

---

### 3. List All Pharmacies

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/pharmacies` |
| Query params | `?status=PENDING\|APPROVED\|REJECTED` (optional) |
| Auth | Required |
| Status | ✅ Implemented |

**Response shape:** `Pharmacy[]` (direct array or `{ data: Pharmacy[] }`)

```ts
interface Pharmacy {
  id: string;
  name: string;
  representativeName: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rdbCertificate: string | null;
  pharmacyLicense: string | null;
  businessRegistration: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: { email: string };
}
```

**Frontend behaviour now:** Drives the pharmacy applications table with search and status-filter tabs.  
**Frontend behaviour once live:** No change needed.

---

### 4. Pending Pharmacies (shortcut)

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/pharmacies/pending` |
| Auth | Required |
| Status | ✅ Implemented |

**Response shape:** `Pharmacy[]`

**Frontend behaviour now:** Populates the "Pending Pharmacies" widget on the dashboard.  
**Frontend behaviour once live:** No change needed.

---

### 5. Approve Pharmacy

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Path | `/super-admin/pharmacies/:id/approve` |
| Auth | Required |
| Status | ✅ Implemented |

**Request body:** `{}` (empty)  
**Response:** `200 OK`

**Frontend behaviour now:** Inline approve button in the pharmacies table.  
**Frontend behaviour once live:** No change needed.

---

### 6. Reject Pharmacy

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Path | `/super-admin/pharmacies/:id/reject` |
| Auth | Required |
| Status | ✅ Implemented |

**Request body:**
```json
{ "reason": "string" }
```

**Response:** `200 OK`

**Frontend behaviour now:** Reject modal in the pharmacies table requires a non-empty reason string.  
**Frontend behaviour once live:** No change needed.

---

### 7. List Patients

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/patients` |
| Auth | Required |
| Status | ✅ Implemented (assumed — comment in code says "you'll need to create this") |

**Response shape:** `PatientSummary[]`

```ts
interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  insuranceProvider: string | null;
  user: { isVerified: boolean };
}
```

**Frontend behaviour now:** Shows patient cards with search.  
**Frontend behaviour once live:** No change needed.

---

### 8. ⚠️ Pending Branch Applications

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/branches/pending` |
| Auth | Required |
| Status | ⚠️ **Pending backend implementation** |

**Expected response shape:** `PendingBranch[]`

```ts
interface PendingBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  branchManagerEmail: string;
  pharmacyLicense: string | null;  // base64 data-URL or HTTPS URL
  createdAt: string;
  pharmacy: {
    id: string;
    name: string;
    representativeName: string;
  };
  manager: { email: string } | null;
}
```

**Frontend behaviour now:** If this endpoint returns 404, 501, or times out after 8 s, the Branch Verification section shows an amber banner: *"Branch and pharmacy verification endpoints are pending backend implementation."* All action buttons are disabled.  
**Frontend behaviour once live:** Branch cards render with View License / Approve / Reject buttons.

---

### 9. ⚠️ Approve Branch

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Path | `/super-admin/branches/:id/approve` |
| Auth | Required |
| Status | ⚠️ **Pending backend implementation** |

**Request body:** `{}` (empty)  
**Response:** `200 OK`

**Frontend behaviour now:** Button disabled (see Gap 1 banner above).  
**Frontend behaviour once live:** One-click approval removes the branch from the pending list.

---

### 10. ⚠️ Reject Branch

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Path | `/super-admin/branches/:id/reject` |
| Auth | Required |
| Status | ⚠️ **Pending backend implementation** |

**Request body:**
```json
{ "reason": "string" }
```

**Response:** `200 OK`

**Frontend behaviour now:** Button disabled (see Gap 1 banner).  
**Frontend behaviour once live:** Opens a modal requiring a non-empty rejection reason; on confirm, removes branch from list.

---

### 11. ⚠️ Pharmacies With Unverified Locations

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/super-admin/pharmacies/unverified-locations` |
| Auth | Required |
| Status | ⚠️ **Pending backend implementation** |

**Expected response shape:** `PharmacyLocation[]`

```ts
interface PharmacyLocation {
  id: string;
  name: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  latitude: number;
  longitude: number;
}
```

**Frontend behaviour now:** If this endpoint returns 404, 501, or times out, the Location Review section shows the same amber banner and disables Review buttons.  
**Frontend behaviour once live:** Renders pharmacy rows with a "Review" button that opens a map modal for the super admin to verify GPS coordinates.

---

### 12. ⚠️ Verify Pharmacy Location

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Path | `/super-admin/pharmacies/:id/verify-location` |
| Auth | Required |
| Status | ⚠️ **Pending backend implementation** |

**Request body:**
```json
{ "verified": true }
```

`verified: false` flags the location as suspicious.  
**Response:** `200 OK`

**Frontend behaviour now:** Button in map modal is disabled.  
**Frontend behaviour once live:** "Verify Location" sets `verified: true`; "Flag as Suspicious" sets `verified: false`; both close the modal and remove the pharmacy from the unverified list.

---

## Notes for Backend Lead

- Endpoints 8–12 are completely unimplemented. The frontend degrades gracefully: it detects 404/501 or an 8 s timeout and shows an amber banner. No spinners run indefinitely.
- `pharmacyLicense` on `PendingBranch` may be a base64 `data:` URI (uploaded client-side) or a remote HTTPS URL. The frontend handles both — do not normalise on the backend.
- The `verify-location` endpoint must persist a `locationVerified: boolean` field on the Pharmacy model and expose it in `GET /super-admin/pharmacies`.
