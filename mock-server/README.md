# EasyBuy Mock API Server

A local Express.js mock server that replicates all API endpoints used by the EasyBuy React Native app.

## Setup & Start

```bash
cd mock-server
npm install       # only needed once
npm start         # starts server on http://localhost:3002
# or
npm run dev       # starts with nodemon (auto-restart on file changes)
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login (returns user with token) |
| GET | `/products` | — | List all products |
| POST | `/product` | Admin | Add a product |
| POST | `/update-product?id=` | Admin | Update a product |
| GET | `/delete-product?id=` | Admin | Delete a product |
| GET | `/categories` | — | List all categories |
| POST | `/category` | Admin | Add a category |
| POST | `/update-category?id=` | Admin | Update a category |
| GET | `/delete-category?id=` | Admin | Delete a category |
| GET | `/dashboard` | Admin | Stats (users/orders/products/categories count) |
| GET | `/admin/orders` | Admin | All orders |
| GET | `/admin/users` | Admin | All users |
| GET | `/admin/order-status?orderId=&status=` | Admin | Update order status |
| GET | `/admin/payment-status?orderId=&status=paid` | Admin | Record cash collected for a COD order |
| GET | `/orders` | User | Current user's orders |
| POST | `/checkout` | User | Place an order (COD or demo card — see Payments) |
| GET | `/delete-user?id=` | — | Delete a user account |
| POST | `/reset-password?id=` | — | Update password |
| POST | `/photos/upload` | — | Upload an image |
| GET | `/uploads/:filename` | — | Serve uploaded images (SVG placeholder if not found) |

## Authentication

Pass the token in the `x-auth-token` header for protected routes.

### Pre-seeded test tokens

| Role | Token |
|------|-------|
| Admin | `mock-admin-token-001` |
| User | `mock-user-token-001` |

### Pre-seeded credentials (for `/login`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@easybuy.com` | `admin123` |
| User | `user@easybuy.com` | `user123` |
| User | `jane@easybuy.com` | `jane123` |

## Using with a Physical Device

If you're running the app on a physical device (not a simulator), replace `localhost` with your Mac's local IP address in `constants/Network.js`:

```js
serverip: "http://192.168.1.X:3002",  // replace with your actual local IP
```

Find your local IP with:
```bash
ipconfig getifaddr en0
```

## Mock Data

The server starts with pre-seeded data:
- **4 categories**: Garments, Electronics, Cosmetics, Groceries
- **8 products**: 2 per category
- **3 users**: 1 admin + 2 regular users
- **3 orders**: in various statuses (pending, shipped, delivered)

All data is stored in-memory and resets when the server restarts.

## Payments (demo)

`POST /checkout` accepts these payment fields in addition to the order fields:

| Field | Type | Notes |
|-------|------|-------|
| `payment_type` | `"cod"` \| `"card_demo"` | Optional, default `"cod"`. Anything else → 400 `invalid_payment_method`. |
| `idempotency_key` | string (≤ 100 chars) | Optional, unique per checkout attempt. A repeat for the same user returns the existing order with `duplicate: true`. |
| `payment.token` | string | Required for `card_demo`; one of the demo tokens below. |

### Demo tokens

No real card data is ever sent — the app offers two fixed test cards and sends only their token.

| Token | Card | Outcome |
|-------|------|---------|
| `tok_demo_success` | Visa •••• 4242 | 200, order created with `payment_status: "paid"` |
| `tok_demo_decline` | Visa •••• 0002 | 402 `payment_declined`, **no order created** |

Seed orders have no payment fields on purpose, so the legacy defaults are exercised
(`order003` is delivered → Paid, the others → Pending).

### Logs

Payment events are logged with a `[payment]` prefix, e.g.:

```bash
npm start | grep "\[payment\]"
npm start | grep "\[payment\] checkout_rejected"
npm start | grep "\[payment\] duplicate_checkout"
```

## Payment contract (backend hand-off)

The real Node backend must implement the same contract so the app behaves identically against it.
Until it does, the app keeps the digital option off for any non-mock `EXPO_PUBLIC_API_URL`
(override with `EXPO_PUBLIC_DIGITAL_PAYMENTS=true|false`).

**Order fields (all additive, nullable):**

| Field | Type | Values / default |
|-------|------|------------------|
| `payment_type` | string | existing; `"cod"` \| `"card_demo"`, default `"cod"` |
| `payment_status` | string | `"pending"` \| `"paid"` \| `"failed"` (`failed` is reserved), default `"pending"` |
| `paid_at` | ISO-8601 string \| null | set by the server when paid |
| `payment_reference` | string \| null | `DEMO-XXXXXXXX` for demo card payments |
| `card_brand` | string \| null | from the server's token table, never from client input |
| `card_last4` | 4-char string \| null | from the server's token table, never from client input |

**Rules:**

- **Server-authoritative status.** `payment_status`, `paid_at`, `payment_reference`, `card_brand` and
  `card_last4` are set only by the server. Ignore them if a client sends them.
- **Declines create nothing.** A declined payment responds
  `402 { success:false, code:"payment_declined", message:"Your demo card was declined. No order was placed." }`
  and stores no order. Any 4xx from `/checkout` must never create an order.
- **Validation errors.** Unknown `payment_type` → `400 invalid_payment_method` ("Unsupported payment method");
  `card_demo` without a known token → `400 invalid_payment_token` ("Invalid demo payment token").
- **Idempotency.** At most one order per `(user, idempotency_key)`; repeats return
  `200 { success:true, message:"Order already placed", duplicate:true, data: order }`. Persist this with a
  unique index on `(user, idempotency_key)` using a sparse/partial filter so orders without a key are not indexed.
  Requests without a key behave as before (no dedupe).
- **Legacy defaults on read.** Every order returned by `/orders`, `/admin/orders`, `/admin/order-status` and
  `/admin/payment-status` carries all six fields. For records without them: `payment_type` → `"cod"`;
  `payment_status` → `"paid"` if `status === "delivered"`, else `"pending"`; the rest → `null`.
  No backfill is required.
- **`GET /admin/payment-status?orderId=&status=`** (admin only):
  - 400 `{ message:"orderId and status are required" }` when either is missing;
  - 400 `invalid_payment_status` ("Only 'paid' can be set") for any status other than `paid`;
  - 404 "Order not found"; 403 "Admin access required" for non-admins;
  - 409 `not_cash_on_delivery` ("Only cash-on-delivery orders can be marked as collected") for non-COD orders;
  - 200 `{ success:true, message:"Payment status updated to paid", data: order }` otherwise, setting
    `payment_status:"paid"` and `paid_at`. Idempotent: an already-paid COD order is returned unchanged.
  - Audit: also persist `paid_by` (the admin's user id) on the order.
- **Delivery status is independent.** `/admin/order-status` must not change `payment_status`.
- **No raw card data.** A real provider integration must use provider-hosted fields or tokens and must never
  send raw card numbers, CVV or expiry to this backend. Never log the checkout `payment` object.
