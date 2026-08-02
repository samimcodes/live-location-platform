# 📍 LocaLink — Live Location Sharing Platform

> A production-ready family & friends real-time location sharing app inspired by Life360.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Live Map** | Real-time Mapbox GL map with custom friend markers |
| 👥 **Friends** | Send/accept/reject friend requests, search users |
| 🏠 **Groups** | Create circles, manage members, group map view |
| 🔔 **Notifications** | Real-time push via Socket.IO + persisted DB notifications |
| 📍 **Location History** | 30-day timeline with date filtering |
| 🔖 **Saved Places** | Home, Work, School, Gym — quick-access pins |
| ⚙️ **Settings** | Profile update, password change, theme, sharing toggle |
| 🌗 **Dark Mode** | System / Light / Dark themes |
| 🔐 **Auth** | JWT + HTTP-only cookies, refresh tokens, social login |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript** — strict, no `any`
- **Tailwind CSS v4** + shadcn/ui components
- **React Hook Form** + **Zod** validation
- **TanStack Query v5** — data fetching & caching
- **Zustand** — location & notification stores
- **Redux Toolkit** — auth & theme state
- **Socket.IO Client** — real-time events
- **Mapbox GL JS** — interactive map
- **Framer Motion** — smooth animations
- **Axios** — HTTP client with interceptors

### Backend
- **Express.js v5** custom server wrapping Next.js
- **Socket.IO** — real-time bidirectional events
- **Prisma ORM v6** + **PostgreSQL**
- **JWT** — access + refresh tokens
- **bcrypt** — password hashing
- **Helmet + CORS + Rate Limiting** — security
- **Nodemailer + Handlebars** — email templates
- **Multer** — file uploads

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd nextjs-base-template
npm install --legacy-peer-deps
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your values — see `.env.example` for all required keys.

### 3. Database Setup

```bash
# Create database and run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma           # 9 models: User, FriendRequest, Friendship,
│                               #   Location, LocationHistory, Notification,
│                               #   Group, GroupMember, SavedPlace
│
├── server/                     # Express backend
│   ├── controllers/            # Request handlers
│   ├── services/               # Business logic
│   ├── routes/                 # Route definitions
│   ├── middlewares/            # Auth, upload
│   ├── socket/                 # Socket.IO handlers
│   ├── templates/emails/       # Handlebars email templates
│   └── utils/                  # catchAsync, sendResponse
│
└── src/                        # Next.js frontend
    ├── app/
    │   ├── (public)/           # Landing, Login, Register, Forgot/Reset Password
    │   └── dashboard/          # Protected dashboard pages
    │       ├── page.tsx        # Dashboard home
    │       ├── map/            # Live map
    │       ├── friends/        # Friends list + requests
    │       ├── groups/         # Groups + group detail
    │       ├── history/        # Location history
    │       ├── notifications/  # Notifications
    │       ├── saved-places/   # Saved places
    │       └── settings/       # Profile & settings
    ├── components/
    │   ├── auth/               # SignIn, SignUp, ForgotPassword, ResetPassword
    │   ├── dashboard/          # Sidebar, Navbar
    │   ├── landing/            # LandingNavbar, Hero, Features, HowItWorks, CTA, Footer
    │   ├── map/                # LiveMap component
    │   └── ui/                 # Button, Card, Input, Label, Dialog, Badge, Skeleton...
    ├── hooks/                  # useAuth, useFriends, useGroups, useNotifications,
    │                           #   useLocationSharing
    ├── store/
    │   ├── slices/             # authSlice, appSlice
    │   ├── useLocationStore.ts # Zustand location state
    │   └── useNotificationStore.ts
    └── lib/                    # axios instance, socket client, utils, toast, dateUtils
```

---

## 🌐 API Reference

All routes are prefixed with `/api/v1/`

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Sign in, sets cookies |
| POST | `/logout` | ✅ | Sign out |
| GET | `/me` | ✅ | Get current user |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password` | — | Reset with token |
| POST | `/refresh-token` | — | Refresh access token |
| PATCH | `/update-password` | ✅ | Change password |

### Friends — `/api/v1/friends`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get friend list |
| GET | `/search?q=` | Search users |
| POST | `/requests` | Send friend request |
| GET | `/requests/pending` | Pending received |
| GET | `/requests/sent` | Sent requests |
| PATCH | `/requests/:id` | Accept/Reject |
| DELETE | `/requests/:id` | Cancel sent |
| DELETE | `/:friendId` | Remove friend |

### Location — `/api/v1/location`

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/update` | Update my location |
| GET | `/me` | Get my location |
| GET | `/friends` | All friends' locations |
| GET | `/history` | Location history |
| DELETE | `/history` | Clear history |
| PATCH | `/sharing` | Toggle sharing |

### Groups — `/api/v1/groups`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create group |
| GET | `/` | My groups |
| GET | `/:id` | Group details |
| PATCH | `/:id` | Update group |
| DELETE | `/:id` | Delete group |
| POST | `/:id/members` | Add member |
| DELETE | `/:id/members/:userId` | Remove member |
| POST | `/:id/leave` | Leave group |

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| GET | `/unread-count` | Unread count |
| PATCH | `/read-all` | Mark all read |
| PATCH | `/:id/read` | Mark one read |
| DELETE | `/:id` | Delete |

### Saved Places — `/api/v1/saved-places`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create place |
| GET | `/` | My places |
| PATCH | `/:id` | Update |
| DELETE | `/:id` | Delete |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `location:update` | `{ latitude, longitude, accuracy?, speed?, ... }` | Send location |
| `join` | `roomId: string` | Join a room |
| `leave` | `roomId: string` | Leave a room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `location:receive` | `{ userId, latitude, longitude, ... }` | Friend location update |
| `friend:online` | `{ userId }` | Friend came online |
| `friend:offline` | `{ userId }` | Friend went offline |
| `notification` | `{ type, message, data }` | Real-time notification |

**Authentication:** Pass JWT in `socket.handshake.auth.token`

---

## 🔐 Security

- JWT stored in **HTTP-only cookies** (not localStorage for tokens)
- **Rate limiting**: 200 req/15min general, 20 req/15min auth
- **Helmet** — security headers
- **CORS** — restricted to `FRONTEND_URL`
- **bcrypt** rounds: 12
- Password reset tokens are **hashed (SHA-256)** before storage
- **Input validation** via Zod (frontend) and express-validator (backend)
- Route protection via **Next.js middleware** (`src/middleware.ts`)

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# Set environment variables in Vercel Dashboard:
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
NEXT_PUBLIC_FACEBOOK_APP_ID=xxx
```

### Backend → Railway

```bash
# Build command:
npm run build

# Start command:
npm start

# Set all .env variables in Railway Dashboard
```

### Database → Neon

```bash
# Copy the connection string from Neon dashboard
# Set DATABASE_URL in Railway environment
# Run migrations:
npx prisma migrate deploy
```

---

## 🗄️ Database Schema

```
User ──< FriendRequest (sender/receiver)
User ──< Friendship (user1/user2)
User ──< Location (1:1 current)
User ──< LocationHistory (1:many)
User ──< Notification
User ──< GroupMember >── Group
User ──< SavedPlace
Group ──< GroupMember
```

---

## 📝 Scripts

```bash
npm run dev      # Development server (nodemon + Next.js)
npm run build    # Production build (Next.js + TypeScript)
npm start        # Production server
npm run lint     # ESLint
npx prisma studio           # Database GUI
npx prisma migrate dev      # Run migrations
npx prisma generate         # Regenerate client
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by the LocaLink Team
</div>
