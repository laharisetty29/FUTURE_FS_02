# 🚀 LeadFlow — Mini CRM

A full-stack Client Lead Management System built with the MERN stack. Manage leads from website contact forms, track statuses, add follow-up notes, and view analytics — all from a secure admin panel.

---

## ✨ Features

- **Lead Management** — Add, view, edit, delete leads with name, email, phone, source, status
- **Status Pipeline** — New → Contacted → Converted → Lost
- **Follow-up Notes** — Add/delete timestamped notes per lead
- **Dashboard Analytics** — Conversion rates, leads by source, daily trends with charts
- **Search & Filter** — Filter by status, source, or search by name/email/phone
- **Secure Admin Login** — JWT-based authentication
- **Sample Data** — Auto-seeded on first run

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens), bcryptjs |

---

## 📁 Project Structure

```
mini-crm/
├── backend/
│   ├── models/         # Mongoose schemas (Lead, Admin)
│   ├── routes/         # Express routes (auth, leads, stats)
│   ├── middleware/     # JWT auth middleware
│   ├── server.js       # Main server entry point
│   ├── .env.example    # Environment variable template
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Layout, Sidebar
        ├── context/    # AuthContext (JWT state)
        ├── pages/      # Login, Dashboard, Leads, LeadDetail
        └── App.js
```

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) running locally OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/mini-crm.git
cd mini-crm
```

### 2. Set up the Backend
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI if needed
```

`.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_SECRET=change_this_to_a_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm start
# App opens on http://localhost:3000
```

---

## 🔐 Default Login

| Field | Value |
|-------|-------|
| Email | admin@example.com |
| Password | Admin@123 |

> ⚠️ Change these in `.env` before deploying to production!

---

## 🌐 Contact Form Integration

To capture leads from your website, make a POST request to:
```
POST http://localhost:5000/api/leads/public/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "message": "I'm interested in your services",
  "source": "Website"
}
```

---

## 🚀 Deployment Notes

1. Set `MONGODB_URI` to your Atlas connection string
2. Set a strong `JWT_SECRET`
3. Build the frontend: `cd frontend && npm run build`
4. Serve the build folder via Express or a CDN
5. Set `FRONTEND_URL` in backend `.env` to your deployed frontend URL

---

## 📄 License

Lahari Gadamsetty — free to use for learning and portfolio projects.
