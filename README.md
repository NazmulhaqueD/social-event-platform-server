# 🎯 Social Serve Server

This is the backend server for the **Social Event Platform** — a community-driven event management application. Built with **Node.js**, **Express.js**, **MongoDB**, and **Firebase Admin SDK**, it handles user authentication, event creation, joining, updating, and deletion functionalities.

---

## 🚀 Features

- 🔐 JWT authentication using Firebase Admin SDK
- 📝 Create, update, and delete events
- 📅 Filter future events by type or title
- 👥 Join or cancel participation in events
- 🔄 Role-based access for event management
- 🔎 Real-time event filtering (by date, type, title)
- 📦 REST API architecture

---

## 🔧 Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB (with Mongoose)**
- **Firebase Admin SDK**
- **Dotenv**
- **CORS Middleware**

---

## 📁 API Endpoints

### ✅ Public Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/events` | Get all upcoming events, with optional filter: `type`, `search` |
| GET | `/latestEvents` | Get latest 6 events by post date |
| GET | `/events/:id` | Get single event by ID |

---

### 🔐 Protected Routes (Require Firebase Token)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/manageEvents?email=user@example.com` | Get events created by a user |
| GET | `/joinedEvents/:email` | Get events a user has joined |
| POST | `/events` | Create a new event |
| POST | `/joinedEvents` | Join an event |
| PUT | `/eventUpdate/:id` | Update an event by ID |
| DELETE | `/eventDelete/:id` | Delete an event by ID |
| DELETE | `/cancelEvent/:id` | Cancel joined event by ID |

---

## 🔐 Firebase Token Verification

You must include a Bearer token from Firebase Authentication in the `Authorization` header of protected routes.

