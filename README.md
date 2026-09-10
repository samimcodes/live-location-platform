# 📍 LocaLink — Real-Time Live Location & Family Safety Platform

<div align="center">

<br />

```
  _                     _     _       _   
 | |                   | |   (_)     | |  
 | |     ___   ___ __ _| |    _ _ __ | | __
 | |    / _ \ / __/ _` | |   | | '_ \| |/ /
 | |___| (_) | (_| (_| | |___| | | | |   < 
 |______\___/ \___\__,_|______|_|_| |_|_|\_\
```

### **Ultra-Low Latency Family & Friends GPS Tracking — Private, Modern & Open-Source**
*Inspired by Life360 • Built with Next.js 15, React 19, Express 5, Socket.IO & MapLibre GL*

<br />

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-localinks.onrender.com-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://localinks.onrender.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-6.1-396B94?style=for-the-badge&logo=mapbox&logoColor=white)](https://maplibre.org/)

<br />

[🌐 **Live Demo**](https://localinks.onrender.com/) •
[✨ Features](#-key-features) •
[🏛️ Architecture](#%EF%B8%8F-system-architecture) •
[🛠️ Tech Stack](#%EF%B8%8F-tech-stack) •
[🚀 Quick Start](#-quick-start) •
[⚙️ Configuration](#%EF%B8%8F-environment-variables) •
[📜 Scripts](#-scripts--commands) •
[🚢 Deployment](#-deployment)

</div>

---

## 💡 Why LocaLink?

Most commercial location apps lock essential family safety features behind steep monthly subscriptions or harvest personal tracking data. 

**LocaLink** is an open-source, privacy-first alternative offering:
- **Zero Third-Party Map Costs**: Uses MapLibre GL + OpenStreetMap vector tiles instead of expensive Google Maps or Mapbox APIs.
- **True Real-Time**: Sub-20ms bidirectional WebSocket sync powered by Socket.IO.
- **Complete Privacy**: 1-click Ghost Mode, private invite codes, and fully self-hostable backend.

---

## ✨ Key Features

<table width="100%">
<tr>
<td width="50%" valign="top">

### 🗺️ Live Tracking & Navigation
- **Smooth 60fps Vector Map** with real-time friend markers & accuracy halos
- **Auto-centering & Fly-To** camera animation controls
- **Worldwide Place Search** with instant coordinate pinpointing
- **Background GPS Sync** with 15-second heartbeat intervals

</td>
<td width="50%" valign="top">

### 🚨 Safety & Emergency SOS
- **1-Click Distress Beacon** with 3-second abort countdown
- **Audible Siren Alarm** synthesized directly via Web Audio API
- **Live Location Broadcast** sent to all circle members instantly
- **Twilio SMS Alerts** with direct emergency coordinates

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🛡️ Geofencing & Safe Zones
- **Automated Perimeter Detection** for Home, School, Work & Gym
- **Arrival & Departure Alerts** calculated via server-side Haversine formula
- **Custom Place Icons & Colors** for quick map visualization
- **Persistent Safe Notifications** with unread indicators

</td>
<td width="50%" valign="top">

### 👥 Circles & Social Control
- **Private Circles** (Family, Close Friends, Travel Groups)
- **Instant 6-Character Invite Codes** for frictionless onboarding
- **Ghost Mode**: 1-tap toggle to immediately pause location sharing
- **Live Online / Offline Presence** indicators for all friends

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📜 History & Route Replay
- **30-Day Location Breadcrumbs** stored in PostgreSQL
- **Interactive Trip Replay** with scrubbable timeline slider
- **Speed & Heading Telemetry** recorded during active travel
- **Date-Range Filtering** to inspect specific daily journeys

</td>
<td width="50%" valign="top">

### ⚡ Developer & User Experience
- **Spotlight Command Palette (`Ctrl+K` / `Cmd+K`)** for instant actions
- **Synthesized Sound FX Engine** (zero external MP3 assets)
- **Dark / Light Theme** with system preference auto-detection
- **Interactive Swagger Docs** built-in at `/api-docs`

</td>
</tr>
</table>

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 15 + React 19)"]
        UI["App Router Pages & shadcn/ui"]
        Map["MapLibre GL JS (OpenStreetMap Tiles)"]
        Audio["Web Audio FX Engine"]
        State["Redux Toolkit (Auth) + Zustand (Live GPS)"]
    end

    subgraph Server["Unified Express 5 & Socket.IO Server"]
        Express["Express REST API (/api/v1/*)"]
        SocketIO["Socket.IO Engine (user:* & group:* rooms)"]
        RateLimit["Rate Limiters (Auth vs General API)"]
        NextHandler["Next.js SSR & Static Asset Pipeline"]
    end

    subgraph DatabaseLayer["Persistence & External APIs"]
        Prisma["Prisma ORM Client v6"]
        PostgreSQL[("PostgreSQL Database (Neon / Supabase / Local)")]
        OAuth["Google & Facebook OAuth"]
        Twilio["Twilio SMS Gateway"]
        SMTP["Nodemailer (SMTP Emails)"]
    end

    UI --> State
    Map --> UI
    UI -->|HTTP / REST API| Express
    UI -->|WebSocket Events| SocketIO
    Express --> NextHandler
    Express --> RateLimit
    Express & SocketIO --> Prisma --> PostgreSQL
    Express --> OAuth & Twilio & SMTP
```

---

## 🛠️ Tech Stack

<div align="center">

| Domain | Technologies |
|---|---|
| **Frontend Core** | `Next.js 15.5` (App Router) • `React 19.2` • `TypeScript 5.x` |
| **Styling & UI** | `Tailwind CSS v4` • `shadcn/ui` • `Framer Motion 12` • `Lucide Icons` |
| **Map & Geospatial** | `MapLibre GL JS 6.1` • `OpenStreetMap Tiles` (100% Free & Open) |
| **State Management** | `Redux Toolkit` (Session/Theme) • `Zustand 5` (GPS Telemetry) • `TanStack Query v5` |
| **Backend Service** | `Express 5.2` • `Socket.IO 4.8` • `Node.js 20+` |
| **Database & ORM** | `PostgreSQL` • `Prisma ORM 6.19` (9 Relational Models) |
| **Authentication** | `JWT (Access + Refresh)` • `HttpOnly Cookies` • `bcrypt` • `Google & Facebook OAuth` |
| **Communications** | `Nodemailer` (Handlebars templates) • `Twilio SMS / OTP` |
| **Developer Tools** | `Swagger UI` (`/api-docs`) • `ESLint 9` • `ts-node` • `nodemon` |

</div>

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **PostgreSQL**: Local or Cloud instance ([Neon](https://neon.tech), [Supabase](https://supabase.com))

### 2. Installation
```bash
# 1. Clone repository
git clone https://github.com/samimcodes/live-location-platform.git
cd live-location-platform

# 2. Install packages (--legacy-peer-deps recommended for React 19)
npm install --legacy-peer-deps

# 3. Setup environment variables
cp .env.example .env
```

### 3. Database Migration
```bash
# Run Prisma migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate
```

### 4. Start Development Server
```bash
npm run dev
```

- 🌐 **Web App**: [http://localhost:3000](http://localhost:3000)
- 📖 **API Docs (Swagger)**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## ⚙️ Environment Variables

<details>
<summary><b>Click to view essential <code>.env</code> variables</b></summary>

<br />

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL / Neon / Supabase)
DATABASE_URL="postgresql://user:password@localhost:5432/localink?schema=public"

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_access_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Social Logins (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# Map Initial Viewport
NEXT_PUBLIC_MAP_DEFAULT_LAT=23.8103
NEXT_PUBLIC_MAP_DEFAULT_LNG=90.4125
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=11

# Email & SMS Services (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

</details>

---

## 📁 Project Structure

<details>
<summary><b>Click to view repository structure</b></summary>

<br />

```
localink/
├── prisma/
│   └── schema.prisma          # PostgreSQL models (User, Location, Group, etc.)
│
├── server/                    # Custom Express 5 backend
│   ├── index.ts               # HTTP & Socket.IO entry point
│   ├── controllers/           # Auth, Friend, Location, Group, SMS controllers
│   ├── routes/                # REST endpoints prefixed with /api/v1/*
│   ├── middlewares/           # JWT auth verification, rate limiters, upload guards
│   ├── socket/                # Socket.IO handlers (live tracking, emergency SOS)
│   └── swagger/               # OpenAPI 3.0 specification (/api-docs)
│
└── src/                       # Next.js 15 frontend
    ├── app/                   # App Router: Landing, Auth, Dashboard, Map, Settings
    ├── components/
    │   ├── landing/           # Hero, Features, SOS Demo, Pricing, Map preview
    │   ├── map/               # LiveMap, EmergencySOSModal, MarkerPanel, Controls
    │   ├── dashboard/         # Sidebar, Navbar, CommandPalette, KPI Telemetry
    │   └── ui/                # Accessible shadcn/ui components
    ├── hooks/                 # Data hooks (useFriends, useGroups, useLocationSharing)
    ├── store/                 # Global state (Redux auth + Zustand live GPS)
    └── lib/                   # Axios client, Web Audio soundFx, date & map utilities
```

</details>

---

## 🔌 Real-Time Socket.IO Events

WebSocket events stream through authenticated rooms (`user:<id>` and `group:<id>`):

| Event | Direction | Purpose |
|---|:---:|---|
| `location:update` | Client → Server | Broadcast live GPS coordinates, speed, and heading |
| `sos:dispatch` | Client → Server | Trigger emergency distress beacon & sound alarm |
| `location:receive` | Server → Client | Deliver updated friend marker coordinates |
| `sos:alert` | Server → Client | Deliver high-priority distress alert with pinpoint GPS |
| `friend:online` / `offline` | Server → Client | Real-time presence updates |
| `notification` | Server → Client | Instant push alert for geofences and friend requests |

---

## 📜 Scripts & Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Next.js + Express + Socket.IO with hot-reload) |
| `npm run build` | Compile Next.js production build & compile server TypeScript |
| `npm run start` | Run compiled production server from `dist/` |
| `npm run type-check` | Run strict TypeScript checks across client & server |
| `npm run lint` | Run ESLint validation |
| `npm run db:migrate` | Execute pending Prisma database migrations |
| `npm run db:studio` | Open interactive Prisma Studio GUI at `localhost:5555` |

---

## 🚢 Deployment

### Deploying on Render (Active Production)
LocaLink is live on Render: **[https://localinks.onrender.com](https://localinks.onrender.com)**

1. Create a new **Web Service** on **[Render](https://render.com/)** and connect this repository.
2. Select runtime: **Node**.
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm run start`
5. Configure your environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc.) in the Render dashboard.

### Deploying on Railway

### Docker Container
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">

<br />

**LocaLink** — *Connecting families, protecting loved ones, anywhere in the world.*

Made with ❤️ by [Samim](https://github.com/samimcodes) and open-source contributors.

</div>
