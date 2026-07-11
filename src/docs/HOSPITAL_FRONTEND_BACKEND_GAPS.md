## Nurse Portal

### Dashboard

Missing endpoint:

GET /hospitals/:id/nurse/dashboard

Existing dashboard endpoints are Hospital Admin only.

the current backend supports the clinical workflow, but the nurse dashboard/patients/medications pages still need either:
existing endpoints composed together on the frontend, or
new backend endpoints added for those specific views.

---

### Patients

Missing endpoint:

GET /patients
or
GET /hospitals/:id/patients

Current backend only exposes:

GET /inpatient/admissions

which returns admitted patients only.

---

### Vitals

Missing endpoint:

GET /vitals

Existing endpoint requires an admission ID:

GET /inpatient/admissions/:id/vitals

Cannot populate a hospital-wide vitals table.

---

### Medications

Missing endpoint:

GET /mar

Existing endpoint requires an admission ID:

GET /inpatient/admissions/:id/mar

Cannot populate a hospital-wide medication administration page.

## Bottom line:
The backend already has nurse support for:
-triage vitals,
-inpatient admissions,
-vitals logging,
-medication administration records,
and handovers.

