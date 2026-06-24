# Doctor Portal Backend Integration Contract

This document outlines the current integration gaps between the Doctor Portal frontend and the backend API, along with the temporary workarounds or client-side derivations implemented in the frontend.

## Gap 1: Patient `isNew` and `followUpDue` Fields
**Frontend File:** `src/app/hospital/doctor/patient/page.tsx`  
**Endpoint:** `GET /api/hospitals/:hospitalId/patients?doctorId=:id`  
**Description:** 
The frontend UI uses two boolean fields for patients: `isNew` and `followUpDue`. These fields are used to drive the statistic cards ("New Patients", "Follow Ups Due"). However, it's not clear whether the backend explicitly returns these convenience fields in the `Patient` object payload.

### Impact / Gap:
If these fields do not exist on the backend payload, the client-side relies on them being `undefined` and defaults them to `false`. Without these fields, the statistic cards on the frontend will always show `0`.

**Status:** [Blocking] (If there's no way to derive this client-side and the backend doesn't send it).

### Possible Backend & Frontend Alignments:
**Option A (Backend Fix):** The backend pre-calculates and includes `isNew` and `followUpDue` boolean fields in the response for each patient.
**Option B (Client-side Derivation):** The backend provides dates like `firstVisitDate` and `nextAppointmentDate`. The frontend can then derive:
- `isNew` by comparing `firstVisitDate` to the current month or week.
- `followUpDue` by comparing `nextAppointmentDate` against the current date.

### Frontend Workaround:
Currently, the frontend safely falls back to `false` for both properties when parsing the response:
```javascript
const parsed = unwrapData<Patient>(res.data).map(p => ({
  ...p,
  isNew: p.isNew ?? false,
  followUpDue: p.followUpDue ?? false,
}));
```

## Additional Observations
- **Swagger Endpoint Validation:** The exact paths used are `/api/consultations?doctorId=:id` and `/api/hospitals/:hospitalId/patients?doctorId=:id`. Ensure these are correctly documented in the Swagger docs and implemented.
- The `Consultation` object on the frontend expects fields like `patientName`, `date`, `type`, `diagnosis`, `duration`, `status`, `gender`, `age`, and `bp`. Please ensure the backend payloads for consultations provide these properties or rename them accordingly. 
