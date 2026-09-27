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
| GET | `/orders` | User | Current user's orders |
| POST | `/checkout` | User | Place an order |
| GET | `/delete-user?id=` | — | Delete a user account |
| POST | `/reset-password?id=` | — | Update password |
| POST | `/forgot-password` | — | Request a 6-digit password reset code (neutral response) |
| POST | `/verify-reset-code` | — | Exchange a reset code for a single-use reset token |
| POST | `/set-new-password` | — | Set a new password with a reset token (signs out other sessions) |
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

## Password recovery (dev)

The recovery flow (`/forgot-password` → `/verify-reset-code` → `/set-new-password`) works end to end without a mail server:

- **No email is sent.** The 6-digit code is printed to the server console, e.g.
  `[password-reset] DEV CODE email=user@easybuy.com code=123456 expiresAt=... (no email sent)`.
- **Limits:** a code expires after 15 minutes and allows 5 wrong attempts; one request per email per minute. The reset token returned by `/verify-reset-code` lasts 10 minutes and works once.
- A successful reset rotates the user's token, so the pre-seeded token for that user stops working.
- All reset state is in memory and is lost when the server restarts.

Logging the email and code together is acceptable for local development only.

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