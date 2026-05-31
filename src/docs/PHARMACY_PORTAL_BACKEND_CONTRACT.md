This document lists frontend workarounds applied in the Pharmacy Owner Portal because of backend gaps. It also specifies the exact request/response shapes the frontend expects so the backend team can fix them and remove the workarounds.

Summary of gaps and frontend workarounds

 src/app/pharmacy/orders/page.tsx:
Gap 1 — Missing endpoint: GET /branches/my-branches (Should be remaoved)
- Problem: The frontend previously called `GET /branches/my-branches` to populate the Branch filter on the Orders page. The endpoint was unavailable to the Orders page during integration.Frontend implemented a fallback that derives branch options from order data.
- Frontend workaround: The Orders page now derives branch options from the orders returned by `GET /orders/pharmacy-orders`.
  - Implementation: extract unique { id, name } pairs from `orders.map(o => o.branch)` or fallback to `o.branchId` when `branch` object is not present.
  - Temporary behavior: If the order does not include nested `branch.name`, the UI will use the raw `branchId` (or first 8 chars) as the label.
- Requested backend fix: Implement `GET /branches/my-branches` or include branch details on order responses 

Gap 2 — Missing status enum value: READY_FOR_CHECKOUT
- Problem: The frontend shows a tab `READY_FOR_CHECKOUT` but the backend does not have this enum value. The backend uses `READY_FOR_PICKUP` to represent the same business state.
- Frontend workaround: The Orders page was updated to display `READY_FOR_PICKUP` instead of `READY_FOR_CHECKOUT`. For backwards compatibility where UI code still references `READY_FOR_CHECKOUT`, the frontend maps that key to `READY_FOR_PICKUP` when counting/filtering.

Canonical order statuses the frontend expects (per current backend schema):
PENDING | ACCEPTED | PREPARING | READY_FOR_PICKUP | OUT_FOR_DELIVERY | DELIVERED | COMPLETED | CANCELLED


Gap 3 — Patient/Staff fields are nested (not flat patientName/staffName)
- Problem: The Orders response used by the frontend does not contain flat `patientName` or `staffName` fields. Instead, the backend returns nested objects: `patient: { firstName, lastName, phone, ... }`. There is no `staff` relation included on orders by default. Frontend code that referenced `order.patientName` and `order.staffName` showed blank values.
- Frontend workaround: The Orders page now derives the displayed names from nested fields:
  - Patient full name: `${order.patient?.firstName ?? ''} ${order.patient?.lastName ?? ''}`.trim() || '—'
  - Staff full name: if `order.staff` exists, use `${order.staff?.firstName} ${order.staff?.lastName}`.trim(); otherwise fall back to `order.staffName` (if present) or `order.branchId` (first 8 chars) as a temporary stand-in.
- Search/update behavior: The orders search now checks the derived patient/staff names (nested fields) rather than flat `patientName`/`staffName` strings.

Notes on response wrapping:
- Some backend endpoints return payload either as `res.data.data` or directly as `res.data`. The frontend handles both shapes (`res.data?.data ?? res.data`). Please keep responses compatible with that pattern or standardize on `{ data: ... }`.

Additional findings discovered during analysis
- Several frontend pages call endpoints under `/pharmacies/dashboard/*` (dashboard, analytics, patients). Ensure those endpoints follow consistent shapes.
- The branches listing page (`GET /branches/my-branches`) is already used by other pages (e.g., Branch Management). Adding this endpoint or returning branch info on orders will benefit multiple UI areas.

Files patched in the frontend
- `src/app/pharmacy/orders/page.tsx`
  - Removed call to `GET /branches/my-branches` and derive branches from orders as a temporary workaround.
  - Replaced `READY_FOR_CHECKOUT` tab with `READY_FOR_PICKUP` and mapped counts accordingly.
  - Derive `patient` and `staff` display names from nested objects and updated search to use derived names.

Testing checklist for backend team
- Provide `GET /branches/my-branches` returning an array of branch objects (id, name, address, manager.email, branchStatus).
- Update `GET /orders/pharmacy-orders` to include `branch: { id, name }` and `staff` (if available) in each order object, or document why they cannot be included.
- Confirm canonical `OrderStatus` values and, if `READY_FOR_CHECKOUT` is intended, add it to the enum or document the mapping.

*src/app/pharmacy/dashboard/page.tsx:*
Gap 4 — Missing ownerName field on Pharmacy profile response
- Problem: The Dashboard page greeting displays `"Hello, {ownerName}"` but the `GET /pharmacies/profile/me` endpoint returns a Pharmacy object with only `representativeName` (optional field). When `representativeName` is null or undefined, the greeting displays with an empty name.
- Frontend workaround: The Dashboard page now checks if `representativeName` is missing and, if so, makes an additional call to `GET /users/me` to fetch the authenticated user's profile. It then derives the owner name from `profile.firstName + profile.lastName` (or `firstName + lastName` depending on response shape) and sets it as `ownerName` in the profile data structure.
  - Implementation: After fetching `/pharmacies/profile/me`, if `representativeName` is falsy, call `/users/me` and derive the full name from available user fields.
  - Fallback: If both sources are unavailable, the greeting will display without a name (graceful degradation).
- Requested backend fix: Update `GET /pharmacies/profile/me` response to include the pharmacy owner's name from the User relationship. Either:
  1. Rename the `representativeName` field in the Pharmacy schema to `ownerName` (if `representativeName` is not used elsewhere), or
  2. Add an `ownerName` field that is computed from the associated User's `firstName + lastName`, or
  3. Include the full User object or User name fields in the pharmacy profile response.


Files patched in the frontend
- `src/app/pharmacy/dashboard/page.tsx`
  - Added conditional fetch to `GET /users/me` if `representativeName` is missing.
  - Derives owner name from user profile fields and stores it as `ownerName`.


Gap 5 - Pharmacy Analytics response shape mismatch
- Problem: The Analytics page charts need stable display-ready data, but the current backend shape differs from what the UI originally modeled:
  1. `GET /pharmacies/dashboard/stats` returns `revenueOverTime` as a flat array of `{ month, revenue }`.
  2. The UI trend control needs tabbed buckets for `3M`, `6M`, and `1Y`.
  3. `revenueByBranch` currently returns `{ name, revenue }` without `percentage`, but the donut legend displays a percentage for each branch.
  4. `monthlyComparison` is referenced in frontend types/mock setup, but the backend stats response does not return it. The current chart uses `revenueByBranch` instead.
  5. `targetRevenue` was previously coming from mock frontend data only, not from the backend.
- Frontend workaround:
  - Normalize `revenueOverTime` so the page accepts either the current flat backend array or a future tabbed object shape. For the flat array, the frontend derives `3M`, `6M`, and `1Y` with `slice(-3)`, `slice(-6)`, and `slice(-12)`.
  - Normalize `revenueByBranch` and derive `percentage` from branch revenue totals when it is missing.
  - Stop using mock analytics values as live fallback data; default missing analytics values to zero/empty arrays so the page does not show fake business metrics.
- Requested backend fix: Return display-ready analytics stats in a single consistent contract.


Files patched in the frontend
- `src/app/pharmacy/analytics/page.tsx`
  - Added normalization for `revenueOverTime` flat-array vs. tabbed-object response shapes.
  - Added normalization for `revenueByBranch`, including frontend-derived percentages.
  - Replaced mock analytics fallback values with zero/empty defaults to avoid displaying fake metrics.


Inventory Medication Response

Frontend expects:
- dosage

Backend provides:
- chemicalName

Frontend workaround:
- dosage ?? chemicalName

Backend recommendation:
- expose dosage field or align naming across API responses.


pharmacy_front\src\app\pharmacy\branches\page.tsx:

Missing Aggregated Metrics in Branch List
* **Frontend Workaround:** Formatted column entries to handle fallback defaults (`—`) to protect system architecture from N+1 query loops.
* **Expected API Target:**
  ```json
  GET /branches/my-branches

Invited/Pending Manager Mapping Context
Frontend Workaround: Introduced fallback string checking (b.manager?.email ?? b.branchManagerEmail) to accurately display invited contacts before their user profile creation has completed.

Expected Payload Behavior: Ensure manager objects or their mapped tracking variants persist unified fields regardless of inviting registration state.


* **Frontend Workaround:** Implemented an aggressive fallback unwrap logic (`res.data?.data ?? res.data`) within the data fetcher layer to keep the portal interface resilient against wrapper changes.
* **Expected API Target:**
  ```json
  GET /pharmacies/dashboard/patients

```

## Gap 7: Missing Extended Patient Profile Information

* **Frontend Workaround:** Populated fallback placeholders (`—` and `ACTIVE`) for essential CRM display data fields across both table views and contextual profile side-drawers.
* **Expected API Target:**
```json
GET /pharmacies/dashboard/patients

```


* **Required Addition:** Provide missing schema properties for `gender`, `dateOfBirth`, `address`, `city`, `postalCode`, `registeredDate`, `preferredBranch`, and `memberStatus` directly on the object.

## Gap 8: Missing Patient Prescription Matrix

* **Frontend Workaround:** Hardcoded an empty array safeguard (`p.prescriptions ?? []`) to prevent immediate component rendering failures when navigating between demographic tabs.
* **Expected API Target:**
```json
GET /pharmacies/dashboard/patients

```


* **Required Addition:** Include an array of attached active/historical items containing `id`, `rxNumber`, `uploadedDate`, and `type`.

## Gap 9: Incomplete Order Sub-Object Records

* **Frontend Workaround:** Generated dynamic client-side item count string structures (`${o.itemCount ?? 0} item(s)`) and text fallbacks to keep search filtering from causing code crashes.
* **Expected API Target:**
```json
GET /pharmacies/dashboard/patients


* **Required Addition:** Replace standard item integer values with a calculated text summary string (`itemsSummary`) embedded directly inside the `orders` sub-objects.

## Gap 10: Nullable Order Timestamp Breakdown

* **Frontend Workaround:** Wrapped date conversions in strict conditional checks to prevent runtime formatting errors when patients have no prior purchases.
* **Expected API Target:**
```json
GET /pharmacies/dashboard/patients

* **Required Addition:** Ensure `lastOrderDate` consistently updates as a valid ISO 8601 string or safely defaults to `null`.
