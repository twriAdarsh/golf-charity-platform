# Golf Charity Subscription Platform

A full-stack web application that allows golfers to track their scores, participate in monthly draws, and support charities through subscription payments.

## 🎯 Project Overview

This is a **complete MERN stack** application with:
- **React + Vite** frontend for fast development and deployment
- **Express.js** backend with JWT authentication
- **Supabase PostgreSQL** for data storage
- **SendGrid** for transactional emails
- **Multi-charity support** with flexible subscription plans

## 📁 Project Structure

```
prd/
├── web/                           # React frontend (Vite)
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ScoresPage.jsx
│   │   │   ├── SubscriptionPage.jsx
│   │   │   ├── DrawsPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── styles/                # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── api/                           # Express.js backend
│   ├── src/
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── scores.js
│   │   │   ├── subscriptions.js
│   │   │   ├── draws.js
│   │   │   ├── admin.js
│   │   │   └── charities.js
│   │   ├── middleware/           # Auth, error handling
│   │   ├── utils/                # Utilities
│   │   │   └── emailService.js
│   │   └── index.js              # Entry point
│   ├── package.json
│   └── .env.example
│
└── package.json
```

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Modern UI with fast builds |
| **Backend** | Express.js | RESTful API |
| **Database** | Supabase PostgreSQL | Cloud data storage |
| **Authentication** | JWT + bcryptjs | Secure user auth |
| **Email** | SendGrid | Transactional emails |

## ⚙️ Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **Supabase account** for database
- **SendGrid account** for emails

## 📦 Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../web
npm install
```

### 2. Configure Environment Variables

#### Backend (api/.env):

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_role_key

# Authentication
JWT_SECRET=your_super_secret_key_change_in_production

# Email
SENDGRID_API_KEY=your_sendgrid_key
SENDER_EMAIL=noreply@golfcharity.com

# Server
NODE_ENV=development
PORT=3001
```

#### Frontend (web/.env.local):

```env
VITE_API_URL=http://localhost:3001
```

## 🏃 Running Locally

### Development Mode

```bash
# From root directory - starts both in parallel
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend (port 3001)
cd api && npm run dev

# Terminal 2 - Frontend (port 5173)
cd web && npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📚 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Golf Scores
- `POST /api/scores` - Add Stableford score (1-45)
- `GET /api/scores` - Get user's last 5 scores

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create subscription
- `GET /api/subscriptions` - List user subscriptions
- `POST /api/subscriptions/:id/cancel` - Cancel subscription

### Draws
- `GET /api/draws` - Get all draws
- `GET /api/winners` - Get winners

### Admin (protected)
- `POST /api/admin/draws` - Create draw
- `GET /api/admin/users` - List users
- `GET /api/admin/analytics` - Get metrics

### Charities
- `GET /api/charities` - List all charities

## 🎨 Features

### ✅ Implemented
- ✅ User authentication & JWT
- ✅ Golf score tracking (Stableford validation)
- ✅ Charity selection & subscriptions
- ✅ Monthly draw system with number matching
- ✅ Winner verification workflow
- ✅ Admin dashboard with analytics
- ✅ Email notifications (SendGrid)
- ✅ Responsive design (mobile-first)
- ✅ Role-based admin access
- ✅ Subscription management

### 🔄 Coming Soon
- Payment gateway integration
- Advanced analytics dashboard
- Mobile app

## 🔐 Security Notes

- ✅ Passwords hashed with bcryptjs
- ✅ JWT authentication secured
- ✅ Environment variables protected
- ✅ CORS configured
- ✅ Input validation on all endpoints
- ⚠️ Change JWT_SECRET for production
- ⚠️ Enable HTTPS in production

## 📱 Database Schema

### Tables
- **users** - User accounts & profiles
- **charities** - Charity information
- **scores** - Golf scores (Stableford)
- **subscriptions** - Subscription records
- **draws** - Monthly draw records
- **winners** - Draw winners & verification

## 🚀 Deployment

For detailed deployment instructions to production, refer to the step-by-step guide provided separately.

---

**Status**: Development & Testing Ready ✅
**Version**: 1.0
