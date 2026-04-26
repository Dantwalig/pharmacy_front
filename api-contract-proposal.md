# API Contract Proposal — Cashier Payment Collection

**Status:** Draft — pending backend team review
**Author:** Frontend team (Cashier UI overhaul)
**Related branch:** `feat/nelly_cashier_ui_overhaul`

---

## 1. Summary

The frontend is overhauling the Cashier role UI to support **two payment modes** per product direction:

- **Verifier mode** — cashier confirms an online payment (Flutterwave) already completed, then advances the order.
- **Collector mode** — cashier records an in-person payment (cash, card swipe, or manually-entered mobile money) and advances the order.

Verifier mode is fully supported by existing endpoints. **Collector mode requires new backend capabilities.** This document proposes the contract so frontend and backend work can proceed in parallel.

---

## 2. Current State (what exists today)

| Endpoint | Purpose | Supports |
|---|---|---|
| `POST /payments/initiate` | Patient-initiated online payment | Verifier flow |
| `GET /payments/verify/:orderId` | Cashier manually verifies Flutterwave txn | Verifier flow |
| `GET /payments/cashier/recent` | Last 50 completed payments | Audit view |
| `PATCH /orders/:id/status` | Advance order status | Both flows |

**Gaps for collector mode:**
1. No endpoint for a staff member to record an in-person payment
2. `PaymentMethod` enum lacks a `CASH` value
3. No receipt generation or reference number assignment for cash transactions

---

## 3. Proposed Changes

### 3.1 Enum update

Add `CASH` to the `PaymentMethod` enum in `schema.prisma`:

```prisma
enum PaymentMethod {
  MTN_MOMO
  AIRTEL_MONEY
  CARD
  INSURANCE
  CASH          // new
}
```

### 3.2 New endpoint — Record in-person payment

```
POST /payments/record
```

**Roles permitted:** `CASHIER`, `PHARMACIST`, `BRANCH_MANAGER`
(Rationale: pharmacies without a dedicated cashier need pharmacists/managers to collect payment. Confirm role list with PO.)

**Request body:**

```json
{
  "orderId": "string (uuid)",
  "method": "CASH | MTN_MOMO | AIRTEL_MONEY | CARD | INSURANCE",
  "amountReceived": "number (RWF, required for CASH)",
  "referenceNumber": "string (optional — manual txn ref for non-cash)",
  "insuranceProvider": "string (required if method=INSURANCE)",
  "insurancePolicyNumber": "string (required if method=INSURANCE)",
  "notes": "string (optional cashier note)"
}
```

**Response (200):**

```json
{
  "paymentId": "string (uuid)",
  "orderId": "string (uuid)",
  "orderTotal": "number",
  "amountReceived": "number",
  "change": "number (amountReceived - orderTotal, 0 if non-cash)",
  "method": "string",
  "status": "COMPLETED",
  "receiptNumber": "string (backend-generated, e.g. RCP-000142)",
  "collectedBy": {
    "userId": "string",
    "name": "string",
    "role": "string"
  },
  "timestamp": "ISO-8601 string"
}
```

**Error cases:**

| Status | Scenario |
|---|---|
| 400 | `amountReceived` less than `orderTotal` for CASH method |
| 400 | Missing required insurance fields when `method=INSURANCE` |
| 404 | Order not found |
| 409 | Order already has a completed payment |
| 409 | Order is CANCELLED or already COMPLETED |
| 403 | Caller's role not permitted, or order belongs to different branch |

**Side effects (to confirm with backend):**

1. Creates a `Payment` record with `status=COMPLETED` linked to the order
2. Sets `Order.paymentStatus = COMPLETED`
3. Does NOT advance `Order.status` — frontend calls `PATCH /orders/:id/status` explicitly as a second step (keeps the two concerns decoupled)
4. Generates an incrementing `receiptNumber` scoped per branch
5. Emits a notification (optional — confirm)

### 3.3 Optional — Receipt retrieval

```
GET /payments/:paymentId/receipt
```

**Roles permitted:** `CASHIER`, `PHARMACIST`, `BRANCH_MANAGER`, `PATIENT` (own orders only)

**Response:** Either a JSON blob with all fields needed to render a receipt client-side, or a URL to a backend-generated PDF. Team preference?

---

## 4. Open Questions for the Backend Team

1. **Role gating on `POST /payments/record`** — confirmed roles above (`CASHIER`, `PHARMACIST`, `BRANCH_MANAGER`), or should it be tighter/looser? This affects both backend guards and frontend role checks.

2. **Receipt number format** — sequential per branch (`RCP-000142`), per pharmacy, or globally unique? Frontend will display whatever you return, but this is a business decision worth writing down now.

3. **Underpayment handling** — reject outright (400), or allow with a flag `isPartial: true`? Real-world pharmacies sometimes accept partial payment with the remainder "on account". If this is out of scope, say so and we'll reject.

4. **Manual reference for online methods** — if a patient says "I already paid via MoMo but my phone shows no confirmation", does `POST /payments/record` with `method=MTN_MOMO` + `referenceNumber` work? Or does that path go through `GET /payments/verify/:orderId` instead? Need a clear rule so UI can branch correctly.

5. **Relationship with existing `Payment.transactionId`** — for `CASH` method, `transactionId` will be null. Does the existing code (indexes, queries, reports) handle null `transactionId` safely?

6. **Cancellation / reversal** — if a cashier records a payment by mistake, how is it reversed? A new `POST /payments/:id/void` endpoint, or manual DB intervention? Out of scope for v1 but worth flagging.

7. **Timeline** — when can frontend expect this endpoint in staging? This affects whether we mock it locally or wire directly.

---

## 5. Open Question for the Product Owner

**At pharmacies that don't have a cashier, which staff member takes payment from the patient and marks the order as paid — the pharmacist, the branch manager, or any staff member on shift?**

This determines the role list on `POST /payments/record` and which frontend screens expose the "Record Payment" action. If we gate it to `CASHIER` only, pharmacies without cashiers can't use the collector flow at all — defeating the point.

---

## 6. Frontend Plan (for backend team's awareness)

Until the endpoint ships, frontend will:
1. Build the collector UI against this proposed contract
2. Mock `POST /payments/record` in a client-side helper returning the shape above
3. Swap the mock for the real endpoint once available — single-point change

This means **no frontend work is blocked** by backend timeline, as long as the final contract doesn't diverge materially from this proposal.

---

## 7. Sign-off

When backend team reviews this document, please reply with one of:

- [ ] **Approved as-is** — frontend proceeds, backend implements as specified
- [ ] **Approved with changes** — note the deltas inline and we'll align
- [ ] **Needs discussion** — propose a 15-minute sync
