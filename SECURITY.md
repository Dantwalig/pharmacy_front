# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in `pharmacy_front`, please report it
**privately**. Do not open a public GitHub issue, pull request, or discussion,
as that could expose the issue before it is fixed.

- Email: **info@ubwengelab.rw**
- Include: a description of the issue, steps to reproduce, the affected
  area/route, and the potential impact.

We will acknowledge your report, investigate, and keep you informed of the
remediation progress. Please give us a reasonable window to address the issue
before any public disclosure.

## Supported versions

This is an actively developed internal product. Only the latest version
deployed from the `main` branch is supported. Fixes are applied forward; we do
not patch older builds.

## Security model (summary)

A short overview of how the frontend handles security. For the full picture,
see [`docs/architecture.md`](docs/architecture.md).

- **Authentication** uses JWT access and refresh tokens stored in cookies. The
  access token is short-lived; the refresh token is longer-lived.
- **Token refresh** is handled automatically by the API layer
  (`src/lib/api.ts`): on a `401`, it attempts a refresh and retries the request
  once, and clears the session and redirects to login if that fails.
- **Route authorization** is enforced by edge middleware
  (`src/middleware.tsx`), which routes users by role
  (`PATIENT`, `PHARMACY`, `BRANCH_MANAGER`, `PHARMACIST`, `CASHIER`, `NURSE`,
  `SUPER_ADMIN`) and, for pharmacies, by account status
  (`PENDING` / `REJECTED` / `APPROVED`).
- **The frontend is not the security boundary.** Client-side checks are for UX;
  the backend API is the authoritative enforcer of authentication,
  authorization, and data access. Never rely on the frontend alone to protect a
  resource.

## Scope

This policy covers the `pharmacy_front` web application. Vulnerabilities in the
backend API or third-party dependencies should be reported through the same
channel so we can coordinate a fix.
