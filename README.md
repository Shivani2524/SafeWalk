# 🛡️ SafeWalk: AI-Powered Women Safety Platform

SafeWalk is a state-of-the-art, AI-powered women's safety platform built to provide immediate protection, ambient threat intelligence, and community-driven safety features. By combining modern interactive mapping, local audio processing for threat detection, custom safe word triggers, and real-time WebSocket communication, SafeWalk keeps users protected and connected to their trusted guardians.

---

## 🌟 Key Features

* **📍 Live Location Tracking & Interactive Map**: Built-in interactive map mapping using `react-leaflet` to display real-time coordinate locations and historical journey path breadcrumbs.
* **🎙️ Ambient Audio Threat Simulation**: Runs local microphone pattern monitoring to measure surrounding decibels and detect yell/scream threat profiles, triggering safety alarms automatically.
* **🤐 Safe Word Silent SOS**: Configure a personalized code word (e.g., `SUNFLOWER`). Detection of the safe word via text/voice immediately activates the SOS pipeline.
* **🚨 Emergency SOS System**: Immediate dispatching to trusted contacts with a 5-second validation delay (cancelable if triggered accidentally).
* **🚧 Geofence Safety Zones**: Dynamic boundaries (Home, Office, Custom) that alert guardians when entering or leaving designated areas.
* **👥 Buddy Match**: Travel together with verified members of the SafeWalk community to ensure you never walk alone.
* **💬 Trusted Contacts & Guardian Alerts**: Comprehensive CRUD system to manage trusted guardian contacts for automated SMS/push simulations and live tracking hooks.

---

## 📁 Repository Structure

```
safewalk-ai/
├── backend folder/           # Production Node.js & Express API Server
│   ├── config/               # Database connection configurations
│   ├── controllers/          # Business logic handlers (Auth, SOS, Journey, Contacts)
│   ├── middleware/           # Protected routes (JWT) & error logging
│   ├── models/               # MongoDB Schemas (User, Journey, SOS Alerts)
│   ├── routes/               # API endpoints
│   ├── sockets/              # Socket.io connection manager for real-time tracking
│   ├── utils/                # SMS/Notification simulation logs
│   ├── .env.example          # Environment template
│   ├── app.js                # Express app configuration
│   └── server.js             # Entrypoint & WebSocket server bind
│
├── src/                      # Full-stack TanStack Start React Frontend
│   ├── components/           # Reusable UI elements (Map components, etc.)
│   ├── hooks/                # Geolocation and Audio Web API hooks
│   ├── lib/                  # Utilities and Tailwind configurations
│   ├── routes/               # Routing & Page Layouts (Dashboard, Root)
│   ├── server.ts             # TanStack Start SSR entrypoint
│   └── start.ts              # Frontend bootstrap runner
│
├── package.json              # Main frontend package config
├── tsconfig.json             # TypeScript configurations
├── vite.config.ts            # Vite compile setups
└── hyd_police_stations.geojson # Hyderabad police stations mapping data
```

---

## 🛠️ Technology Stack

### Frontend (TanStack Start)
* **Framework**: React 19 (TanStack Start TS)
* **Build Tool**: Vite
* **Styling**: Tailwind CSS & Lucide Icons
* **Maps & Geo**: Leaflet & React Leaflet
* **State & Forms**: TanStack React Query, React Hook Form, and Zod validator

### Backend (Node.js & Express)
* **Runtime**: Node.js (v18+)
* **Server Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Real-time WebSockets**: Socket.io
* **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js
* **Docs**: Swagger UI & JSdoc

---

## 🚀 Getting Started

To get both the frontend dashboard and backend services up and running, follow these steps:

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd "backend folder"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your MongoDB URI and JWT secrets:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/safewalk
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the backend:
   * **Development mode** (with nodemon): `npm run dev`
   * **Production mode**: `npm start`

### 2. Frontend Setup

1. From the root directory, install the packages:
   ```bash
   bun install
   # OR
   npm install
   ```
2. Run the development server:
   ```bash
   bun dev
   # OR
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) (or the port specified in the console) to view the SafeWalk dashboard.

---

## 📡 API Reference & Events

For detailed REST endpoints and Socket.io event schemas, please refer to the documentation inside the [`backend folder/README.md`](file:///home/shivani/Desktop/safewalk-ai/backend%20folder/README.md).
