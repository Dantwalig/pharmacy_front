# Hospital Admin Portal — Backend Contract & Gaps

> **Scope:** `admin/dashboard`, `admin/departments`, `admin/finance`, `admin/inventory`
> **Source-verified against:** `back-end/src/hospitals/hospitals.controller.ts`, `hospitals.service.ts`, `invoices/invoices.service.ts`
> **Last updated:** 2026-06-29
> **See also:** [`HOSPITAL_ADMIN_DASHBOARD_DEPARTMENTS_INTEGRATION.md`](./HOSPITAL_ADMIN_DASHBOARD_DEPARTMENTS_INTEGRATION.md) for the earlier dashboard/departments integration writeup with full fix history.

---

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Endpoint confirmed implemented and reachable |
| ⚠️ | Endpoint exists but has a known issue (migration, field name mismatch, etc.) |
| ❌ | Endpoint confirmed missing — frontend cannot call it |

---

## Endpoint contract

### Dashboard — `admin/dashboard`

All three endpoints exist and are implemented. All are restricted to `HOSPITAL_ADMIN` only.

---

#### `GET /hospitals/:id/dashboard/stats` ✅

```ts
// Response shape (exact field names from hospitals.service.ts::getStats)
{
  totalAppointments: {
    thisMonth: number,   // appointments this calendar month
    allTime:   number,   // all-time total
  },
  appointmentsByStatus: {
    PENDING:   number,   // backend status SCHEDULED
    CONFIRMED: number,   // backend statuses ARRIVED | IN_TRIAGE | READY_FOR_DOCTOR (bucketed)
    COMPLETED: number,
    CANCELLED: number,   // backend statuses CANCELLED | NO_SHOW (bucketed)
  },
  totalRevenue:   number,  // all-time revenue from hospital_invoices
  monthlyRevenue: number,  // this calendar month
  totalDoctors:   number,
  activeDoctors:  number,  // doctors with isAvailable === true
  totalPatients:  number,  // registered via HospitalPatientRegistration
}
```

> ⚠️ **Gap A — Status bucketing:** The backend `AppointmentStatus` enum has 7 values
> (`SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `ARRIVED`, `IN_TRIAGE`,
> `READY_FOR_DOCTOR`). The response maps these into 4 frontend buckets. If the
> product requires separate counts for `ARRIVED`, `IN_TRIAGE`, etc., the service
> needs to return them separately — the current bucketing is a pragmatic choice
> made during integration, not a product decision.

---

#### `GET /hospitals/:id/dashboard/weekly-revenue` ✅

```ts
// Response shape — array of 4 items (last 4 calendar weeks, oldest first)
Array<{
  label:   string,  // e.g. "Jun 2 – Jun 8"
  revenue: number,
}>
```

---

#### `GET /hospitals/:id/dashboard/daily-appointments` ✅

```ts
// Response shape — array of 30 items (last 30 days, oldest first)
Array<{
  date:  string,  // "YYYY-MM-DD"
  label: string,  // e.g. "Jun 1"
  count: number,
}>
```

---

#### `GET /hospitals/:id/drug-stock` (dashboard low-stock card) ✅

Used by dashboard as a secondary call to populate the low-stock alert count.
Full contract under [Inventory](#inventory----admininventory) below.

---

#### ❌ No procurement/spend endpoint

The dashboard mock had a "Procured Value" stat card. There is no `Procurement`
or `PurchaseOrder` model anywhere in `schema.prisma`, and no endpoint that
returns procurement spend. **Decision:** show `monthlyRevenue` as the closest
available substitute. This is a net-new feature, not an integration gap.

---

### Departments — `admin/departments`

#### `GET /hospitals/:id/departments` ⚠️ MIGRATION PENDING

This endpoint **was added to the backend** as part of the dashboard/departments
integration (see `HOSPITAL_ADMIN_DASHBOARD_DEPARTMENTS_INTEGRATION.md`, Gap 1).
The controller route and service method both exist. However the endpoint
**will throw a Postgres "column does not exist" error** until the following
migration is applied to the database:

```bash
cd back-end
npx prisma migrate dev --name add_department_and_dept_head_fields --schema=src/prisma/schema.prisma
```

Or, if the direct Supabase connection is unavailable, run this SQL manually in
the Supabase SQL editor then mark the migration resolved:

```sql
ALTER TABLE "doctors"       ADD COLUMN "isDepartmentHead" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "hospital_staff" ADD COLUMN "department"       TEXT;
```

```ts
// Response shape once migration is applied
Array<{
  name:        string,   // doctor specialization (e.g. "Cardiology")
  doctorCount: number,
  nurseCount:  number,   // requires HospitalStaff.department field (migration)
  head:        string | null,  // name of doctor with isDepartmentHead === true
  status:      'ACTIVE' | 'INACTIVE',  // ACTIVE if any doctor in dept has isAvailable === true
}>
```

> **Allowed roles:** `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`
>
> Note: this endpoint does NOT use the private `validateHospitalAccess()` helper
> (which only allows the hospital's owning admin). It uses the simpler hospital
> existence check so nurses and doctors can also call it — see Gap B below.

---

### Finance — `admin/finance`

#### `GET /hospitals/:id/invoices` ✅

```
GET /hospitals/:id/invoices?status=PAID&from=2026-01-01&to=2026-12-31&page=1&limit=10
```

All query params are optional. Do not send a param if it has no value (e.g. do not
send `?status=undefined` — omit the key entirely).

```ts
// Response shape
{
  data: Array<{
    id:            string,
    hospitalId:    string,
    patientId:     string,
    totalAmount:   number,
    paymentStatus: 'UNPAID' | 'PAID' | 'INSURANCE_PENDING',  // ← field name is paymentStatus, not status
    issuedAt:      string,   // ISO datetime
    items:         Array<any>,
    patient: {
      firstName: string,
      lastName:  string,
      phone:     string,
    },
    hospital: {
      id:      string,
      name:    string,
      address: string,
    },
    appointment: {
      date:   string,
      reason: string,
    } | null,
  }>,
  meta: {
    total: number,
    page:  number,
    limit: number,
    pages: number,
  }
}
```

> ⚠️ **Gap C — Field name:** the invoice status field on the response object is
> `paymentStatus`, not `status`. The `InvoiceStatus` type in `src/types/hospital.ts`
> may need to reflect this. The `?status=` query param is correctly named on the
> request side — the service maps it to `where.paymentStatus` internally.

> **Default pagination:** page 1, limit 10 (max limit 100). Always check `meta.pages`
> to know whether to show a next-page button.

---

### Inventory — `admin/inventory`

#### `GET /hospitals/:id/drug-stock` ✅

**Allowed roles:** `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST`

```ts
// Response shape — array, ordered by lastUpdated desc
Array<{
  id:           string,
  hospitalId:   string,
  drugId:       string,
  quantity:     number,         // current stock level
  reorderLevel: number,         // threshold that triggers low-stock alert
  expiryDate:   string | null,  // ISO datetime or null
  lastUpdated:  string,         // ISO datetime
  lowStockAlert: boolean,       // computed: quantity <= reorderLevel
  drug: {
    brandName:      string,   // ← this is what the task card calls "drugName"
    genericName:    string,
    dosageStrength: string,
    dosageForm:     string,
  }
}>
```

---

#### `PATCH /hospitals/:id/drug-stock/:drugId` ✅

**Allowed roles:** `HOSPITAL_ADMIN`, `PHARMACIST`

> ⚠️ **Gap D — Field name mismatch:** The task card says to send `{ quantity }` in
> the request body. **This is wrong.** The DTO field is `qtyOnHand`, not `quantity`.
> The service internally maps `qtyOnHand → quantity` when writing to the database.
> Sending `{ quantity: 50 }` will be silently ignored (class-validator strips
> unknown fields); the stock level will not change.

```ts
// Correct request body
{
  qtyOnHand?:    number,  // new stock level (min 0) — send to update quantity
  reorderLevel?: number,  // new reorder threshold (min 0) — send to update alert level
}

// Response shape — updated stock item (same shape as GET /drug-stock array item)
{
  id:           string,
  hospitalId:   string,
  drugId:       string,
  quantity:     number,   // reflects the new value written from qtyOnHand
  reorderLevel: number,
  expiryDate:   string | null,
  lastUpdated:  string,
  lowStockAlert: boolean,
  drug: {
    brandName:      string,
    genericName:    string,
    dosageStrength: string,
    dosageForm:     string,
  }
}
```

---

## Auth constraint — `validateHospitalAccess()`

`getStats()`, `getDailyAppointments()`, and `getWeeklyRevenue()` all call the private
`validateHospitalAccess(hospitalId, userId)` helper, which checks:

```ts
if (hospital.userId !== userId) throw new ForbiddenException(...)
```

This means only the user whose `id` matches `hospital.userId` (i.e. the user who
registered the hospital) can call these three endpoints. If your test admin account
was created via a different flow than the hospital registration, you will get a `403`.

> ⚠️ **Gap E:** `GET /hospitals/:id/departments`, `GET /hospitals/:id/drug-stock`,
> and `GET /hospitals/:id/invoices` do NOT use this helper — they use a simpler
> hospital-existence check. So department/drug-stock/invoice calls will succeed for
> any authenticated `HOSPITAL_ADMIN`, but dashboard stats will only succeed for the
> admin who originally registered that hospital. This inconsistency may cause
> confusion if you log in with a seeded admin whose `userId` does not match
> `hospital.userId` in the database.

---

## Gaps summary

| ID | Page | Endpoint | Issue | Blocking? |
|----|------|----------|-------|-----------|
| A | dashboard | `GET /hospitals/:id/dashboard/stats` | 7 backend appointment statuses bucketed into 4 frontend groups — product may want individual counts later | No |
| B | departments | `GET /hospitals/:id/departments` | Endpoint implemented; Postgres columns `isDepartmentHead` and `HospitalStaff.department` not yet migrated to DB — will throw 500 until migration runs | **Yes** |
| C | finance | `GET /hospitals/:id/invoices` | Invoice status field on response is `paymentStatus`, not `status` — frontend must read `invoice.paymentStatus` | Yes |
| D | inventory | `PATCH /hospitals/:id/drug-stock/:drugId` | Request body field is `qtyOnHand`, not `quantity` — sending `quantity` is silently ignored | **Yes** |
| E | dashboard | `GET /hospitals/:id/dashboard/stats` | `validateHospitalAccess()` uses `hospital.userId` — only the hospital's registering user can call stats; other HOSPITAL_ADMIN accounts get 403 | Yes (if multiple admins) |
| F | dashboard | — | No procurement/spend endpoint — "Procured Value" card has no data source | No (deferred feature) |
