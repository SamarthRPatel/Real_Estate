# DreamHome

A full-stack real estate marketplace where users can buy, sell, or rent property — with admin-moderated listings and real-time-feeling request/inquiry workflows.

## Project Overview

DreamHome helps users:
- Browse buy/rent listings with search, filters, and pagination.
- List a property for sale or rent (goes to an admin approval queue before it's public).
- Send an inquiry or a buy/rent request directly to a seller.
- Accept/decline incoming requests as a seller, favorite listings as a buyer.
- Moderate listings, manage users, and review platform reports as an admin.
- Frontend URL: https://dreamhome-frontend-yv53.onrender.com/
- Backend URL: https://real-estate-api-yv53.onrender.com

## Tech Stack

### Frontend
- Plain HTML/CSS/JS, multi-page (no framework/bundler)
- `fetch`-based API client (`js/api.js`) with a shared `apiFetch()` wrapper
- Cookie-based session auth, route guarding via `auth-guard.js`
- Self-hosted fonts: Alex Brush, Poppins, Manrope (see `fonts/`)
- Shared design tokens in `css/design-system.css`

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (httpOnly session cookie)
- bcryptjs password hashing
- Nodemailer (password reset + inquiry notification emails)
- cors, cookie-parser, dotenv
- Route-based structure (no separate MVC layer — routes talk to Mongoose models directly)

## Folder Structure

```text
real estate/
  backend/
    routes/
      auth.js
      properties.js
      favorites.js
      inquiries.js
      requests.js
      subscribers.js
      admin.js
      contact.js
    models/
      User.js
      Property.js
      Favorite.js
      Inquiry.js
      PropertyRequest.js
      Subscriber.js
      ContactMessage.js
    middleware/
      requireAuth.js
      requireRole.js
    utils/
      mailer.js
      emailTemplates.js
    db.js
    server.js
    package.json
  frontend/
    *.html                # Buy, rent, sell, dashboard, admin, auth pages, etc.
    *.js                   # One script per page (buy.js, sell.js, admin.js, ...)
    css/                    # design-system.css (shared tokens), auth.css
    js/
      api.js                 # apiFetch() wrapper + API_BASE config
      ui.js                  # Shared UI helpers
    fonts/                   # Self-hosted woff2 (Alex Brush, Poppins, Manrope)
  render.yaml
  DESIGN.md
  README.md
```

## Core Features

- JWT auth: register, login, logout, current-user profile, forgot/reset password (email link).
- Secure password hashing with bcryptjs; reset tokens stored as SHA-256 hashes, not raw.
- User roles (`user`, `admin`) — every account can buy, sell, and rent; `admin` is granted manually.
- Property CRUD with owner/admin-only edit, status-change, and delete enforcement.
- Admin approval workflow: new listings start `pending`, admin approves (`available`) or rejects.
- Buy/rent request flow: buyer requests a property, seller accepts (marks it `sold`/`rented` and auto-declines other pending requests) or declines.
- Inquiry form per listing, with an email notification sent to the seller (best-effort — a failed send doesn't block the inquiry from saving).
- Favorites (save/unsave listings), enforced unique per user+property.
- Newsletter subscribers and a public contact form.
- Admin dashboard: users, listings, contact messages, role management, and a `/reports` endpoint powering signup/listing/status charts.
- Responsive pages:
  - Home / Landing (`index.html`)
  - Buy / Rent / Sell
  - Property Details / Contact Seller
  - Sold & Rented archive
  - Login / Register / Forgot & Reset Password
  - Dashboard (favorites, my listings, requests, inquiries)
  - Admin panel (`Admi.html`) / Reports
  - Mortgage Calculator / Contact page

## Database Models

### User
- `firstName`, `lastName`
- `email` (unique)
- `phone`
- `passwordHash`
- `role` (`user` | `admin`)
- `resetTokenHash`, `resetTokenExpires` (select: false)
- `createdAt`

### Property
- `title`, `location`, `description`
- `price`, `propertyType` (`apartment` | `house` | `condo`), `listingType` (`sale` | `rent`)
- `imageUrls` (up to 8, stored as data URIs)
- `bedrooms`, `bathrooms`, `area`, `yearBuilt`, `garage`, `amenities`
- `status` (`pending` | `available` | `sold` | `rented` | `rejected`)
- `sellerId` (ref: User)
- `createdAt`

### Favorite
- `userId` (ref: User), `propertyId` (ref: Property) — unique compound index
- `createdAt`

### Inquiry
- `propertyId` (ref: Property)
- `name`, `email`, `phone`, `message`
- `createdAt`

### PropertyRequest
- `propertyId` (ref: Property), `buyerId` (ref: User), `sellerId` (ref: User)
- `requestType` (`buy` | `rent`)
- `status` (`pending` | `accepted` | `declined` | `cancelled`)
- `createdAt`

### Subscriber
- `email` (unique)
- `createdAt`

### ContactMessage
- `name`, `email`, `message`
- `createdAt`

## API Documentation

Base URL (local): `http://localhost:3000/api`

### Auth (`/api/auth`)
- `POST /register`
- `POST /login` — body may include `remember` (boolean)
- `POST /logout`
- `GET /me` — auth required
- `PATCH /me` — auth required
- `POST /forgot-password`
- `POST /reset-password`

### Properties (`/api/properties`)
- `GET /` — public listing search
- `GET /mine` — auth required
- `GET /pending` — admin only
- `GET /:id`
- `GET /:id/image/:index` — serves a stored data-URI image as a real image response
- `POST /` — auth required (creates as `pending`)
- `POST /:id/request` — auth required (buy/rent request)
- `PATCH /:id/approve` — admin only
- `PATCH /:id/reject` — admin only
- `PATCH /:id/status` — owner or admin
- `DELETE /:id` — owner or admin

Query params for `GET /api/properties`:
- `listingType` (`sale` | `rent`)
- `propertyType` (`apartment` | `house` | `condo`)
- `search` (title match)
- `minBedrooms`, `minBathrooms`
- `minPrice`, `maxPrice`
- `status` (`sold_or_rented` for the public archive page; otherwise defaults to `available`)
- `sort` (`newest` | `price_asc` | `price_desc`)
- `page`, `limit` (max 48)

### Favorites (`/api/favorites`) — all auth required
- `GET /`
- `POST /` — body: `{ propertyId }`
- `DELETE /:propertyId`

### Inquiries (`/api/inquiries`)
- `POST /` — public, triggers a best-effort email to the seller
- `GET /mine` — auth required (inquiries on your own listings)

### Requests (`/api/requests`) — all auth required
- `GET /mine-incoming` — requests received as a seller
- `GET /mine-outgoing` — requests sent as a buyer
- `PATCH /:id/accept`
- `PATCH /:id/decline`

### Contact (`/api/contact`)
- `POST /` — public contact form

### Subscribers (`/api/subscribers`)
- `POST /` — public newsletter signup

### Admin (`/api/admin`) — admin only
- `GET /properties`
- `GET /contact-messages`
- `GET /users`
- `PATCH /users/:id/role`
- `DELETE /users/:id`
- `GET /reports` — totals, status/listing/type breakdowns, signups-over-time

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dreamhome
JWT_SECRET=replace_with_a_strong_secret
APP_URL=http://localhost:3000
NODE_ENV=development

EMAIL_USER=your_email@example.com
EMAIL_APP_PASSWORD=your_email_app_password
```

### Frontend

Edit `frontend/js/api.js`:
- `API_BASE` — set to `""` for local dev / single-service deploys (uses relative `/api/...` calls). In production, since the frontend and backend deploy as two separate Render services with no shared origin, it's hardcoded to the deployed backend URL instead.

## Local Development Setup

### 1. Backend

```bash
cd backend
npm install
# create backend/.env with the variables above
npm run dev
```

Backend runs at `http://localhost:3000` and also serves `frontend/` as static files.

### 2. Frontend

No build step — served by the backend automatically. To work on it standalone, open the HTML files directly or serve `frontend/` with any static server, and set `API_BASE = ""` in `frontend/js/api.js` first (or point it at wherever the backend is running).

## Render Deployment Guide

Two Render services (see `render.yaml`):

1. **`real-estate-api`** (backend)
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `JWT_SECRET` (auto-generated), `MONGODB_URI`, `APP_URL` (set to the deployed frontend URL), `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `NODE_ENV=production`

2. **`dreamhome-frontend`** (static site)
   - Root Directory: `frontend`
   - Build Command: _(none)_
   - Publish Directory: `.`
   - Requires `API_BASE` in `frontend/js/api.js` to point at the deployed backend URL before deploying.

## Security and Validation

- Password hashing with bcryptjs; password-reset tokens stored as SHA-256 hashes with expiry, never the raw token.
- httpOnly session cookie carrying a signed JWT; `SameSite=None; Secure` in production (cross-origin frontend/backend), `SameSite=Lax` locally.
- Route-level auth (`requireAuth`) and role checks (`requireRole("admin")`) on protected/admin endpoints.
- Ownership checks on property update/delete/status-change (owner or admin only).
- Centralized Express error middleware returning JSON error responses.
- Forgot-password endpoint doesn't reveal whether an email exists in the system.

## Design System

See [DESIGN.md](./DESIGN.md) for typography, color, spacing, and aesthetic direction — always consult it before making visual/UI changes.
