# 📍 LocaLink — Real-Time Live Location Platform

<div align="center">

**A production-ready family & friends real-time GPS tracking platform — inspired by Life360.**

Built with Next.js 16, Express 5, Socket.IO, Prisma, PostgreSQL, and MapLibre GL JS.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io/)

</div>

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🗺️ **Live Map** | Real-time interactive map (MapLibre GL + OpenStreetMap) with custom friend/group markers |
| 📡 **Real-Time Tracking** | Socket.IO-powered 15-second GPS location sync with sub-20ms latency |
| 👥 **Friends System** | Send, accept, reject, and cancel friend requests with search |
| 🏠 **Groups / Circles** | Create named circles, invite members, view group map, leave/delete |
| 🔔 **Smart Notifications** | Real-time push via Socket.IO + persisted DB notifications with read/unread state |
| 🛡️ **Geofence Zones** | Home, School, Work safe zones with arrival/departure alerts |
| 📜 **Location History** | 30-day timeline with date range filtering and trip replay |
| 📌 **Saved Places** | Home, Work, School, Gym — quick-access custom location pins |
| 👻 **Ghost Mode** | Instantly pause location sharing with a single toggle |
| 🌗 **Dark / Light Mode** | System-aware theme with manual override and smooth transitions |
| 🔐 **Full Auth** | JWT + HTTP-only cookies, refresh tokens, Google OAuth, Facebook OAuth |
| 📧 **Email System** | Handlebars email templates via Nodemailer (password reset, welcome) |
| 📊 **Dashboard Analytics** | KPI cards (active friends, groups, places), battery & speed telemetry |
| 📱 **Fully Responsive** | Premium mobile-first UI with glassmorphism, animations, and micro-interactions |

---

## 🛠️ Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.9 | App Router, SSR, middleware |
| **React** | 19.x | UI rendering |
| **TypeScript** | 5.x | Strict typing |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui** | 4.x | Accessible component primitives |
| **Framer Motion** | 12.x | Page transitions & micro-animations |
| **MapLibre GL JS** | 6.x | Interactive open-source map |
| **Socket.IO Client** | 4.x | Real-time event streaming |
| **TanStack Query** | v5 | Server state, caching, refetching |
| **Redux Toolkit** | 2.x | Auth & theme global state |
| **Zustand** | 5.x | Location & notification stores |
| **React Hook Form** | 7.x | Form state management |
| **Zod** | 4.x | Schema validation |
| **Axios** | 1.x | HTTP client with interceptors |
| **Recharts** | 3.x | Analytics dashboard charts |
| **Sonner** | 2.x | Toast notifications |
| **Lucide React** | 1.x | Icon system |

### Backend
| Library | Version | Purpose |
|---|---|---|
| **Express.js** | v5 | API server wrapping Next.js |
| **Socket.IO** | 4.x | Real-time bidirectional events |
| **Prisma ORM** | v6 | Type-safe PostgreSQL ORM |
| **PostgreSQL** | — | Relational database |
| **JWT + jose** | — | Access & refresh token auth |
| **bcrypt** | 6.x | Password hashing (12 rounds) |
| **Nodemailer** | 9.x | Transactional emails |
| **Handlebars** | 4.x | Email HTML templates |
| **Multer** | 2.x | File/avatar uploads |
| **Helmet** | 8.x | Security headers |
| **CORS** | 2.x | Cross-origin restrictions |
| **express-rate-limit** | 8.x | Rate limiting |
| **express-validator** | 7.x | Request input validation |
| **Morgan** | 1.x | HTTP request logging |
| **Twilio** | 6.x | SMS notifications |
| **swagger-ui-express** | 5.x | Auto API documentation at `/api-docs` |
| **cross-env** | 10.x | Cross-platform env vars |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/samimcodes/live-location-platform.git
cd live-location-platform
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is required due to React 19 peer dependency constraints.

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your values — see the [Environment Variables](#-environment-variables) section below.

### 3. Database Setup

```bash
# Run migrations and create database tables
npm run db:migrate

# Generate Prisma Client
npm run db:generate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

API docs available at `http://localhost:3000/api-docs`

---

## ⚙️ Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL / Neon)
DATABASE_URL="postgresql://user:password@host:5432/localink?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP / Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@localink.app
FROM_NAME=LocaLink

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# Map (MapLibre GL — no API key needed, uses OpenStreetMap)
NEXT_PUBLIC_MAP_DEFAULT_LNG=90.4125
NEXT_PUBLIC_MAP_DEFAULT_LAT=23.8103
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=11

# Twilio (Optional — SMS alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_DIR=public/uploads
```

---

## 📁 Project Structure

```
localink/
├── prisma/
│   └── schema.prisma           # 9 models (see Database Schema)
│
├── server/                     # Express 5 backend
│   ├── controllers/            # Route request handlers
│   ├── services/               # Business logic layer
│   ├── routes/                 # API route definitions
│   ├── middlewares/            # JWT auth, file upload, error handler
│   ├── socket/                 # Socket.IO event handlers
│   ├── templates/emails/       # Handlebars HTML email templates
│   ├── swagger/                # OpenAPI spec (auto-generated docs)
│   └── utils/                  # catchAsync, sendResponse, helpers
│
└── src/                        # Next.js frontend
    ├── app/
    │   ├── page.tsx            # Landing home page
    │   ├── login/              # Sign In page
    │   ├── register/           # Sign Up page
    │   ├── forgot-password/    # Password reset request
    │   ├── reset-password/     # Password reset form
    │   └── dashboard/          # Protected dashboard (JWT auth required)
    │       ├── page.tsx        # Dashboard home (KPI, activity feed)
    │       ├── map/            # Live real-time location map
    │       ├── friends/        # Friend list + friend requests
    │       ├── groups/         # Group circles + group detail page
    │       ├── history/        # Location history with date filters
    │       ├── notifications/  # Notification center
    │       ├── saved-places/   # Saved locations manager
    │       └── settings/       # Profile, password, theme, sharing
    │
    ├── components/
    │   ├── auth/               # SignIn, SignUp, ForgotPassword, ResetPassword
    │   ├── dashboard/          # Sidebar, Navbar, KpiCard, ActivityFeed
    │   ├── landing/            # Full landing page sections:
    │   │   ├── LandingNavbar.tsx         # Sticky glassmorphism nav + theme toggle
    │   │   ├── HeroSection.tsx           # Interactive GPS dashboard mockup
    │   │   ├── FeaturesSection.tsx       # Feature grid
    │   │   ├── LocationMapSection.tsx    # Live map demo with tabs
    │   │   ├── FriendsRealtimeSection.tsx# Friends tracking list preview
    │   │   ├── HowItWorksSection.tsx     # 3-step onboarding flow
    │   │   ├── FAQSection.tsx            # Accordion FAQ
    │   │   ├── CTASection.tsx            # Call-to-action with social proof
    │   │   └── LandingFooter.tsx         # Site footer with links
    │   ├── map/                # LiveMap Mapbox/MapLibre component
    │   ├── SocketProvider.tsx  # Socket.IO context + connection lifecycle
    │   ├── ThemeProvider.tsx   # next-themes wrapper with hydration-safe sync
    │   └── ui/                 # shadcn/ui: Button, Card, Input, Badge,
    │                           #   Dialog, Skeleton, Select, Separator...
    │
    ├── hooks/
    │   ├── useAuth.ts          # Login, register, logout, OAuth
    │   ├── useFriends.ts       # Friend CRUD + requests
    │   ├── useGroups.ts        # Group CRUD + members
    │   ├── useNotifications.ts # Notification fetching + mark-read
    │   ├── useLocationSharing.ts # GPS watchPosition + Socket emit
    │   └── useSocket.ts        # Socket.IO connection hook
    │
    ├── store/
    │   ├── slices/
    │   │   ├── authSlice.ts    # Redux: user session state
    │   │   └── appSlice.ts     # Redux: theme preference
    │   ├── useLocationStore.ts # Zustand: friends' live locations
    │   └── useNotificationStore.ts # Zustand: unread count badge
    │
    ├── lib/
    │   ├── axios.ts            # Axios instance with interceptors + token refresh
    │   ├── socket.ts           # Socket.IO singleton client
    │   ├── utils.ts            # cn(), formatters, helpers
    │   ├── toast.ts            # Sonner toast helpers
    │   └── dateUtils.ts        # Date formatting utilities
    │
    └── middleware.ts           # Next.js route protection (JWT cookie check)
```

---

## 🌐 API Reference

All routes prefixed with `/api/v1/` — Full interactive docs at `/api-docs`.

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Sign in, sets HTTP-only cookies |
| POST | `/logout` | ✅ | Sign out, clears cookies |
| GET | `/me` | ✅ | Get authenticated user profile |
| POST | `/forgot-password` | — | Send password reset email |
| POST | `/reset-password` | — | Reset password with token |
| POST | `/refresh-token` | — | Refresh access token via cookie |
| PATCH | `/update-password` | ✅ | Change current password |
| POST | `/google` | — | Google OAuth sign-in |
| POST | `/facebook` | — | Facebook OAuth sign-in |

### Friends — `/api/v1/friends`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get confirmed friend list |
| GET | `/search?q=` | Search users by name or email |
| POST | `/requests` | Send a friend request |
| GET | `/requests/pending` | Get received pending requests |
| GET | `/requests/sent` | Get sent requests |
| PATCH | `/requests/:id` | Accept or reject a request |
| DELETE | `/requests/:id` | Cancel a sent request |
| DELETE | `/:friendId` | Remove a friend |

### Location — `/api/v1/location`

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/update` | Update my current location |
| GET | `/me` | Get my current location |
| GET | `/friends` | Get all friends' live locations |
| GET | `/history` | Get location history (with date filter) |
| DELETE | `/history` | Clear all location history |
| PATCH | `/sharing` | Toggle location sharing on/off |

### Groups — `/api/v1/groups`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new group circle |
| GET | `/` | Get all my groups |
| GET | `/:id` | Get group detail + members |
| PATCH | `/:id` | Update group name/avatar |
| DELETE | `/:id` | Delete group (admin only) |
| POST | `/:id/members` | Add member to group |
| DELETE | `/:id/members/:userId` | Remove a member |
| POST | `/:id/leave` | Leave a group |

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all notifications (paginated) |
| GET | `/unread-count` | Get unread notification count |
| PATCH | `/read-all` | Mark all as read |
| PATCH | `/:id/read` | Mark single notification as read |
| DELETE | `/:id` | Delete a notification |

### Saved Places — `/api/v1/saved-places`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a saved place |
| GET | `/` | Get all my saved places |
| PATCH | `/:id` | Update a saved place |
| DELETE | `/:id` | Delete a saved place |

### User — `/api/v1/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/profile` | Update name, bio, phone |
| POST | `/avatar` | Upload profile avatar |

---

## 🔌 Socket.IO Events

**Authentication:** Pass JWT in `socket.handshake.auth.token`

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `location:update` | `{ latitude, longitude, accuracy?, speed?, heading? }` | Broadcast GPS update |
| `join` | `roomId: string` | Join a group/friend room |
| `leave` | `roomId: string` | Leave a room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `location:receive` | `{ userId, latitude, longitude, speed?, heading?, updatedAt }` | Friend location update |
| `friend:online` | `{ userId }` | Friend came online |
| `friend:offline` | `{ userId }` | Friend went offline |
| `notification` | `{ type, message, data }` | Real-time notification push |

---

## 🗄️ Database Schema

**9 Prisma models:**

```
User ──< FriendRequest (sender → receiver)
User ──< Friendship    (user1 ↔ user2)
User ──  Location      (1:1 current GPS)
User ──< LocationHistory (1:many history)
User ──< Notification
User ──< GroupMember >── Group
User ──< SavedPlace
Group ──< GroupMember
```

Key fields: `User.sharingLocation` (ghost mode toggle), `User.isOnline` (presence), `LocationHistory.accuracy/speed/heading` (telemetry)

---

## 🔐 Security

- JWT stored in **HTTP-only cookies** (not `localStorage`)
- **Rate limiting**: 200 req/15min (general) · 20 req/15min (auth)
- **Helmet** — comprehensive security HTTP headers
- **CORS** — restricted to `FRONTEND_URL`
- **bcrypt** — 12 salt rounds for password hashing
- Password reset tokens **hashed (SHA-256)** before DB storage
- **Input validation** — Zod (frontend) + express-validator (backend)
- Route protection via **Next.js middleware** (`src/middleware.ts`)
- **Refresh token rotation** on every access token renewal

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server (nodemon + Next.js hot reload)

# Production
npm run build            # Build Next.js + compile server TypeScript
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript strict check (frontend + backend)

# Database
npm run db:generate      # Regenerate Prisma Client
npm run db:migrate       # Run pending migrations (dev)
npm run db:migrate:deploy # Run migrations (production)
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:reset         # Reset database (⚠️ destructive)
```

---

## 🚢 Deployment

### Frontend + Backend → Railway (recommended)

```bash
# Build command:
npm run build

# Start command:
npm start

# Set all .env variables in Railway Dashboard
```

### Database → Neon (PostgreSQL)

```bash
# 1. Create project at neon.tech
# 2. Copy connection string to DATABASE_URL
# 3. Run migrations in production:
npm run db:migrate:deploy
```

### Alternative: Vercel (Frontend Only)

```bash
# Set in Vercel Dashboard:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_FACEBOOK_APP_ID=...
NEXT_PUBLIC_MAP_DEFAULT_LNG=90.4125
NEXT_PUBLIC_MAP_DEFAULT_LAT=23.8103
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=11
```

> **Note:** For Vercel, the Express backend needs to be deployed separately on Railway or Render.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ for families and friends who want to stay connected.<br/>
  <strong>LocaLink</strong> — Always close to the people you love.
</div>
