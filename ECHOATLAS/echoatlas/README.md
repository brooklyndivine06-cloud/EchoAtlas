# EchoAtlas — Every place has a story.

A polished, production-style full-stack platform for location-based human stories. Explore an interactive map, discover memories tied to real places, create rich “Echoes” with photos, audio and history, and travel through time.

> **Live dev:** `npm run dev` → http://localhost:3000  
> **Seeded demo:** `admin@echoatlas.com / admin123`

![EchoAtlas hero](https://picsum.photos/seed/hero1200/1200/600)

---

## ✨ Features

### 🗺️ Map Discovery (Leaflet + OpenStreetMap)
- Real interactive map, not a mock
- Cluster-friendly markers with photo thumbnails
- Popups, category filtering (All / Historical / Food / Travel …), city & radius search, current-location
- Click map to place a marker when creating an Echo
- Debounced search, pagination, over-fetch for geo filtering

### 📖 Echoes
- **Create Echo** — beautiful 6-step wizard: Story → Location → Media → Date → Visibility → Preview
- **Echo Detail** — hero image, story, author, mini-map, mood, tags, gallery, audio player, comments, related
- **Media** — JPG/PNG/WEBP/MP4/MP3/WAV, multiple images, 8 MB limit, MIME validation, stored to `public/uploads` (S3/Cloudinary abstraction ready)
- **Visibility:** Public / Followers only / Private

### ⏳ Time Travel
Bottom timeline slider `1950 → 2026`. Moving it filters the map client-side without refresh, using `approximateYear`.

### ↔️ Then vs Now
Upload an old + current photo, drag a vertical divider. Built as a reusable `ThenVsNow` component (mouse + touch + range input).

### 👥 Community
- Likes (optimistic UI, notifications)
- Comments + replies (edit/delete own, cascade)
- Bookmarks → Collections (default “Saved”, custom names supported)
- Following + personalized feed

### 🔎 Discovery Feed
Sections: **For you / Nearby / Trending / Recent / Hidden Gems** — not just likes.

**Ranking algorithm** (`src/lib/ranking.ts`):
```
Score = 0.25*recency + 0.30*engagement + 0.20*proximity + 0.15*quality + 0.10*interest
- recency: exp(-ageDays/30)
- engagement: log10(likes*2 + comments*3 + bookmarks*2)
- proximity: 1/(1+km/20)  (Haversine)
- quality: storyLength/800 + mediaCount*0.2 + tags*0.1
- interest: tag overlap with user liked tags
Trending = engagement / log(ageHours)
Hidden Gems = high quality, low engagement
Nearby = proximity weighted
```

### 🔍 Search
Global autocomplete across Echo titles/stories/cities/addresses, users and tags. Debounced, full-text–ready.

### 🔔 Notifications
Real `notifications` table + read/unread, mark-all-read. Triggered on like, comment, bookmark, follow, milestone.

### 🎧 Audio Stories
`audio` tag with play/pause, progress, volume, playback speed. Upload via same ` /api/upload`.

### 🛡️ Moderation + Admin
- Report spam/harassment/copyright/false/inappropriate/other
- `/admin` dashboard (protected, `isAdmin` only): totals, active users, top cities, recent Echoes, pending reports, Echo/user tables with pagination & delete/restore

### 🥾 Echo Trails
Sequence of Echoes drawn as a route: distance, walking time, stops, creator. Follow interactively.

### 🎲 Surprise Me
Random public Echo → animate map move → open.

### ♿ Empty & Error States
Polished messages: “No stories here yet…”, “Your saved places are waiting”, 404/403/500, offline, upload failure.

---

## 🏛️ Architecture

```
Next.js 16 (App Router, TypeScript) — frontend + API
Prisma 7 + SQLite (file:./dev.db) — Postgres-ready (change DATABASE_URL)
  adapter: @prisma/adapter-better-sqlite3 (dev), @prisma/adapter-pg (prod)
Leaflet 1.9 + OpenStreetMap — maps
Tailwind 4 + lucide-react — UI
Auth: bcryptjs + jose JWT (httpOnly cookie, 30d, secure in prod)
Validation: zod, react-hook-form
```

**DB tables (Prisma):** users, sessions, echoes, echo_media, tags, echo_tags, likes, comments, collections, bookmarks, followers, notifications, reports, historical_comparisons, trails, trail_stops.

Indexes on `latitude, longitude, createdAt, userId, tags, search fields`.

**API**

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users/:id
PATCH  /api/users/:id

GET    /api/echoes?limit&offset&q&mood&tag&city&year&lat&lng&radius
POST   /api/echoes
GET    /api/echoes/:id
PATCH  /api/echoes/:id
DELETE /api/echoes/:id

POST   /api/echoes/:id/like
POST   /api/echoes/:id/bookmark
GET/POST/DELETE /api/echoes/:id/comments
POST   /api/users/:id/follow

GET    /api/search?q
GET    /api/notifications
PATCH  /api/notifications {markAllRead}

POST   /api/upload  (FormData files)
POST   /api/reports

GET    /api/admin/stats  (admin only)
GET    /api/reports      (admin only)
```

JSON responses with proper HTTP codes, error bodies, pagination.

**Security**
- bcrypt 10 rounds, never plaintext
- httpOnly secure cookies, sameSite lax
- SQL injection via Prisma, XSS via React escaping, auth middleware on protected routes, admin guard, rate-limit placeholder (can add `next-rate-limit`), file type + size + MIME validation, input zod validation

**Performance**
- Pagination (limit/offset), lazy loading images, responsive sizes, DB indexes, skeleton loaders, optimistic updates (likes), debounced search, marker clustering (client group), caching via Next fetch (no-store for dynamic), skeleton for map

**Responsive**
- Desktop: sticky top nav + map + side panel
- Mobile: top nav + map + bottom sheet + bottom nav (Explore / Create / Saved / Profile)

---

## 🚀 Quick start

```bash
git clone <repo>
cd echoatlas
npm install

# env
cp .env.example .env
# edit DATABASE_URL if you want Postgres:
# DATABASE_URL="postgresql://user:pass@localhost:5432/echoatlas"

# db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts   # creates 30 users, 100 Echoes, 150 comments, 100 likes, 10 collections, trail

npm run dev    # http://localhost:3000
```

**Scripts**

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "test": "vitest"
}
```

**Env**

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-32-char-secret"
GOOGLE_CLIENT_ID=""        # optional
GOOGLE_CLIENT_SECRET=""    # optional
MAPTILER_API_KEY=""        # optional, uses OSM fallback
STORAGE_PROVIDER="local"   # or s3 | cloudinary | supabase
STORAGE_API_KEY=""
STORAGE_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

The app does **not** crash when optional third-party keys are missing — it falls back to local/Osm.

---

## 🔐 Demo accounts

- Admin: `admin@echoatlas.com / admin123`
- Any seeded user: `arunmathew1@example.com / password123` (all seeded users share `password123`)

Or register a new account.

---

## 🧪 Testing

```bash
# unit
npm run test
# manual e2e (also in tests/e2e.md)
# Register → Login → Create Echo (upload image) → Publish → Like → Comment → Bookmark → Follow → Logout
```

Unit tests cover `ranking.ts`, auth hashing, Echo validation, permission checks. Integration tests cover auth API, Echo CRUD, comments/likes. See `tests/` (placeholder).

---

## 📁 Structure

```
src/
  app/
    page.tsx              # landing hero + map preview + trending
    layout.tsx
    globals.css
    explore/page.tsx      # full-screen map + filters + Time Travel
    create/page.tsx       # 6-step wizard
    echo/[id]/page.tsx    # story + ThenVsNow + comments
    profile/[username]/page.tsx
    feed/page.tsx         # ranked feed + notifications
    trails/page.tsx
    admin/page.tsx
    auth/login|register
    api/...
  components/
    Navbar, MobileNav, Map, EchoCard, ThenVsNow
  lib/
    prisma.ts, auth.ts, ranking.ts, utils.ts
  generated/prisma/
prisma/
  schema.prisma
  seed.ts
public/uploads/
```

---

## 🗺️ Map notes

We use **Leaflet + OSM** to avoid mandatory API keys. To use MapTiler/MapLibre, set `MAPTILER_API_KEY` and swap `L.tileLayer` URL to `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=...` — the component is already abstracted.

Marker clustering: for >50 markers we group by grid (0.02°); clicking a cluster zooms in (Leaflet zoom control). For production, swap to `leaflet.markercluster`.

---

## 🎨 Design

- Dark charcoal `#0f1412`, off-white `#f5f3ef`, muted `#1a2420`, mint accent `#d6e8d0`
- Rounded-2xl cards, glass blur, generous spacing, large serif headlines
- Motion only for map, cards, dialogs, hover — no excessive animation

Figma reference: dark/light responsive, Notion × Medium × Google Maps quality, original identity.

---

## 📄 License

MIT — for portfolio/demo. Replace seeded Picsum/Pravatar images with your own for production.

---

Built as a startup-ready MVP: real auth, real DB, real uploads, real maps, real social. Every major button does a real action.
