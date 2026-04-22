# MIET Africa — React + Node.js + PostgreSQL Connection Guide

**Your Database is already running and ready.**  
This guide tells you exactly what to do when you start building the project.

---

## Your Database Details (Use These Exactly)

| Setting | Value |
|---------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database Name** | `miet_africa_db` |
| **Username** | `postgres` |
| **PostgreSQL Version** | 18.0 |
| **Location** | `C:\Program Files\PostgreSQL\18` |

> ⚠️ **Replace `YOUR_POSTGRES_PASSWORD`** with the password you set when you installed PostgreSQL on your machine.

---

## How the Project is Structured

```
REACT APP (Frontend)          NODE.JS API (Backend)         POSTGRESQL (Database)
  localhost:3000        →→→     localhost:5000         →→→    localhost:5432
  (what users see)             (handles all logic)            (miet_africa_db)
```

**Important:** React does NOT connect directly to PostgreSQL.  
React → talks to → Node.js API → talks to → PostgreSQL.

---

## STEP 1 — Create Your Node.js Backend Project

When you are ready to start, open a terminal and run:

```bash
# Create the backend folder
mkdir miet-africa-backend
cd miet-africa-backend

# Initialise Node.js project
npm init -y

# Install all required packages
npm install express pg dotenv bcryptjs jsonwebtoken cors helmet express-rate-limit express-validator
npm install --save-dev nodemon
```

### What each package does:

| Package | Purpose |
|---------|---------|
| `express` | Web server and API routes |
| `pg` | PostgreSQL driver — connects Node.js to your database |
| `dotenv` | Loads environment variables from `.env` file |
| `bcryptjs` | Hashes passwords before storing in database |
| `jsonwebtoken` | Creates and verifies JWT tokens for login |
| `cors` | Allows React (port 3000) to talk to Node.js (port 5000) |
| `helmet` | Adds security headers to all API responses |
| `express-rate-limit` | Prevents brute-force attacks |
| `express-validator` | Validates request data before hitting the database |
| `nodemon` | Auto-restarts server when you save changes (dev only) |

---

## STEP 2 — Create Your `.env` File

Inside your `miet-africa-backend` folder, create a file called **`.env`**:

```env
# =============================================
# MIET AFRICA — ENVIRONMENT VARIABLES
# =============================================

# PostgreSQL Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miet_africa_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# Full connection string (alternative format)
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/miet_africa_db

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (change this to a long random string in production)
JWT_SECRET=miet_africa_super_secret_jwt_key_2025_change_in_production

# JWT Expiry
JWT_EXPIRES_IN=8h

# CORS — React app URL
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **NEVER commit `.env` to GitHub.** Add it to `.gitignore` immediately.

---

## STEP 3 — Create the Database Connection File

Create a file: `miet-africa-backend/src/config/db.js`

```javascript
// src/config/db.js
// PostgreSQL connection pool for MIET Africa database

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using your .env variables
const pool = new Pool({
  host:     process.env.DB_HOST,      // localhost
  port:     process.env.DB_PORT,      // 5432
  database: process.env.DB_NAME,      // miet_africa_db
  user:     process.env.DB_USER,      // postgres
  password: process.env.DB_PASSWORD,  // your password

  // Pool settings (handles multiple requests at once)
  max: 20,                    // maximum 20 connections
  idleTimeoutMillis: 30000,   // close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // fail if can't connect in 2 seconds
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection FAILED:', err.message);
    console.error('Check your .env file — DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
  } else {
    console.log('✅ Connected to PostgreSQL — miet_africa_db');
    release();
  }
});

// Helper function: run a query with Row Level Security
// Call this on every request after the user logs in
const queryWithRLS = async (userId, userRole, queryText, params) => {
  const client = await pool.connect();
  try {
    // Set RLS session variables so the database knows who is querying
    await client.query(`SET app.user_id   = '${userId}'`);
    await client.query(`SET app.user_role = '${userRole}'`);
    const result = await client.query(queryText, params);
    return result;
  } finally {
    client.release();
  }
};

module.exports = { pool, queryWithRLS };
```

---

## STEP 4 — Create the Main Server File

Create a file: `miet-africa-backend/server.js`

```javascript
// server.js — Main entry point for MIET Africa API

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,  // http://localhost:3000
  credentials: true
}));
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'MIET Africa API is running', timestamp: new Date() });
});

// ── Routes (add these as you build each module) ───────────────
// app.use('/api/auth',        require('./src/routes/auth'));
// app.use('/api/learners',    require('./src/routes/learners'));
// app.use('/api/courses',     require('./src/routes/courses'));
// app.use('/api/enrolments',  require('./src/routes/enrolments'));
// app.use('/api/sessions',    require('./src/routes/sessions'));
// app.use('/api/attendance',  require('./src/routes/attendance'));
// app.use('/api/assessments', require('./src/routes/assessments'));
// app.use('/api/certificates',require('./src/routes/certificates'));
// app.use('/api/donations',   require('./src/routes/donations'));
// app.use('/api/reports',     require('./src/routes/reports'));

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 MIET Africa API running on http://localhost:${PORT}`);
  console.log(`📊 Database: miet_africa_db @ localhost:5432`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
});
```

---

## STEP 5 — Create Your React Frontend Project

In a **separate terminal**, outside the backend folder:

```bash
# Create React app with TypeScript (as per the project spec)
npx create-react-app miet-africa-frontend --template typescript
cd miet-africa-frontend

# Install packages for API calls and routing
npm install axios react-router-dom
npm install --save-dev @types/react-router-dom
```

### Create the API configuration file

Create: `miet-africa-frontend/src/config/api.ts`

```typescript
// src/config/api.ts
// All API calls go through this file

import axios from 'axios';

// Your Node.js backend URL
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Send cookies with requests
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('miet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (token expired) — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('miet_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## STEP 6 — Example: Login Flow (End to End)

This shows how React → Node.js → PostgreSQL works together.

### React (Frontend) — Login Form

```typescript
// src/pages/Login.tsx
import api from '../config/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Save the JWT token
    localStorage.setItem('miet_token', response.data.token);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Node.js (Backend) — Login Route

```javascript
// src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../config/db');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user in PostgreSQL database
    const result = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // 2. Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // 3. Verify password against bcrypt hash in database
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      // Update failed login counter in database
      await pool.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = $1',
        [user.user_id]
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 4. Reset failed attempts and update last login
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, last_login = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    // 5. Log the login action in audit_logs
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, action, entity_type, description, action_result)
       VALUES ($1, $2, 'LOGIN', 'users', 'User logged in', 'SUCCESS')`,
      [user.user_id, user.email]
    );

    // 6. Create JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 7. Send token back to React
    res.json({
      token,
      user: {
        id:    user.user_id,
        name:  user.full_name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

---

## STEP 7 — Example: Get All Learners

### React (Frontend)

```typescript
// src/pages/Learners.tsx
import { useEffect, useState } from 'react';
import api from '../config/api';

const LearnersPage = () => {
  const [learners, setLearners] = useState([]);

  useEffect(() => {
    api.get('/learners')
      .then(res => setLearners(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <table>
      {learners.map((l: any) => (
        <tr key={l.learner_id}>
          <td>{l.first_name} {l.last_name}</td>
          <td>{l.id_number}</td>
          <td>{l.status}</td>
        </tr>
      ))}
    </table>
  );
};
```

### Node.js (Backend)

```javascript
// src/routes/learners.js
const express = require('express');
const { queryWithRLS } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/learners
router.get('/', authenticateToken, async (req, res) => {
  try {
    // queryWithRLS sets app.user_id and app.user_role for Row Level Security
    // Facilitators will automatically only see learners in their courses
    const result = await queryWithRLS(
      req.user.id,
      req.user.role,
      `SELECT learner_id, first_name, last_name, id_number,
              contact_number, email, status, registration_date
       FROM learners
       ORDER BY last_name, first_name`,
      []
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

---

## STEP 8 — JWT Authentication Middleware

Create: `miet-africa-backend/src/middleware/auth.js`

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    // Verify the token using your JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token expired or invalid. Please log in again.' });
  }
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

**Usage example:**
```javascript
// Only ADMIN and MANAGER can access this route
router.get('/reports', authenticateToken, requireRole('ADMIN', 'MANAGER'), handler);

// Only FACILITATOR can access this route
router.post('/attendance', authenticateToken, requireRole('FACILITATOR', 'ADMIN'), handler);
```

---

## STEP 9 — Folder Structure to Follow

```
miet-africa-backend/
├── .env                          ← Your database credentials (NEVER commit to GitHub)
├── .gitignore                    ← Must include .env
├── server.js                     ← Main entry point
├── package.json
└── src/
    ├── config/
    │   └── db.js                 ← PostgreSQL connection pool
    ├── middleware/
    │   └── auth.js               ← JWT authentication
    ├── routes/
    │   ├── auth.js               ← POST /api/auth/login, /logout
    │   ├── learners.js           ← GET/POST/PUT /api/learners
    │   ├── courses.js            ← GET/POST/PUT /api/courses
    │   ├── enrolments.js         ← GET/POST /api/enrolments
    │   ├── sessions.js           ← GET/POST /api/sessions
    │   ├── attendance.js         ← GET/POST /api/attendance
    │   ├── assessments.js        ← GET/POST /api/assessments
    │   ├── certificates.js       ← GET/POST/PUT /api/certificates
    │   ├── donations.js          ← GET/POST /api/donations
    │   └── reports.js            ← GET /api/reports/*
    └── utils/
        └── auditLog.js           ← Helper to write to audit_logs table

miet-africa-frontend/
├── .env                          ← REACT_APP_API_URL=http://localhost:5000/api
├── src/
│   ├── config/
│   │   └── api.ts                ← Axios instance with base URL
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Learners.tsx
│   │   ├── Courses.tsx
│   │   ├── Attendance.tsx
│   │   ├── Assessments.tsx
│   │   ├── Certificates.tsx
│   │   └── Reports.tsx
│   ├── components/
│   └── App.tsx
```

---

## STEP 10 — Start Both Servers

### Terminal 1 — Start the Node.js Backend

```bash
cd miet-africa-backend
npm run dev
# Should print:
# ✅ Connected to PostgreSQL — miet_africa_db
# 🚀 MIET Africa API running on http://localhost:5000
```

Add this to `package.json` scripts:
```json
"scripts": {
  "start": "node server.js",
  "dev":   "nodemon server.js"
}
```

### Terminal 2 — Start the React Frontend

```bash
cd miet-africa-frontend
npm start
# Opens http://localhost:3000 in your browser
```

### Test the connection

```bash
# In a third terminal — test the API is working
curl http://localhost:5000/api/health
# Should return: {"status":"MIET Africa API is running","timestamp":"..."}
```

---

## Quick Reference — API Endpoints to Build

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/auth/login` | Login | All |
| POST | `/api/auth/logout` | Logout | All |
| GET | `/api/learners` | List learners | Admin, Manager, Facilitator |
| POST | `/api/learners` | Register learner | Admin, Manager |
| GET | `/api/learners/:id` | Get learner profile | Admin, Manager, Facilitator |
| GET | `/api/courses` | List courses | All |
| POST | `/api/courses` | Create course | Admin |
| POST | `/api/enrolments` | Enrol learner | Admin, Manager |
| GET | `/api/sessions/:courseId` | Get sessions | All |
| POST | `/api/attendance` | Record attendance | Facilitator, Admin |
| POST | `/api/assessments` | Enter score | Facilitator, Admin |
| GET | `/api/certificates` | List certificates | All |
| POST | `/api/certificates` | Generate certificate | Admin, Manager |
| PUT | `/api/certificates/:id/approve` | Approve certificate | Admin, Manager |
| GET | `/api/reports/dashboard` | Dashboard stats | Admin, Manager |
| GET | `/api/reports/donor-impact` | Donor impact | Admin, Manager, Donor |
| GET | `/api/reports/attendance` | Attendance report | Admin, Manager, Facilitator |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED 5432` | PostgreSQL not running | Start PostgreSQL service in Windows Services |
| `password authentication failed` | Wrong password in `.env` | Check `DB_PASSWORD` in your `.env` file |
| `database "miet_africa_db" does not exist` | DB not created | Run `miet_africa_schema.sql` first |
| `CORS error` in browser | Wrong FRONTEND_URL | Check `FRONTEND_URL=http://localhost:3000` in `.env` |
| `JWT malformed` | Bad token | Clear `localStorage` in browser and log in again |
| `permission denied for table` | RLS blocking query | Make sure `SET app.user_role` is called before query |

---

## Summary

```
Your database is ready at:
  postgresql://postgres:YOUR_PASSWORD@localhost:5432/miet_africa_db

When you start building:
  1. Create miet-africa-backend/  → npm install express pg dotenv bcryptjs jsonwebtoken cors
  2. Create .env with the details above
  3. Create src/config/db.js with the Pool connection
  4. Create miet-africa-frontend/ → npx create-react-app --template typescript
  5. Create src/config/api.ts pointing to http://localhost:5000/api
  6. Run both servers — backend on :5000, frontend on :3000
```

---

*MIET Africa Youth Skills Centre Management Platform*  
*Database: miet_africa_db | PostgreSQL 18 | localhost:5432*
