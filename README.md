# RentEasy Kenya 🏠

Kenya's premier rental platform — find verified homes across all counties with M-Pesa escrow protection.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start both frontend and mock API
npm run start

# 3. Open your browser
# Frontend: http://localhost:5173
# API:      Configured via VITE_API_URL (Default: http://localhost:3001)
```

## 🔐 Demo Credentials

| Role   | Email                  | Password |
|--------|------------------------|----------|
| Tenant | aisha@gmail.com        | pass123  |
| Admin  | james@renteasy.com     | pass123  |

## ✨ Features

### Tenant Features
- **Browse Properties** — Filter by county, type, price, bedrooms with debounced search
- **Map View** — Interactive OpenStreetMap with property markers and popups
- **House Detail** — Image carousel, amenities, reviews
- **Fair Rent Estimator** — Compares similar listings to show if pricing is fair
- **Neighborhood Intelligence** — Matatu routes, hospitals, schools, walkability score
- **My Rentals** — Track active leases with expiry warnings and renewal
- **RentScore™** — Animated credit-score-style rating based on payment history
- **Favorites** — Save and manage favourite properties
- **Payments** — Pay via M-Pesa, Airtel Money, or Bank Transfer with escrow flow
- **Report Issues** — Submit and track maintenance requests

### Admin Features
- **Dashboard** — Revenue charts, booking charts, key stats
- **Properties** — Full CRUD with undo-delete toast (no confirm modal)
- **3-Step Property Form** — Add/edit properties with image preview
- **Bookings** — Approve/reject with RentScore badge, rejection notes
- **Tenants** — View all registered tenants
- **Issues** — Filter by status, mark progress/resolved, add admin notes
- **Payments** — Transaction history with escrow status

## 🎨 Design System

- **Brand Color**: M-Pesa Green (#22c55e)
- **Display Font**: Playfair Display
- **Body Font**: DM Sans
- **Mono Font**: JetBrains Mono (prices, codes)
- **Dark Mode**: Full support via `class` strategy

## 🛠 Tech Stack

| Package | Use |
|---------|-----|
| React 18 + Vite | Frontend framework |
| Tailwind CSS v3 | Styling |
| React Router v6 | Navigation |
| Framer Motion | Animations |
| React Hook Form + Zod | Form validation |
| TanStack Query v5 | Data fetching & caching |
| Axios | HTTP client |
| JSON Server | Mock REST API |
| React Leaflet | Map view |
| Recharts | Admin charts |
| React Hot Toast | Notifications |

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/       # AdminLayout sidebar
│   ├── shared/      # Navbar, PropertyCard, FilterBar, etc.
│   └── tenant/      # MapView
├── context/         # AuthContext, ThemeContext
├── data/            # counties.js (neighborhood data)
├── hooks/           # useApi.js (all React Query hooks)
├── pages/
│   ├── admin/       # Dashboard, Properties, Bookings, Tenants, Issues, Payments
│   └── tenant/      # Browse, HouseDetail, MyRentals, Favorites, Payments, ReportIssue
├── utils/           # formatters.js (formatKES, calculateRentScore, getFairRentRange)
└── App.jsx          # Routes
```

## 📊 Mock Data

`db.json` contains:
- **30 properties** across 12 Kenyan counties
- **6 users** (2 admins, 4 tenants) with Kenyan names
- **4 active rentals** with payment history
- **3 bookings** (pending/approved/rejected)
- **7 payments** with M-Pesa transaction IDs
- **5 testimonials** from Kenyan tenants
- **3 maintenance issues** with admin notes

## 🔌 API Endpoints (JSON Server)

```
GET/POST   /houses
GET/PUT    /houses/:id
DELETE     /houses/:id

GET/POST   /users
GET/POST   /rentals
PATCH      /rentals/:id

GET/POST   /favorites
DELETE     /favorites/:id

GET/POST   /bookings
PATCH      /bookings/:id

GET/POST   /payments
GET/POST   /issues
PATCH      /issues/:id

GET        /reviews
GET        /testimonials
```
