# MERN Stack Project Setup

## Overview
This is a complete MERN (MongoDB, Express, React, Node.js) stack application with:
- **Express.js** backend with JWT authentication
- **React** frontend built with Vite for fast development
- **MongoDB** for persistent data storage
- **User authentication** system with bcryptjs password hashing
- **CORS** enabled for frontend-backend communication

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally or use Atlas connection string

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install           # Root dependencies
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure Environment**
   - Edit `server/.env` with your MongoDB URI
   - Default: `mongodb://localhost:27017/mern-app`

3. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or separately:
   npm run server    # Terminal 1: Backend on port 5000
   npm run client    # Terminal 2: Frontend on port 5173
   ```

### Access the Application
- Frontend: http://localhost:5173
- API: http://localhost:5000/api

## Project Structure

```
mern-app/
├── server/
│   ├── src/
│   │   ├── models/User.js
│   │   ├── routes/auth.js
│   │   ├── middleware/auth.js
│   │   └── index.js
│   ├── .env (configure here)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js
└── package.json
```

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Health
- `GET /api/health` - Server health check

## Next Steps

1. **Add More Models** - Create models in `server/src/models/`
2. **Add Routes** - Create routes in `server/src/routes/`
3. **Build Components** - Add React components in `client/src/components/`
4. **Connect Frontend** - Update App.jsx to use your API endpoints

## Important Notes

- ⚠️ Change `JWT_SECRET` in `.env` for production
- MongoDB must be running before starting the server
- Frontend auto-proxies `/api` calls to backend (see vite.config.js)
- Use `npm run build` to create production builds

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Verify connection string in `.env`

**Port Already in Use**
- Change ports in `.env` (backend) and `vite.config.js` (frontend)

**Module Not Found**
- Run `npm install` in both `/server` and `/client` directories

## Tech Stack Details

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 4 |
| Backend | Express.js + Node.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Build Tool | Vite |
