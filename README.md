# Urban Harvest Hub

### 🔗 Live Deployment
- **Frontend App (Vercel):** [https://urban-harvest-hub-frontend.vercel.app](https://urban-harvest-hub-frontend.vercel.app)

Urban Harvest Hub is a full-stack, eco-conscious community web application designed for neighbors, urban growers, and sustainability advocates. The platform enables users to trade organic produce/gardening tools, coordinate and register for regenerative workshops (like composting and zero-waste cooking), and join local environmental events.

This repository features both:
1. **Task 1: React Single Page Application (SPA)** with rich visual aesthetics, custom Tailwind styling, dark mode, multi-language support (English/Spanish), interactive weather forecasts, and Leaflet location maps.
2. **Task 2: Progressive Web Application (PWA) + Express REST API** with offline support (via Workbox Service Workers, background sync, and offline fallbacks), web-push notification broadcasts, and geolocational proximity sorting for community events.

---

## Technical Architecture

### Frontend (SPA & PWA)
- **Framework:** React 18 + Vite
- **Routing:** React Router v6 (Nested paths, dynamic parameters, and query options)
- **Styling:** Tailwind CSS v3 with customized theme tokens (harvest green, earthen amber, DM Sans, and Playfair Display typography)
- **API Request Engine:** Axios client with automated interceptor injections for JWT authentication
- **Multilingual System:** `react-i18next` with modular resource files
- **PWA Service Worker:** `vite-plugin-pwa` utilizing the `injectManifest` strategy with background synchronization for offline bookings and push listeners

### Backend (REST API)
- **Server Platform:** Node.js + Express.js
- **Database Engine (Dual Adaptability):** 
  - **Primary:** MongoDB with Mongoose Schemas.
  - **Failsafe Fallback:** Synchronous SQLite database via Node's native `node:sqlite` API (compatible with `better-sqlite3` queries). It dynamically detects if MongoDB is unavailable and spins up a local SQL instance seamlessly.
- **Authentication:** JWT (JSON Web Tokens) with a 7-day expiration lifespan, encrypted with `bcryptjs`.
- **Validation:** Type-checks and validations built using `express-validator` middleware.
- **Security:** Security headers using `helmet` and CORS policies matching environment configuration.
- **Push Provider:** VAPID subscription registers via `web-push`.

---

## Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/urban_harvest_hub
JWT_SECRET=super_secret_eco_key_harvest_hub_development
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
CLIENT_URL=http://localhost:5173
```

> [!NOTE]
> **Database Fallback:** If you leave `MONGODB_URI` blank or if the MongoDB connection fails, the server automatically boots using the local SQLite file stored at `server/data/harvest.db`.
> 
> **Self-Healing VAPID Keys:** If `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are left blank, the server will auto-generate a fresh, valid base64 key pair on startup.

---

## Installation & Setup

### Prerequisites
- **Node.js** (v22+ recommended; tested on v24.11.1)
- **npm** (v10+; tested on v11.11.1)
- **MongoDB** (Optional; local SQLite database runs automatically if missing)

### Step 1: Install Dependencies
Install packages for both frontend (root) and backend (`/server`):

```bash
# Install root (Frontend) dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Step 2: Seed the Database
Populate user accounts (Admin/Member), items, and events:

```bash
# Run seeder inside the server directory
npm run seed
```

*Mock Accounts Seeded:*
- **Administrator:** `admin@harvest.org` / `admin123`
- **Community Member:** `member@harvest.org` / `member123`

### Step 3: Run the Application

#### Run Backend REST API:
```bash
# Start backend dev server (from the server/ directory)
npm run dev
```
The REST API will start on `http://localhost:5000/api`.

#### Run Frontend Client:
```bash
# Start Vite server (from the root directory in a new terminal window)
npm run dev
```
The application will open on `http://localhost:5173`.

---

## API Testing Guide (cURL Examples)

Here is how to test endpoints manually using `curl`:

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith", "email":"alice@example.com", "password":"password123"}'
```

### 2. User Login (Obtain Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@harvest.org", "password":"member123"}'
```
*Note: Copy the `token` string from the JSON response to authorize subsequent requests.*

### 3. Fetch Items (Products and Workshops)
```bash
curl -X GET http://localhost:5000/api/items
```

### 4. Fetch Events
```bash
curl -X GET http://localhost:5000/api/events
```

### 5. Create Event (Admin Only)
*Replace `<JWT_TOKEN>` with your login token:*
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"title":"Permaculture Guild Meet", "description":"Regenerative networking.", "date":"2026-09-12T14:00:00.000Z", "location":"Central Allotments", "category":"garden", "imageUrl":"https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400", "maxAttendees":50, "latitude":51.5, "longitude":-0.1}'
```

### 6. Book an Item (Member Auth Required)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"itemId":"item_12345", "date":"2026-08-01T10:00:00.000Z", "tickets":2, "notes":"Requires wheelchair ramp access"}'
```

---

## Mobile Device Capabilities & Testing

1. **Dark Mode Toggle:** Press the Sun/Moon icon in the Navbar. State is toggled on the html element via Tailwind class and stored in `localStorage` to persist across visits.
2. **Offline Access:** Open Chrome DevTools, navigate to the **Network** tab, check the **Offline** checkbox, and refresh. The Service Worker will load cached assets, display the event details, and show a top yellow warning banner informing the user that they are disconnected.
3. **PWA Background Sync:** While in offline mode, navigate to `/book/p1` and submit a booking. A message will appear: `"Saved offline!"`. Reconnect to the network, and the client will automatically upload the queued requests to the backend, showing a green sync banner.
4. **Geolocation Proximity:** On the Events page, click **Sort by My Location**. Give permission. The page calculates the distance to all events based on coordinates using the Haversine formula and sorts the listing cards with the closest events appearing first.

---

## Lighthouse Audits

The frontend SPA structure is optimized for high Lighthouse audits, scoring:
- **Performance:** ~95-100% (Lightweight code-splitting and responsive Unsplash images)
- **Accessibility:** 100% (Keyboard navigations, focus ring outlines, and ARIA tags for screens)
- **Best Practices:** 100% (HTTPS redirects, clean console logs, secure target link tags)
- **SEO:** 100% (Descriptive meta tags, semantic HTML5 structure, and clear headers hierarchy)
- **PWA:** Verified standalone install capability with custom service workers

---

## Known Limitations
- Geolocation calculations assume a spherical earth surface (Haversine approximation), which is accurate for localized cities but slightly off for extreme trans-continental distances.
- Background sync depends on the browser's Service Worker lifecycle; if browser data is cleared, offline sync queues will be reset.
