# i18n Audit Report — Patient / Pharmacist / Cashier / Branch / Pharmacy Owner / Super Admin / Auth

**Branch:** `feat/nelly_i18n_audit` (off `origin/dev`)
**Date generated:** 2026-05-01
**Status:** Phase A complete (audit + report). Phases B (add keys) and C (wire `t()`) still pending.

> Static-analysis audit of every user-visible English string that is not wired through `useTranslation()` / `t()`. Cross-verified against `src/lib/i18n/en.ts`. Static analysis cannot guarantee a runtime-clean state — Phase D requires a `npm run dev` smoke-check in FR and RW.

---

## 0. Method

- Tool: 4 parallel Explore agents (one per portal cluster) + targeted Grep + manual verification
- Patterns checked: JSX text nodes, `placeholder=`, `title=`, `aria-label=`, `alt=`, `toast.success/error/loading/info(...)`, `confirm(...)`, `alert(...)`, `prompt(...)`, array option labels, status-map labels, `setError(...)`, inline error text
- Skipped: brand names (Evuze, RAMA, MMI, MTN, Airtel, RWF, RDB, Flutterwave), API enum values used as switch keys, URLs, file extensions, hex colors, Tailwind classes
- Confidence levels:
  - **HIGH** — verified line-by-line by reading the file (Patient portal, Staff portal, Auth pages, all toasts via grep, branch dashboard/analytics/attendance)
  - **MEDIUM** — agent found correct strings but **line numbers may be off by ±5–10**; need re-verification during Phase C wiring (Branch other pages, Pharmacy Owner, Super Admin)

---

## 1. Page Coverage Map (the "1-to-N")

| # | Portal | Route / File | Findings | Confidence | Priority |
|---|---|---|---|---|---|
| 1 | Patient | /patient/cart | 5 | HIGH | high |
| 2 | Patient | /patient/checkout | 17 | HIGH | high |
| 3 | Patient | /patient/dashboard | 11 | HIGH | high |
| 4 | Patient | /patient/medications | 2 | HIGH | med |
| 5 | Patient | /patient/notifications | 16 | HIGH | high |
| 6 | Patient | /patient/orders | 30+ | HIGH | high |
| 7 | Patient | /patient/orders/[id] | 14 | HIGH | high |
| 8 | Patient | /patient/pharmacies | 1 | HIGH | low |
| 9 | Patient | /patient/pharmacies/[id] | 11 | HIGH | high |
| 10 | Patient | /patient/profile | 13 | HIGH | high |
| 11 | Patient | /patient/search | 12 | HIGH | high |
| 12 | Patient (shared) | components/patient/PatientSidebar | 3 | HIGH | low |
| 13 | Patient (shared) | components/patient/PatientTopbar | 4 | HIGH | high |
| 14 | Pharmacist | /staff/attendance | 4 | HIGH | med |
| 15 | Pharmacist | /staff/change-password | 9 | HIGH | high |
| 16 | Pharmacist | /staff/prescriptions | 17 | HIGH | high |
| 17 | Pharmacist | /staff/profile | 8 | HIGH | high |
| 18 | Pharmacist | /staff/orders (PHARMACIST branch) | 12 | HIGH | high |
| 19 | Pharmacist | /staff/dashboard | 6 | HIGH | high |
| 20 | Pharmacist | /staff/inventory | 22 | HIGH | high |
| 21 | Pharmacist | /staff/inventory/add | 14 | HIGH | high |
| 22 | Pharmacist | /staff/inventory/[id] | 9 | HIGH | high |
| 23 | Pharmacist (shared) | components/staff/StaffSidebar | 1 | HIGH | low |
| 24 | Pharmacist (shared) | components/staff/Stafftopbar | 4 | HIGH | high |
| 25 | Cashier | components/staff/CashierOrdersView | 2 | HIGH | low |
| 26 | Cashier | components/staff/CashierPOSModal | 1 | HIGH | low |
| 27 | Branch Mgr | /branch/dashboard | 8 | HIGH | high |
| 28 | Branch Mgr | /branch/analytics | 13 | HIGH | high |
| 29 | Branch Mgr | /branch/attendance | 5 | HIGH | high |
| 30 | Branch Mgr | /branch/change-password | 7 | MEDIUM | high |
| 31 | Branch Mgr | /branch/inventory | 14 | MEDIUM | high |
| 32 | Branch Mgr | /branch/inventory/add | 11 | MEDIUM | high |
| 33 | Branch Mgr | /branch/inventory/[id] | 9 | MEDIUM | high |
| 34 | Branch Mgr | /branch/pending-approval | 5 | MEDIUM | med |
| 35 | Branch Mgr | /branch/staff | 7 | MEDIUM | high |
| 36 | Branch Mgr | /branch/staff/new | 12 | MEDIUM | high |
| 37 | Branch Mgr | /branch/staff/[id] | 4 | MEDIUM | med |
| 38 | Branch Mgr | /branch/transfers | 12 | MEDIUM | high |
| 39 | Branch Mgr (shared) | components/branch/BranchSidebar | 2 | MEDIUM | low |
| 40 | Branch Mgr (shared) | components/branch/BranchTopbar | 1 | MEDIUM | low |
| 41 | Pharmacy Owner | /pharmacy/analytics | 6 | MEDIUM | high |
| 42 | Pharmacy Owner | /pharmacy/dashboard | 8 | MEDIUM | high |
| 43 | Pharmacy Owner | /pharmacy/inventory | 14 | MEDIUM | high |
| 44 | Pharmacy Owner | /pharmacy/inventory/add | 12 | MEDIUM | high |
| 45 | Pharmacy Owner | /pharmacy/inventory/[id] | 11 | MEDIUM | high |
| 46 | Pharmacy Owner | /pharmacy/notifications | 7 | MEDIUM | med |
| 47 | Pharmacy Owner | /pharmacy/orders | minimal (well-translated) | HIGH | low |
| 48 | Pharmacy Owner | /pharmacy/orders/[id] | 22 | MEDIUM | high |
| 49 | Pharmacy Owner | /pharmacy/patients | 3 | MEDIUM | low |
| 50 | Pharmacy Owner | /pharmacy/profile | 11 | MEDIUM | high |
| 51 | Pharmacy Owner | /pharmacy/branches | 11 | MEDIUM | high |
| 52 | Pharmacy Owner | /pharmacy/branches/[id] | 11 | MEDIUM | high |
| 53 | Pharmacy Owner (shared) | components/pharmacy/PharmacySidebar | 4 | MEDIUM | low |
| 54 | Pharmacy Owner (shared) | components/pharmacy/PharmacyTopbar | 0 | HIGH | — |
| 55 | Pharmacy Owner (shared) | components/pharmacy/SupportBot | 12 | MEDIUM | med |
| 56 | Super Admin | /super-admin/analytics | 6 | MEDIUM | high |
| 57 | Super Admin | /super-admin/dashboard | 10 + 3 toasts | HIGH (toasts) / MEDIUM | high |
| 58 | Super Admin | /super-admin/login | 6 | MEDIUM | high |
| 59 | Super Admin | /super-admin/patients | 2 | MEDIUM | low |
| 60 | Super Admin | /super-admin/pharmacies | 16 | MEDIUM | high |
| 61 | Super Admin | /super-admin/pharmacies/[id] | 11 + 1 toast | MEDIUM | high |
| 62 | Super Admin | /super-admin/profile | 13 | MEDIUM | high |
| 63 | Super Admin | /super-admin/map | (not yet scanned — out of original scope, found via Glob) | UNKNOWN | review needed |
| 64 | Super Admin (shared) | components/super-admin/SuperAdminSidebar | 2 | MEDIUM | low |
| 65 | Super Admin (shared) | components/super-admin/SuperAdminTopbar | 0 | HIGH | — |
| 66 | Auth | /app/page (landing) | 30 | HIGH | high |
| 67 | Auth | /login | 2 | HIGH | low |
| 68 | Auth | /signup | 12 (incl. 2 toasts) | HIGH | high |
| 69 | Auth | /forgot-password | 14 | HIGH | high |
| 70 | Auth | /reset-password | 11 | HIGH | high |
| 71 | Auth | /verify-email | 12 | HIGH | high |
| 72 | Auth | /pending-approval | 1 | HIGH | low |
| 73 | Auth | /pharmacy-rejected | 14 | HIGH | high |
| 74 | Auth (shared) | components/shared/LanguageSwitcher | 0 | HIGH | — |
| 75 | Auth (shared) | components/shared/LoadingSpinner | 0 | HIGH | — |
| 76 | Out-of-scope discovered | hooks/useGeolocation | 5 | HIGH | low |
| 77 | Out-of-scope discovered | components/map/MapView | 2 | HIGH | low |

**Approximate total:** ~620 untranslated strings across ~65 files.

---

## 2. Master Findings Table — Detailed

### 2.1 PATIENT PORTAL  (HIGH confidence)

#### `src/app/patient/cart/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 29 | JSX text | Browse Medications | reuse `cart2.browseMedications` |
| 56 | JSX text | Clear Cart | reuse `cart.clearCart` |
| 68 | JSX text | Prescription Required | reuse `medications.prescriptionRequired` |
| 116 | JSX text | Proceed to Checkout | reuse `cart.proceedToCheckout` |
| 120 | JSX text | Continue Shopping | reuse `cart.continueShopping` |

#### `src/app/patient/checkout/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 143 | JSX text | Back to Cart | new key `checkout.backToCart` |
| 163 | JSX text | Pickup | reuse `checkout.pickup` |
| 163 | JSX text | Delivery | reuse `checkout.delivery` |
| 164 | JSX text | Free | new key `checkout.free` |
| 164 | JSX text | +1,000 RWF | leave (interpolated value, but the "+" prefix may need a key like `checkout.addedFee`) |
| 186 | JSX text | Prescription Required | reuse `medications.prescriptionRequired` |
| 189 | JSX text | One or more items require a valid prescription. Please upload it before placing your order. | new key `checkout.prescriptionWarning` |
| 213 | JSX text | Uploading... | new key `checkout.uploading` |
| 214 | JSX text | Upload Prescription | new key `checkout.uploadPrescription` |
| 229 | JSX text | Change | reuse `common.edit` or new `common.change` |
| 241 | JSX text | MTN Mobile Money | reuse `cashier.method_mtn_momo` (consider promoting to `payment.mtnMomo`) |
| 242 | JSX text | Airtel Money | reuse `cashier.method_airtel_money` |
| 243 | JSX text | Debit / Credit Card | new key `payment.card` |
| 244 | JSX text | Insurance | reuse `cashier.insurance` |
| 280 | JSX text | Free | reuse new `checkout.free` |
| 292 | JSX text | Placing Order... | new key `checkout.placingOrder` |
| 293 | JSX text | Place Order | reuse `checkout.placeOrder` (currently "Place Order & Pay") — may need update |
| 296 | JSX text | Upload prescription to continue | new key `checkout.uploadPrescriptionToContinue` |

#### `src/app/patient/dashboard/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 35 | JSX text | Good Morning | reuse `dashboard.goodMorning` |
| 36 | JSX text | Good Afternoon | reuse `dashboard.goodAfternoon` |
| 37 | JSX text | Good Evening | reuse `dashboard.goodEvening` |
| 96 | JSX text | Shopping Cart | reuse `cart.title` |
| 97 | JSX text | Review your pending medical items and proceed to checkout. | new key `patient.cartCardSubtitle` |
| 105 | JSX text | Active Orders | new key `patient.activeOrders` |
| 114 | JSX text | Completed | reuse `common.completed` (verify exists) |
| 115 | JSX text | View history of your past | new key `patient.completedOrdersSubtitle` |
| 160 | JSX text | Browse Nearby Pharmacies | new key `patient.browseNearby` |
| 206 | JSX text | Nearby Pharmacies | new key `patient.nearbyPharmacies` |
| 218 | JSX text | View All → | reuse `common.viewAll` (with arrow concatenated in JSX) |
| 263 | JSX text | Recent Medical Orders | new key `patient.recentOrders` |

#### `src/app/patient/medications/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 125 | JSX text | Try using different keywords or checking your spelling. | new key `medications.tryDifferent` |
| 135 | JSX text | Search across all registered pharmacies instantly. | new key `medications.searchHint` |

#### `src/app/patient/notifications/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 114 | JSX text | Just now | new key `time.justNow` |
| 115 | JSX text | min ago | new key `time.minAgo` |
| 116 | JSX text | hour ago / hours ago | new keys `time.hourAgo`, `time.hoursAgo` |
| 117 | JSX text | day ago / days ago | new keys `time.dayAgo`, `time.daysAgo` |
| 130 | JSX text | You have unread notification(s) | new key `notifications.unreadCount` (with `{count}` interpolation) |
| 135 | JSX text | Mark all as read | reuse `success.allNotificationsRead` (or new `notifications.markAllRead`) |
| 143 | array option | All | reuse `common.all` |
| 144 | array option | Orders | new key `notifications.tabOrders` |
| 145 | array option | Prescriptions | reuse `staff.prescriptions` |
| 146 | array option | Alerts | new key `notifications.tabAlerts` |
| 165 | JSX text | All Notifications | reuse `notifications2.allNotifications` |
| 173 | JSX text | No notifications yet | reuse `notifications2.noNotificationsYet` |
| 173 | JSX text | No notifications in this category | new key `notifications.noneInCategory` |
| 198 | JSX text | New | new key `notifications.newBadge` |

#### `src/app/patient/orders/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 48 | status map | Pending | new keys under `orderStatus.pending` (or reuse `pharmacyOwner.pending`) |
| 50 | status map | Accepted | new key `orderStatus.accepted` |
| 52 | status map | Preparing | new key `orderStatus.preparing` |
| 54 | status map | Out for Delivery | new key `orderStatus.outForDelivery` |
| 56 | status map | Ready for Pickup | new key `orderStatus.readyForPickup` |
| 58 | status map | Delivered | new key `orderStatus.delivered` |
| 60 | status map | Cancelled | new key `orderStatus.cancelled` |
| 108 | aria-label | Close dialog | new key `common.closeDialog` |
| 114 | JSX text | Order Details | new key `orders.orderDetails` |
| 131 | JSX text | Delivery / Pickup | already in `checkout.delivery` / `checkout.pickup` |
| 143 | JSX text | Order Progress | new key `orders.orderProgress` |
| 187 | JSX text | Cancellation Reason | reuse `orders2.cancellationReason` |
| 195 | JSX text | Pharmacy | reuse `orders.pharmacyInfo` (or new `common.pharmacy`) |
| 220 | JSX text | Medications | reuse `orders.medications` |
| 249 | JSX text | Delivery Details | reuse `orders.deliveryInfo` |
| 269 | JSX text | Payment Summary | reuse `orders.paymentSummary` |
| 272 | JSX text | Subtotal | reuse `orders.subtotal` |
| 277 | JSX text | Delivery Fee | reuse `orders.deliveryFee` |
| 283 | JSX text | Insurance Coverage | reuse `orders.insuranceCoverage` |
| 288 | JSX text | Total | reuse `orders.total` |
| 315 | JSX text | Prescription | new key `orders.prescriptionLabel` |
| 349 | JSX text | Close | reuse `common.close` |
| 409 | JSX text | My Orders | reuse `orders.title` |
| 411 | JSX text | Track, manage, and view all your medication orders | new key `orders.subtitle2` (current `orders.subtitle` is shorter) |
| 430 | JSX text | All Orders | reuse `common.all` |
| 447 | JSX text | In Progress | new key `orders.inProgress` |
| 464 | JSX text | Completed | reuse `orders.completed` |
| 472 | JSX text | All Orders / In Progress Orders / Completed Orders | new keys `orders.allOrdersHeader`, `orders.inProgressHeader`, `orders.completedHeader` |
| 483 | JSX text | No orders found | reuse `orders2.noOrdersFound` |
| 486 | JSX text | You have no active orders at the moment. | new key `orders.noActiveYet` |
| 488 | JSX text | No completed orders yet. | new key `orders.noCompletedYet` |
| 489 | JSX text | Your orders will appear here once you place them. | reuse `orders2.ordersWillAppear` |
| 539 | JSX text | + more | new key `orders.moreItemsBadge` |

#### `src/app/patient/orders/[id]/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 58 | toast.error | Please enter your mobile money number | new key `payment.enterMomoNumber` |
| 71 | toast.success | Please enter the OTP sent to your phone | new key `payment.enterOtp` (note: this is success but reads like instruction) |
| 75 | toast.success | Redirecting to secure payment page... | new key `payment.redirecting` |
| 96 | toast.success | Payment completed successfully! | new key `payment.completed` |
| 100 | (variable) | Invalid OTP | new key `payment.invalidOtp` |
| 131 | JSX text | Delivery / Pickup | reuse |
| 248 | JSX text | Complete your payment | new key `payment.completeYour` |
| 255 | JSX text | Mobile Money Number | new key `payment.momoNumberLabel` |
| 258 | placeholder | e.g. 078XXXXXXX | new key `payment.momoNumberPlaceholder` |
| 277 | JSX text | Enter OTP | new key `payment.enterOtpLabel` |
| 280 | placeholder | 123456 | new key `payment.otpPlaceholder` |
| 291 | JSX text | Verifying... / Submit OTP | new keys `payment.verifying`, `payment.submitOtp` |
| 303 | JSX text | Prescription Information | new key `payment.prescriptionInfo` |
| 308 | JSX text | View Prescription | new key `payment.viewPrescription` |

#### `src/app/patient/pharmacies/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 119 | JSX text | View Medications → | reuse `pharmacies.viewMedications` (with arrow as JSX sibling) |

#### `src/app/patient/pharmacies/[id]/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 96 | JSX text | Pharmacy Not Found | reuse `pharmacies.notFound` |
| 98 | JSX text | Go Back | reuse `common.back` |
| 120 | JSX text | Back | reuse `common.back` |
| 145 | placeholder | Search medications... | new key `medications.searchMedicationsPlaceholder` |
| 170 | JSX text | Medications Found | new key `pharmacies.medicationsFound` |
| 177 | JSX text | No medications available matching your search | reuse `errors.noMedicationsFound` (or extend) |
| 205 | JSX text | In Stock: | reuse `medications.stock` (or new `medications.inStockLabel`) |
| 206 | JSX text | Units | reuse `inventory.units` |
| 211 | JSX text | Prescription Required | reuse `medications.prescriptionRequired` |
| 217 | JSX text | Price | reuse `pharmacy.price` |
| 227 | JSX text | Add to Cart | reuse `medications.addToCart` |

#### `src/app/patient/profile/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 78–80 | array option | Profile Info / Security / Notifications | new keys `profile.tabInfo`, `profile.tabSecurity`, `profile.tabNotifications` |
| 151 | JSX text (×3) | Current Password / New Password / Confirm New Password | new keys `profile.currentPassword` (others may exist in `staff.newPassword`/`branch.newPassword`/`branch.confirmPassword`) |
| 168 | JSX text | Changing... / Change Password | reuse `profile2.changingPassword` / new `profile.changePassword` |
| 179–182 | JSX text | Order status updates / Get notified ... / Prescription verification / Alerts when ... / Auto-refill reminders / 3 days before ... / Promotions & offers / Special deals ... | 8 new keys under `profile.notifications.*` |

#### `src/app/patient/search/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 143 | JSX text | Pharmacies Near You / All Pharmacies | new keys `search.nearYou`, `search.allPharmacies` |
| 155 | title | Map view | new key `search.mapView` |
| 163 | title | List view | new key `search.listView` |
| 180 | JSX text | Find Pharmacy & Medicine | reuse from PatientSidebar (will be deduplicated) |
| 193 | placeholder | Search pharmacies by name or area… | reuse `search.searchPlaceholder` |
| 207 | JSX text | Search | reuse `common.search` |
| 225 | JSX text | pharmacies / medications | reuse `pharmacies.pharmacies` / `medications.medications` |
| 248 | JSX text | Find Pharmacies Near Me | new key `search.findNearMe` |
| 250 | JSX text | Allow location access to see pharmacies sorted by distance. | new key `search.allowLocation` |
| 260 | JSX text | Locating… / Use My Location | new keys `search.locating`, `search.useMyLocation` |
| 336 | JSX text | In Stock / Out of Stock | reuse `inventory.inStock` / `inventory.outOfStock` |
| 345 | JSX text | Add to Cart | reuse `medications.addToCart` |

#### `src/components/patient/PatientSidebar.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 22 | JSX text | Find Pharmacy & Medicine | new key `patient.findTagline` |
| 58 | JSX text | Evuze | brand — keep as-is |
| 105 | JSX text | © 2026 Evuze Platform | new key `common.copyright` (with year interpolation) |

#### `src/components/patient/PatientTopbar.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 46 | JSX text | Evuze Healthcare Platform | reuse `topbar.eVuzeHealthcare` |
| 76 | JSX text | Patient | reuse role label (new `roles.patient`) |
| 89 | JSX text | My Profile | reuse `common.profile` or `profile.title` |
| 96 | JSX text | Logout | reuse `common.logout` |

---

### 2.2 PHARMACIST / CASHIER PORTAL  (HIGH confidence)

#### `src/app/staff/attendance/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 75–77 | array label | Total Records / Completed / Total Hours | new keys `staff.totalRecords` / reuse `branch.completedShifts` / reuse `branch.totalHours` |
| 137 | JSX text | Rejection: | new key `staff.rejectionLabel` |

#### `src/app/staff/change-password/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 64 | JSX text | Please set a permanent password before accessing your account. | new key `staff.setPasswordNotice` |
| 70–72 | label | Temporary Password / New Password / Confirm New Password | reuse `staff.tempPassword` / `staff.newPassword` / `staff.confirmPassword` |
| 70 | placeholder | Enter the password from your email | new key `staff.tempPasswordPlaceholder` |
| 71 | placeholder | At least 8 characters | new key `staff.newPasswordPlaceholder` |
| 72 | placeholder | Re-enter new password | new key `staff.confirmPasswordPlaceholder` |
| 104 | JSX text | Saving... | reuse `common.saving` |
| 106 | JSX text | Set Password & Continue | reuse `branch` equivalent (from change-password) or new `staff.setPasswordContinue` |

#### `src/app/staff/prescriptions/page.tsx`
17 findings. See agent output above. Most should reuse existing `staff.prescriptions*`, `staff.verify`, `staff.reject`, `prescriptions.*` keys; a few new (`prescriptions.submittedLabel`, `prescriptions.reviewedLabel`, `prescriptions.fileLabel`, `prescriptions.reasonLabel`, `prescriptions.viewFile`, `prescriptions.rejecting`, `prescriptions.verifying`, `prescriptions.noneInQueue`, `prescriptions.noHistory`).

#### `src/app/staff/profile/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 95–100 | array label | Email / Phone / National ID / Gender / Date of Birth / Member Since | reuse `form.email`/`form.phone`/`form.nationalId`/`form.gender`/`form.dateOfBirth` + new `staff.memberSince` |
| 132 | JSX text | My Permissions / (granted) | new keys `staff.myPermissions`, `staff.granted` |
| 154 | button | Change Password | reuse `branch.changePassword` |

#### `src/app/staff/orders/page.tsx` (PHARMACIST branch)
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 115–118 | array label | Total / Pending / Active / Completed | reuse `common.total` etc., or new in `staff.tabs` |
| 144 | button | All | reuse `common.all` |
| 179 | JSX text | item / items | reuse `cashier.item` / `cashier.items` |
| 203 | JSX text | Items | reuse `orders.items` (capitalized) |
| 224 | JSX text | Patient contact | reuse `orders2.patientContact` |
| 232 | JSX text | Prescription attached · Status: | reuse `orders2.hasPrescription` + new label |
| 239 | JSX text | Status update actions | new key `staff.statusUpdateActions` |
| 249 | JSX text | Updating... | new key `staff.updating` |

#### `src/app/staff/dashboard/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 240 | button | Clock In | reuse `branch.clockIn` |
| 258 | JSX text | Approved by | new key `staff.approvedBy` |
| 266 | JSX text | hours worked | new key `staff.hoursWorked` |
| 273 | JSX text | Rejection reason: | reuse new `staff.rejectionLabel` |
| 286 | button | Clock Out | reuse `branch.clockOut` |
| 300 | button | Try Again | new key `common.tryAgain` |

#### `src/app/staff/inventory/page.tsx`  (cashier sees this read-only)
22 findings. Most reuse `staff.inventory*` and `inventory.*` keys. New keys: `inventory.totalItems`, `inventory.categoriesLabel`, `inventory.low`, `inventory.tryFilters`, `inventory.addFirst`, `inventory.tableMedication`, `inventory.tableCategory`, `inventory.tablePrice`, `inventory.tableQuantity`, `inventory.tableThreshold`, `inventory.tablePrescription`, `inventory.tableStatus`, `inventory.tableActions`, `inventory.no`, `inventory.showing`, `inventory.of`, `inventory.medicationsCount`.

#### `src/app/staff/inventory/add/page.tsx`
14 findings. Reuse `staff.inventory*` and existing `inventory.*` (like `inventory.medicationInfo`, `inventory.unitPriceRwf`, `inventory.quantityInStock`). New: `inventory.medicationNamePlaceholder`, `inventory.pricePlaceholder`, `inventory.quantityPlaceholder`, `inventory.adding`.

#### `src/app/staff/inventory/[id]/page.tsx`
9 findings. Same key reuses; new: `inventory.backToInventory`.

#### `src/components/staff/StaffSidebar.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 42 | JSX text | E-Vuze | brand — keep |

#### `src/components/staff/Stafftopbar.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 9 | object label | Pharmacist | new key `roles.pharmacist` |
| 11 | object label | Cashier | new key `roles.cashier` |
| 12 | object label | Nurse | new key `roles.nurse` |
| 48 | JSX text | Staff | reuse `topbar.staffPortal` |

#### `src/components/staff/CashierOrdersView.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 151 | JSX text | item / items | reuse `cashier.item` / `cashier.items` |

#### `src/components/staff/CashierPOSModal.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 396 | placeholder | e.g. RSSB, MMI | new key `cashier.insurancePlaceholder` |

---

### 2.3 BRANCH MANAGER PORTAL  (mixed confidence)

#### `src/app/branch/dashboard/page.tsx`  (HIGH confidence — verified)
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 78 | toast.error fallback | Failed to approve | reuse `errors.failedToLoad` pattern; new `errors.failedToApprove` |
| 85 | (API value, hardcoded) | Rejected by manager | API-side string — leave (not user-visible) |
| 89 | toast.error fallback | Failed to reject | new `errors.failedToReject` |
| 101 | toast.error fallback | Failed to approve | reuse |
| 108 | (API value) | Rejected by manager | API-side — leave |
| 112 | toast.error fallback | Failed to reject | reuse |
| 122 | array label | Total Staff | new key `branch.totalStaff` |
| 123 | array label | Pending Approvals | new key `branch.pendingApprovals` |
| 124 | array label | Active Today | new key `branch.activeToday` |
| 125 | array label | Hours Worked | new key `branch.hoursWorked` |

#### `src/app/branch/analytics/page.tsx`  (HIGH — verified)
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 72–75 | array label | Total Orders / Completed Orders / Total Revenue / Avg Order Value | reuse where keys exist (`pharmacy.todayOrders`, `dashboard.totalRevenue`); new `branch.completedOrders`, `analytics.avgOrderValue` |
| 132 | JSX text | Attendance — Today | new key `analytics.attendanceToday` |
| 135–138 | array label | Active Shifts / Pending / Completed / Hours Worked | new keys `analytics.activeShifts`, reuse `common.completed`, etc. |
| 163 | Recharts name | Revenue | reuse `common.revenue` |
| 168 | JSX text | No completed orders in the last 14 days | new key `analytics.noCompleted14d` |
| 184 | Recharts name | Orders | new key `analytics.ordersChartLabel` |
| 189 | JSX text | No orders yet | reuse `dashboard.noOrdersYet` |

#### `src/app/branch/attendance/page.tsx`  (HIGH — verified)
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 66 | prompt() | Reason for rejection (optional): | new key `branch.rejectReasonPrompt` (note: `prompt()` is browser-native; consider replacing with custom modal) |
| 72 | toast.success | Rejected / Approved | reuse from `success.clockIn*` family — confirm exact strings |
| 75 | toast.error fallback | Action failed | new key `errors.actionFailed` |
| 97 | JSX text (interpolated) | records total | new key `attendance.recordsTotal` (with count interpolation) |
| 112 | array label | All | reuse `common.all` |

#### Other Branch pages  (MEDIUM confidence — line numbers approximate)

- `/branch/change-password/page.tsx`: ~7 findings. JSX text "Change Password", "Set a new password to secure your account", "You're logging in for the first time. Please set a permanent password to continue.", placeholders for current/new/confirm, "Set Password & Continue".
- `/branch/inventory/page.tsx`: ~14 findings. Search placeholder, tab labels (All/Low Stock/Out of Stock), "Add Medication", table headers (Medication Name/Category/Stock Level/Unit Price/Actions), stock status labels (Out of Stock/Low Stock/In Stock), action buttons (Edit/Delete).
- `/branch/inventory/add/page.tsx`: ~11 findings. "Add Medication", subtitle, form labels, "Select category" placeholder, price/quantity placeholders, button.
- `/branch/inventory/[id]/page.tsx`: ~9 findings. Edit form mirrors add page.
- `/branch/pending-approval/page.tsx`: ~5. "Upload Branch License", description text, "Under Review", button labels.
- `/branch/staff/page.tsx`: ~7. "Staff Members", "Add Staff", table headers, action labels.
- `/branch/staff/new/page.tsx`: ~12. Form title, subtitle, all field labels (First/Last Name, Email, Role select including PHARMACIST/CASHIER/NURSE, Permissions, Add button).
- `/branch/staff/[id]/page.tsx`: ~4. Stat cards (Total Shifts/Completed Shifts/Total Hours), section header.
- `/branch/transfers/page.tsx`: ~12. Page header, "Request Transfer", table headers (From/To Branch/Items/Date/Status), modal labels (From/To/Notes), select placeholders, "Create Transfer", + the verified `placeholder="Qty"` at L297.

#### `src/components/branch/BranchSidebar.tsx`
- L48: "E-Vuze" (brand — keep)
- L49: "Branch Portal" — reuse `branch.portal`

#### `src/components/branch/BranchTopbar.tsx`
- L35: "Branch Manager" — reuse `topbar.branchManager`

---

### 2.4 PHARMACY OWNER PORTAL  (MEDIUM confidence except where noted)

`/pharmacy/orders/page.tsx` is well-translated (HIGH-confidence verified — minimal findings). Other pages have substantial untranslated content. See section 1 counts.

#### `src/app/pharmacy/analytics/page.tsx`
~6 findings: stat card labels (Total Revenue / Total Orders / Active Customers / Avg Order Value), section headers (Revenue by Branch / Order Status Distribution).

#### `src/app/pharmacy/dashboard/page.tsx`
~8 findings: stat card labels, "Branch Performance", "Recent Orders", "Pending Verification", "View Details".

#### `src/app/pharmacy/inventory/page.tsx`
~14 findings: search placeholder, tab labels, table headers, stock status labels, action buttons.

#### `src/app/pharmacy/inventory/add/page.tsx`
~12 findings: title, subtitle, "Add Manually" / "Upload File" tabs, form labels, placeholders, button.

#### `src/app/pharmacy/inventory/[id]/page.tsx`
~11 findings: page title, View/Edit toggle, form labels, button.

#### `src/app/pharmacy/notifications/page.tsx`
~7 findings: page title, filter tabs (All/Orders/Inventory/Other), notification type labels.

#### `src/app/pharmacy/orders/[id]/page.tsx`
~22 findings: order details labels, table headers, action buttons (Accept Order / Start Preparing / Mark Ready / Reject Order), rejection reason input.

#### `src/app/pharmacy/patients/page.tsx`
~3 findings: page title, "Feature Arriving Soon", status notice.

#### `src/app/pharmacy/profile/page.tsx`
~11 findings: page header, section headers, form labels (Pharmacy Name / Location / Contact / Email), Documents section (Upload/Download), success toast "Saved successfully".

#### `src/app/pharmacy/branches/page.tsx`
~11 findings: page header, "Add Branch", table headers, status labels (Active/Pending Setup/Pending Approval), action labels (View Details/Remove).

#### `src/app/pharmacy/branches/[id]/page.tsx`
~11 findings: page title, section headers (Statistics, Staff Members), stat labels, table headers, action labels.

#### `src/components/pharmacy/PharmacySidebar.tsx`
- L43: "E-Vuze" (brand)
- L44: "Pharmacy Portal" — reuse `pharmacy.portal`
- L86: "Get Support" — reuse `common.getSupport`
- L90: "Logout" — reuse `common.logout`

#### `src/components/pharmacy/SupportBot.tsx`
~12 findings: form labels, placeholders, success/empty states. Many reuse `supportBot.*` namespace already.

---

### 2.5 SUPER ADMIN PORTAL  (mixed)

#### `src/app/super-admin/dashboard/page.tsx`  (HIGH confidence — toasts verified)
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 98 | toast.success | Branch approved successfully | new key `superAdmin.branchApproved` |
| 101 | toast.error fallback | Failed to approve branch | reuse `errors.failedToApprove` |
| 109 | toast.error | Please provide a rejection reason | reuse `form.provideRejectionReason` |
| 115 | toast.success | Branch rejected | new key `superAdmin.branchRejected` |
| 569 | placeholder | Reason for rejection (e.g. invalid license, incomplete documents...) | new key `superAdmin.rejectionReasonPlaceholder` |
| (many more JSX texts ~10 — MEDIUM line accuracy) | | | |

#### `src/app/super-admin/pharmacies/[id]/page.tsx`
- L62 (HIGH): `toast.error('Popup blocked — please allow popups for this site')` — new key `errors.popupBlocked`
- ~11 other JSX findings (MEDIUM)

#### `src/app/super-admin/map/page.tsx`  (NOT YET SCANNED)
This page exists but was not in the original Glob results. Needs a follow-up scan — likely to contain map controls, search placeholder, filter labels (status/active filters).

#### Other Super Admin pages
See section 1 counts. Most pages have stat card labels, table headers, status pills, action buttons — high overlap with patterns already cataloged.

---

### 2.6 AUTH PAGES + LANDING  (HIGH confidence)

#### `src/app/page.tsx`  (Landing)
~30 findings: hero text, feature cards, CTAs, footer copyright. Most should be added under a new `landing.*` namespace. Sample:
- L50: "Loading your dashboard..."
- L62: "Redirecting you to the portal..."
- L75: "Healthcare Platform"
- L98: "Rwanda's Healthcare Platform" / "Rwanda's Pharmacy Management Solution"
- L105–111: hero headline parts ("Connecting Patients with", "Nearby Pharmacies", "Empowering Pharmacies with", "Modern Management")
- L118–119: hero descriptions (long-form)
- L126: "Get Started" / "Register Your Pharmacy"
- L143: "Why Choose Evuze?"
- L148–159: feature card titles + descriptions (×3)
- L178–183: CTA section
- L190, L196: "I'm a Patient" / "I'm a Pharmacy"
- L204: "© 2026 Evuze Healthcare Platform. All rights reserved."

#### `src/app/login/page.tsx`
- L112: `placeholder="you@example.com"` → reuse `auth.email` placeholder pattern (or new `auth.emailPlaceholder`)
- L131: `placeholder="••••••••"` — possibly intentional (visual only); leave with `[REVIEW]`

#### `src/app/signup/page.tsx`
| Line | Category | English | Suggested Action |
|---|---|---|---|
| 65 | toast.error | Please pin your home location on the map before submitting. | new key `signup.pinHomeRequired` |
| 95 | toast.error | Please pin your pharmacy location on the map before submitting. | new key `signup.pinPharmacyRequired` |
| 192 | placeholder | John | new key `signup.firstNamePlaceholder` |
| 201 | placeholder | Doe | new key `signup.lastNamePlaceholder` |
| 212 | placeholder | you@example.com | new key `signup.emailPlaceholder` |
| 222 | placeholder | +250 7XX XXX XXX | new key `signup.phonePlaceholder` |
| 262 | label | Pin Your Home Location | new key `signup.pinHomeLabel` |
| 345 | placeholder | pharmacy@email.com | new key `signup.businessEmailPlaceholder` |
| 354 | placeholder | +250 7XX XXX XXX | reuse |
| 383 | label | Pin Pharmacy Location on Map | new key `signup.pinPharmacyLabel` |

#### `src/app/forgot-password/page.tsx`
~14 findings: subtitle text, sidebar feature cards (×4 titles + ×4 descriptions), placeholder, "Sending...", spam note, copyright.

#### `src/app/reset-password/page.tsx`
~11 findings: similar structure to forgot-password (sidebar reused), interpolated `Code sent to: {email}`, "Resetting...".

#### `src/app/verify-email/page.tsx`
~12 findings: similar pattern; `Sent to: {email}`, "Verifying...", "← Back to Login".

#### `src/app/pending-approval/page.tsx`
- L128: `© 2025 E-Vuze Healthcare Platform. All rights reserved.` — new key `common.copyright2025` (or unify with common.copyright)

#### `src/app/pharmacy-rejected/page.tsx`
~14 findings: page title, rejection notice, all form labels, file upload helper text, resubmit button, support contact text, copyright.

---

### 2.7 OUT-OF-SCOPE FILES DISCOVERED (flagged for follow-up)

#### `src/hooks/useGeolocation.ts`
- L25, L40, L43, L46, L49 — 5 setError calls with user-facing strings ("Geolocation is not supported by your browser", "Location access was denied. Please enable it in browser settings", etc.)
- These are surfaced via `error` from the hook — **needs i18n integration** (consumer should pass `t` or hook should return error keys).

#### `src/components/map/MapView.tsx`
- L72: "Failed to load map library. Check your connection." (setError)
- L101: "Failed to initialize map." (setError)
- Same recommendation as above.

---

## 3. Native-Speaker Review Queue (Kinyarwanda) — POPULATED in Phase B

**481 new Kinyarwanda values added**, every one flagged `[REVIEW RW]` for the native speaker (user) to confirm or correct before merge.

**Where to find them:** `src/lib/i18n/rw.ts`, lines 1027–1578 (everything between the comment `=== ADDED IN i18n AUDIT (Phase B...)===` and the closing `};`).

**How to review:**
1. Open `src/lib/i18n/rw.ts`
2. Search for `[REVIEW RW]` (Ctrl/Cmd+F)
3. For each occurrence:
   - If the proposed translation is correct: remove just the `[REVIEW RW] ` prefix.
   - If wrong: replace with the correct Kinyarwanda translation (and remove the `[REVIEW RW] ` prefix).
4. When done, run `git grep "\[REVIEW RW\]" src/lib/i18n/rw.ts` to confirm zero remaining.

**Translation philosophy used (please correct as needed):**
- Order/prescription/attendance statuses: borrowed from existing `success.clockIn*` and `pharmacyOwner.*` patterns.
- Roles (Pharmacist, Cashier, Nurse): Kinyarwanda renderings (`Umufarumasi`, `Umucungamari`, `Umuforomo`).
- Commerce verbs (Add to Cart, Place Order, Pay): may need idiom adjustments.
- Time relative labels (just now, min ago) — kept literal; you may prefer a different convention.
- Brand names (Evuze, MTN, Airtel, RWF, RDB) left untouched.

**By namespace (key counts):**

| Namespace | Keys | Example |
|---|---|---|
| `orderStatus` | 10 | `orderStatus.pending` → "Bitegerejwe" |
| `prescriptionStatus` | 4 | `prescriptionStatus.verified` → "Byemejwe" |
| `attendanceStatus` | 6 | `attendanceStatus.clockedOut` → "Yasohotse" |
| `branchStatusLabels` | 7 | `branchStatusLabels.pendingSetup` → "Iboneza Bitegerejwe" |
| `pharmacyStatusLabels` | 3 | `pharmacyStatusLabels.approved` → "Byemejwe" |
| `roles` | 11 | `roles.pharmacist` → "Umufarumasi" |
| `time` | 7 | `time.justNow` → "Ubu nyine" |
| `landing` | 31 | `landing.heroPatientPart1` → "Guhuza Abarwayi na" |
| `payment` | 18 | `payment.completed` → "Kwishyura byagenze neza!" |
| `geolocation` | 5 | `geolocation.denied` → "Kwemera kubona aho uri byanze..." |
| `mapErrors` | 2 | `mapErrors.loadFailed` → "Ntibyashobotse gukuramo ibikoresho..." |
| `extras.common` | 11 | `extras.common.tryAgain` → "Ongera Ugerageze" |
| `extras.cart` | 3 | `extras.cart.shoppingCart` → "Agasanduku ko Kugura" |
| `extras.checkout` | 9 | `extras.checkout.placeOrder` → "Shyiraho Itumiza" |
| `extras.medications` | 6 | `extras.medications.searchHint` → "Shakisha muri farumasi zose..." |
| `extras.orders` | 14 | `extras.orders.orderDetails` → "Ibisobanuro by'Itumiza" |
| `extras.notifications` | 9 | `extras.notifications.markAllRead` → "Andika byose nk'ibyasomwe" |
| `extras.profile` | 16 | `extras.profile.tabSecurity` → "Umutekano" |
| `extras.search` | 11 | `extras.search.findNearMe` → "Shaka Farumasi Zegereye" |
| `extras.staff` | 17 | `extras.staff.statusUpdateActions` → "Ibikorwa byo guhindura imimerere" |
| `extras.prescriptions` | 14 | `extras.prescriptions.viewFile` → "Reba idosiye y'inyandiko y'umuti" |
| `extras.inventory` | 38 | `extras.inventory.addMedication` → "Ongeraho Umuti" |
| `extras.branch` | 41 | `extras.branch.uploadBranchLicense` → "Ohereza Uruhushya rw'Ishami" |
| `extras.analytics` | 12 | `extras.analytics.avgOrderValue` → "Igiciro Cyo Hagati cy'Itumiza" |
| `extras.errors` | 8 | `extras.errors.actionFailed` → "Igikorwa cyananiye" |
| `extras.success` | 4 | `extras.success.branchApproved` → "Ishami ryemejwe neza" |
| `extras.signup` | 7 | `extras.signup.pinHomeLabel` → "Shyira Aho Utuye" |
| `extras.superAdmin` | 30 | `extras.superAdmin.adminProfile` → "Umwirondoro w'Umuyobozi" |
| `extras.cashier` | 1 | `extras.cashier.insurancePlaceholder` → "Urugero: RSSB, MMI" |
| `extras.pharmacy` | 47 | `extras.pharmacy.acceptOrder` → "Emera Itumiza" |
| `extras.auth` | 16 | `extras.auth.featureSecure` → "Bizewe & Bigenga" |
| `extras.pharmacyRejected` | 14 | `extras.pharmacyRejected.title` → "Icyifuzo Cyanze" |
| `extras.supportBot` | 11 | `extras.supportBot.sendMessage` → "Ohereza Ubutumwa" |
| `extras.patient` | 7 | `extras.patient.activeOrders` → "Itumiza Rikora" |

---

## 4. French Translation Queue — POPULATED in Phase B

**480 new French values added** as best-effort proposals, every one prefixed `[FR TODO]` for a French speaker to verify or replace.

**Where to find them:** `src/lib/i18n/fr.ts`, lines 1027–1577 (everything between the comment `=== ADDED IN i18n AUDIT (Phase B...)===` and the closing `};`).

**How to audit (for a French reviewer):**
1. Open `src/lib/i18n/fr.ts`
2. Search for `[FR TODO]` (Ctrl/Cmd+F)
3. For each occurrence:
   - If the proposed translation is correct/idiomatic: just remove the `[FR TODO] ` prefix.
   - If wrong: replace with a correct French translation (and remove the prefix).
4. When done, run `git grep "\[FR TODO\]" src/lib/i18n/fr.ts` to confirm zero remaining.

**Same namespaces as the RW queue above** (480 keys mirror 1-to-1 with `rw.ts`, except for the comment marker count).

**Notes for the French reviewer:**
- The proposals were written by an AI assistant with general French knowledge. Verify everything; idioms and pharmacy-specific terminology especially.
- Quebec vs France French: proposals lean toward France French. Adjust if your audience is West/Central African French.
- Apostrophes: file uses backslash-escaped `\'` for embedded apostrophes (e.g., `d\'aide`). Maintain that convention.
- Plural rules: keys ending in `_one` and `_other` are i18next plural forms — keep both, French uses 2 plural forms like English.

---

## 4b. How Phase B Was Structured

To minimize risk of breaking existing keys, **Phase B was purely additive** — no existing keys were modified, renamed, or deleted. New content was added in two ways:

1. **New top-level namespaces** (clean, semantic groupings):
   - `orderStatus`, `prescriptionStatus`, `attendanceStatus`, `branchStatusLabels`, `pharmacyStatusLabels`, `roles`, `time`, `landing`, `payment`, `geolocation`, `mapErrors`

2. **One `extras` namespace** with sub-objects per existing concept (`extras.common`, `extras.cart`, `extras.checkout`, etc.). This avoids touching any existing namespace block, so there's zero regression risk for already-wired code.

In Phase C, components reference the new keys via dot notation, e.g., `t('orderStatus.pending')`, `t('extras.common.tryAgain')`.

**Type-check status:** `npx tsc --noEmit` on the i18n files passes with zero errors after Phase B.

---

## 5. Wiring-Only Quick Wins (key already exists in en.ts)

These are the easiest fixes — no new translation keys are needed; the component just needs to use `{t('key')}` instead of the literal:

| File | Line | Existing Key | Notes |
|---|---|---|---|
| src/app/patient/cart/page.tsx | 29 | `cart2.browseMedications` | wire only |
| src/app/patient/cart/page.tsx | 56 | `cart.clearCart` | wire only |
| src/app/patient/cart/page.tsx | 68 | `medications.prescriptionRequired` | wire only |
| src/app/patient/cart/page.tsx | 116 | `cart.proceedToCheckout` | wire only |
| src/app/patient/cart/page.tsx | 120 | `cart.continueShopping` | wire only |
| src/app/patient/checkout/page.tsx | 163 | `checkout.delivery` / `checkout.pickup` | wire only |
| src/app/patient/dashboard/page.tsx | 35–37 | `dashboard.goodMorning/Afternoon/Evening` | wire only |
| src/app/patient/dashboard/page.tsx | 96 | `cart.title` | wire only |
| src/app/patient/dashboard/page.tsx | 218 | `common.viewAll` | wire only |
| src/app/patient/orders/page.tsx | 187 | `orders2.cancellationReason` | wire only |
| src/app/patient/orders/page.tsx | 220 | `orders.medications` | wire only |
| src/app/patient/orders/page.tsx | 272 | `orders.subtotal` | wire only |
| src/app/patient/orders/page.tsx | 277 | `orders.deliveryFee` | wire only |
| src/app/patient/orders/page.tsx | 283 | `orders.insuranceCoverage` | wire only |
| src/app/patient/orders/page.tsx | 288 | `orders.total` | wire only |
| src/app/patient/orders/page.tsx | 349 | `common.close` | wire only |
| src/app/patient/orders/page.tsx | 409 | `orders.title` | wire only |
| src/app/patient/orders/page.tsx | 430 | `common.all` | wire only |
| src/app/patient/orders/page.tsx | 464 | `orders.completed` | wire only |
| src/app/patient/orders/page.tsx | 483 | `orders2.noOrdersFound` | wire only |
| src/app/patient/orders/page.tsx | 489 | `orders2.ordersWillAppear` | wire only |
| src/app/patient/pharmacies/page.tsx | 119 | `pharmacies.viewMedications` | wire only |
| src/app/patient/pharmacies/[id]/page.tsx | 96 | `pharmacies.notFound` | wire only |
| src/app/patient/pharmacies/[id]/page.tsx | 98 / 120 | `common.back` | wire only |
| src/app/patient/pharmacies/[id]/page.tsx | 211 | `medications.prescriptionRequired` | wire only |
| src/app/patient/pharmacies/[id]/page.tsx | 217 | `pharmacy.price` | wire only |
| src/app/patient/pharmacies/[id]/page.tsx | 227 | `medications.addToCart` | wire only |
| src/app/patient/search/page.tsx | 193 | `search.searchPlaceholder` | wire only |
| src/app/patient/search/page.tsx | 207 | `common.search` | wire only |
| src/app/patient/search/page.tsx | 336 | `inventory.inStock` / `inventory.outOfStock` | wire only |
| src/app/patient/search/page.tsx | 345 | `medications.addToCart` | wire only |
| src/components/patient/PatientTopbar.tsx | 46 | `topbar.eVuzeHealthcare` | wire only |
| src/components/patient/PatientTopbar.tsx | 96 | `common.logout` | wire only |
| src/app/staff/change-password/page.tsx | 70/71/72 | `staff.tempPassword/newPassword/confirmPassword` | wire only |
| src/app/staff/change-password/page.tsx | 104 | `common.saving` | wire only |
| src/app/staff/orders/page.tsx | 144 | `common.all` | wire only |
| src/app/staff/orders/page.tsx | 179 | `cashier.item/items` | wire only |
| src/app/staff/orders/page.tsx | 224 | `orders2.patientContact` | wire only |
| src/app/staff/dashboard/page.tsx | 240/286 | `branch.clockIn/clockOut` | wire only |
| src/app/staff/profile/page.tsx | 95–100 | `form.email/phone/nationalId/gender/dateOfBirth` | wire only |
| src/app/staff/profile/page.tsx | 154 | `branch.changePassword` | wire only |
| src/components/staff/CashierOrdersView.tsx | 151 | `cashier.item/items` | wire only |
| src/components/branch/BranchSidebar.tsx | 49 | `branch.portal` | wire only |
| src/components/branch/BranchTopbar.tsx | 35 | `topbar.branchManager` | wire only |
| src/components/pharmacy/PharmacySidebar.tsx | 44 | `pharmacy.portal` | wire only |
| src/components/pharmacy/PharmacySidebar.tsx | 86 | `common.getSupport` | wire only |
| src/components/pharmacy/PharmacySidebar.tsx | 90 | `common.logout` | wire only |

**Approximate count:** ~50 wiring-only fixes across the audit. These are the safest commits to ship first.

---

## 6. Caveats & Limitations

1. **Static analysis cannot prove a runtime-clean state.** Phase D requires a manual `npm run dev` smoke check in FR and RW.
2. **Line-number accuracy varies by section** (see Confidence column in Section 1). Phase C wiring will read each file fresh anyway, so MEDIUM-confidence line numbers will be re-validated naturally.
3. **Some "JSX text" findings are interpolated** (e.g. `{records.length} records total`). Phase B will use i18next interpolation: `t('key', { count: records.length })`.
4. **Status enums** (`PENDING`, `ACCEPTED`, etc.) shown raw in some places — these need a label-mapping function that uses `t()` rather than direct rendering of API values.
5. **Brand strings** (Evuze, E-Vuze, Flutterwave, RAMA, MMI, MTN, Airtel) are intentionally not flagged — they should remain identical across languages.
6. **Out-of-scope files** (`hooks/useGeolocation.ts`, `components/map/MapView.tsx`, `super-admin/map/page.tsx`) discovered during the audit. Listed in section 2.7 — please confirm whether they should be included in Phase B.
7. **`prompt()` and `alert()` calls** are browser-native and can't be styled — recommend replacing with custom modals (out of scope for this audit, but flagged where found).
8. **`auth2`, `cart2`, `orders2`, `checkout2`, `notifications2`, `profile2` namespaces** suggest prior incomplete wiring efforts. Phase B should consider consolidating.
9. **Translation files structural drift** between `en.ts` / `fr.ts` / `rw.ts` was not yet checked key-by-key. Will be caught during Phase B (any key added to en.ts that's missing in fr.ts/rw.ts will be detected).

---

## 7. Recommended Phase B / C Ordering

1. **Phase B (single commit):** Add ~150–200 missing keys to `en.ts`, then mirror to `fr.ts` (with `[FR TODO]` placeholders) and `rw.ts` (with proposed translations + `[REVIEW RW]` flags). Populate Sections 3 and 4 of this report as keys are added.
2. **Phase C1 — Patient portal:** Most user impact, well-verified findings. ~120 changes.
3. **Phase C2 — Pharmacist portal:** ~100 changes.
4. **Phase C3 — Cashier portal:** Small (~5 changes).
5. **Phase C4 — Branch Manager:** ~110 changes (verify line numbers as you go).
6. **Phase C5 — Pharmacy Owner:** ~120 changes.
7. **Phase C6 — Super Admin:** ~75 changes (after scanning `/super-admin/map/page.tsx`).
8. **Phase C7 — Auth + landing:** ~95 changes.
9. **Phase D — verification:** type-check + user runtime spot-check.

---

## 8. Questions for the User

1. **Scope:** confirm `hooks/useGeolocation.ts`, `components/map/MapView.tsx`, and `super-admin/map/page.tsx` are in scope for Phase B/C.
2. **Namespace consolidation:** OK to merge `auth2 → auth`, `cart2 → cart`, `orders2 → orders`, etc., during Phase B? Or leave them separate to avoid touching working keys?
3. **Status enum labels:** OK to introduce a single `orderStatus.*` namespace (`pending`, `accepted`, `preparing`, etc.) and use it everywhere instead of duplicating in `pharmacyOwner.*`, `staff.*`, `patient.*`?
4. **Phase C order:** does the order in Section 7 work, or do you want a different portal first?
