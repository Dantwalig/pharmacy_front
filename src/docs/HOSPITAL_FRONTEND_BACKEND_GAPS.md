# Hospital Receptionist Portal - Frontend/Backend Integration Gaps

## Missing Endpoints
1. GET /hospitals/:hospitalId/receptionist/dashboard (Missing in Swagger)
2. GET /hospitals/:hospitalId/receptionist/notifications (Missing in Swagger)
3. PATCH /hospitals/:hospitalId/receptionist/notifications/read-all (Missing in Swagger)
4. PATCH /hospitals/:hospitalId/receptionist/notifications/:id/read (Missing in Swagger)
5. GET /hospitals/:hospitalId/receptionist/queue (Missing in Swagger)
6. GET /hospitals/:hospitalId/receptionist/dashboard-stats (Missing in Swagger)
7. GET /hospitals/:hospitalId/receptionist/appointments (Missing in Swagger)
8. GET /hospitals/:hospitalId/receptionist/profile (Missing in Swagger)
9. GET /hospitals/:hospitalId/receptionist/leaves (Missing in Swagger)

## Missing Data Seeds / Authentication
* **Missing Receptionist User Seed**: The receptionist login is not seeded in the database. This currently causes a 401 Unauthorized during login since no valid receptionist accounts exist to test this portal fully. The frontend UI currently handles it gracefully by loading the component shell and displaying an error boundary/state when the session is missing or endpoints return a 401.
