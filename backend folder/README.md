# SafeWalk AI-Powered Women Safety Application Backend

This is the production-ready Node.js/Express.js backend for **SafeWalk**, an AI-powered women safety platform. It provides REST APIs and real-time WebSocket communication using Socket.io to support SOS alerts, live location tracking, safe word monitoring, trusted contacts management, and threat simulations.

---

## 🚀 Features

1. **Authentication & Profile**: Secure register and login using JWT token authentication and bcryptjs password hashing.
2. **Emergency Contacts**: CRUD operations for managing trusted helper contacts (Family, Friend, Partner, etc.).
3. **Live Location Tracking**: Periodic coordinate updates (lat, lng) stored to DB and streamed in real-time to active listeners over Socket.io.
4. **Journey System**: Session-based trip logging that tracks trip statuses ("active", "completed") and logs historical coordinate breadcrumbs.
5. **SOS Alerting**: Immediate SOS triggering with a **5-second safety validation delay** simulation, followed by emergency contact notification simulation and socket broadcast.
6. **AI Safe Word Detection**: Inspects text messages case-insensitively. If the user's customized `safeWord` is detected, it automatically launches the SOS alerting pipeline.
7. **Ambient Threat Simulation**: Simulated audio analysis endpoint (yells/screams) to automatically trigger the SOS system.

---

## 📁 Project Structure

```
safewalk-backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/
│   ├── authController.js     # User registration and login handlers
│   ├── userController.js     # User profile retrieval
│   ├── contactController.js  # Add, fetch, remove emergency contacts
│   ├── locationController.js # coordinate tracking & socket updates
│   ├── sosController.js      # SOS triggers & 5s delay simulator
│   ├── safeWordController.js # safe word checking & auto-SOS
│   ├── threatController.js   # Yell/scream simulator triggers
│   └── journeyController.js  # Trip path start/stop controls
├── middleware/
│   ├── auth.js               # JWT header protection
│   └── errorHandler.js       # JSON error responses formatting
├── models/
│   ├── User.js               # User & Contacts Schema
│   ├── Journey.js            # Walk path breadcrumbs
│   └── SosAlert.js           # Emergency alert entries
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── contactRoutes.js
│   ├── locationRoutes.js
│   ├── sosRoutes.js
│   ├── safeWordRoutes.js
│   ├── threatRoutes.js
│   └── journeyRoutes.js
├── sockets/
│   └── socketManager.js      # Real-time WebSocket handlers
├── utils/
│   └── smsSimulator.js       # SMS/Push notification logs simulator
├── .env.example              # Env configuration structure
├── app.js                    # Express settings
└── server.js                 # Port listener & socket binding
```

---

## 🛠️ Installation & Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`, or a remote MongoDB Atlas connection URI.

### 1. Clone or Copy the Files
Ensure all project files are structured under a folder named `safewalk-backend/`.

### 2. Install Dependencies
Navigate to the directory and run npm install:
```bash
cd safewalk-backend
npm install
```

### 3. Environment Setup
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Open `.env` and verify your settings:
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/safewalk
JWT_SECRET=supersecretjwtkey12345!
```

### 4. Running the Server

* **Development Mode (using Nodemon)**:
  ```bash
  npm run dev
  ```
* **Production Mode**:
  ```bash
  npm start
  ```

Once started, the backend will log:
```
📡 MongoDB Connected: 127.0.0.1
🔌 Socket.io server initialized successfully
🚀 Server running in development mode on port 5000
📡 Health Check Endpoint: http://localhost:5000/health
```

---

## 📡 API Endpoints & Testing Payloads

All endpoints except **Authentication** require passing the JWT token in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

### 🔐 Authentication

#### **Register User**
* **Endpoint**: `POST /api/auth/register`
* **Body (JSON)**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "safeWord": "red balloon"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODM5..."
  "data": {
    "id": "64839a9c8d5a1b32947d8b5a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "safeWord": "red balloon",
    "contacts": [],
    "currentLocation": { "lat": 0, "lng": 0 },
    "journeyActive": false
  }
}
```

#### **Login User**
* **Endpoint**: `POST /api/auth/login`
* **Body (JSON)**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODM5...",
  "data": {
    "id": "64839a9c8d5a1b32947d8b5a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "safeWord": "red balloon",
    "contacts": [],
    "currentLocation": { "lat": 0, "lng": 0 },
    "journeyActive": false
  }
}
```

---

### 👤 User

#### **Get Profile**
* **Endpoint**: `GET /api/user/profile`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64839a9c8d5a1b32947d8b5a",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "safeWord": "red balloon",
    "contacts": [],
    "currentLocation": { "lat": 0, "lng": 0 },
    "journeyActive": false,
    "createdAt": "2026-06-12T15:52:00.000Z",
    "updatedAt": "2026-06-12T15:52:00.000Z"
  }
}
```

---

### 👨‍👩‍👧 Trusted Contacts System

#### **Add Emergency Contact**
* **Endpoint**: `POST /api/contacts/add`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "relationship": "Family"
}
```
*(Valid relationship enums: `Family`, `Friend`, `Work`, `Partner`, `Other`)*

* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact added successfully",
  "data": [
    {
      "name": "John Doe",
      "phone": "+1234567890",
      "relationship": "Family",
      "_id": "6483a9de8d5a1b32947d8b6c"
    }
  ]
}
```

#### **Get All Emergency Contacts**
* **Endpoint**: `GET /api/contacts`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "6483a9de8d5a1b32947d8b6c",
      "name": "John Doe",
      "phone": "+1234567890",
      "relationship": "Family"
    }
  ]
}
```

#### **Remove Emergency Contact**
* **Endpoint**: `DELETE /api/contacts/:id` (e.g. `DELETE /api/contacts/6483a9de8d5a1b32947d8b6c`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact removed successfully",
  "data": []
}
```

---

### 📍 Live Location Tracking

#### **Update Live Location**
* **Endpoint**: `POST /api/location/update`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
```json
{
  "lat": 12.9715987,
  "lng": 77.5945627
}
```
*(Note: If a journey is currently active, this coordinates coordinate is automatically appended to the active journey history path log).*

* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "userId": "64839a9c8d5a1b32947d8b5a",
    "currentLocation": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "journeyActive": false
  }
}
```

#### **Get Last Tracked Location of Another User**
* **Endpoint**: `GET /api/location/:userId` (e.g. `GET /api/location/64839a9c8d5a1b32947d8b5a`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userId": "64839a9c8d5a1b32947d8b5a",
    "name": "Jane Doe",
    "currentLocation": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "journeyActive": false
  }
}
```

---

### 🚨 SOS System

#### **Trigger SOS**
* **Endpoint**: `POST /api/sos/trigger`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
```json
{
  "location": {
    "lat": 12.9715987,
    "lng": 77.5945627
  },
  "audioSnippetUrl": "https://safewalk-storage.s3.amazonaws.com/audio/threat_recording_9821.mp3"
}
```
* **Response (202 Accepted)**:
```json
{
  "success": true,
  "message": "SOS triggered. Alerts will be dispatched to trusted contacts in 5 seconds.",
  "data": {
    "alertId": "6483b1a88d5a1b32947d8b7e",
    "userId": "64839a9c8d5a1b32947d8b5a",
    "location": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "audioSnippetUrl": "https://safewalk-storage.s3.amazonaws.com/audio/threat_recording_9821.mp3",
    "delaySeconds": 5
  }
}
```
*(After 5 seconds, simulated SMS broadcasts print to the server console and emit Socket.io notifications to active connection rooms).*

---

### 🤐 Safe Word Detection

#### **Check message for Safe Word**
* **Endpoint**: `POST /api/safe-word/check`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
```json
{
  "message": "Please get me out of here. The situation matches a red balloon.",
  "location": {
    "lat": 12.9715987,
    "lng": 77.5945627
  }
}
```
* **Response (200 OK - Safe Word Matched)**:
```json
{
  "success": true,
  "safeWordDetected": true,
  "message": "Safe word detected! SOS has been automatically triggered.",
  "data": {
    "alertId": "6483c30a8d5a1b32947d8b8a",
    "userId": "64839a9c8d5a1b32947d8b5a",
    "safeWord": "red balloon",
    "location": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "delaySeconds": 5
  }
}
```

* **Response (200 OK - No Match)**:
```json
{
  "success": true,
  "safeWordDetected": false,
  "message": "No safe word detected in message."
}
```

---

### 🎤 Ambient Threat Simulation

#### **Simulate Threat Detection (Yell/Scream)**
* **Endpoint**: `POST /api/threat/simulate`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
```json
{
  "threatType": "screaming and glass breaking",
  "location": {
    "lat": 12.9715987,
    "lng": 77.5945627
  }
}
```
* **Response (202 Accepted)**:
```json
{
  "success": true,
  "threatDetected": true,
  "threatType": "screaming and glass breaking",
  "message": "⚠️ Threat detected: screaming and glass breaking! SOS triggered automatically. Dispatching alerts in 5 seconds.",
  "data": {
    "alertId": "6483c4b98d5a1b32947d8b9c",
    "userId": "64839a9c8d5a1b32947d8b5a",
    "location": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "delaySeconds": 5
  }
}
```

---

### 📊 Journey System

#### **Start Journey**
* **Endpoint**: `POST /api/journey/start`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON - Optional start location)**:
```json
{
  "startLocation": {
    "lat": 12.9715987,
    "lng": 77.5945627
  }
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Journey started successfully",
  "data": {
    "userId": "64839a9c8d5a1b32947d8b5a",
    "status": "active",
    "startLocation": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "history": [
      {
        "lat": 12.9715987,
        "lng": 77.5945627,
        "_id": "6483c7498d5a1b32947d8ba1",
        "timestamp": "2026-06-12T15:52:00.000Z"
      }
    ],
    "_id": "6483c7498d5a1b32947d8ba0",
    "createdAt": "2026-06-12T15:52:00.000Z",
    "updatedAt": "2026-06-12T15:52:00.000Z"
  }
}
```

#### **End Journey**
* **Endpoint**: `POST /api/journey/end`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON - Optional end location)**:
```json
{
  "endLocation": {
    "lat": 12.971888,
    "lng": 77.595012
  }
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Journey completed successfully",
  "data": {
    "_id": "6483c7498d5a1b32947d8ba0",
    "userId": "64839a9c8d5a1b32947d8b5a",
    "status": "completed",
    "startLocation": {
      "lat": 12.9715987,
      "lng": 77.5945627
    },
    "endLocation": {
      "lat": 12.971888,
      "lng": 77.595012
    },
    "history": [
      {
        "lat": 12.9715987,
        "lng": 77.5945627,
        "_id": "6483c7498d5a1b32947d8ba1",
        "timestamp": "2026-06-12T15:52:00.000Z"
      },
      {
        "lat": 12.971888,
        "lng": 77.595012,
        "_id": "6483c8aa8d5a1b32947d8bb2",
        "timestamp": "2026-06-12T15:53:00.000Z"
      }
    ],
    "createdAt": "2026-06-12T15:52:00.000Z",
    "updatedAt": "2026-06-12T15:53:00.000Z"
  }
}
```

---

## 🔌 Socket.io Events

To establish a WebSocket connection, point your socket client (e.g., in a frontend code or Postman WebSocket workspace) to the root URL: `ws://localhost:5000`.

### Emitted Socket Events (Clients send to Server)

1. **`join`**
   * **Parameter**: `userId` (String)
   * **Description**: Associates the socket connection with the user's account ID and binds the socket to their private notification room.
2. **`track-user`**
   * **Parameter**: `targetUserId` (String)
   * **Description**: Joins a channel (`track_<targetUserId>`) to listen for location changes or SOS updates of a family member/friend who is travelling.

### Received Socket Events (Server broadcasts to Clients)

1. **`location-update`**
   * **Payload**:
     ```json
     {
       "userId": "64839a9c8d5a1b32947d8b5a",
       "location": { "lat": 12.9715987, "lng": 77.5945627 },
       "timestamp": "2026-06-12T15:52:00.000Z"
     }
     ```
   * **Description**: Sent to anyone who subscribed to track this user using `track-user`.
2. **`sos-alert`**
   * **Payload**:
     ```json
     {
       "userId": "64839a9c8d5a1b32947d8b5a",
       "alertId": "6483c4b98d5a1b32947d8b9c",
       "location": { "lat": 12.9715987, "lng": 77.5945627 },
       "userName": "Jane Doe",
       "audioSnippetUrl": "...",
       "triggerSource": "Ambient Threat Detected: screaming",
       "timestamp": "2026-06-12T15:52:05.000Z"
     }
     ```
   * **Description**: Broadcasts immediately when the 5-second validation timer expires on active threat/SOS.
