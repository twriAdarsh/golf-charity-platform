# Separate User & Admin Login System - Implementation Guide

## Overview
The platform now has completely separate login flows for users (players) and admins, with role-based access control and distinct dashboards.

## Frontend Changes

### 1. Login Flow Architecture
```
/login → LoginChoicePage (👤 or 🛡️)
├── Player Login → /login/user → UserLoginPage
│   └── Success → /dashboard (DashboardPage)
└── Admin Login → /login/admin → AdminLoginPage
    └── Success → /admin (AdminPage)
```

### 2. New Pages Created
- **LoginChoicePage** (`web/src/pages/LoginChoicePage.jsx`)
  - Choice landing between Player and Admin
  - Beautiful card layout with icons and descriptions
  - Links to both login flows

- **UserLoginPage** (`web/src/pages/UserLoginPage.jsx`)
  - Player-specific login form
  - Validates user can only be regular 'user' role
  - Stores `userType: 'player'` in localStorage
  - Link to admin login for admins who mistakenly land here

- **AdminLoginPage** (`web/src/pages/AdminLoginPage.jsx`)
  - Admin-specific login form
  - Validates user MUST be 'admin' role
  - Stores `userType: 'admin'` in localStorage
  - Dark themed UI to distinguish from player portal
  - Link to player login for clarity

### 3. Updated App.jsx Routing
- `/login` → LoginChoicePage (new choice landing)
- `/login/user` → UserLoginPage (player login)
- `/login/admin` → AdminLoginPage (admin login)
- Player routes protected: Check `userType !== 'admin'`
- Admin routes protected: Check `userType === 'admin'`

### 4. Styling
- Created `LoginChoice.css` with gradient backgrounds
- Admin portal uses dark navy theme (`#1e293b`, `#334155`)
- Player portal uses purple gradient (`#667eea` → `#764ba2`)
- Responsive design for mobile

## Backend Changes

### 1. Database Schema Update
**Added to users table:**
```sql
role VARCHAR(20) DEFAULT 'user' -- 'user' or 'admin'
```

### 2. Auth Routes Updates
- Register endpoint now returns `role` field
- Login endpoint now returns `role` field
- Both endpoints default to `'user'` if role is null

### 3. New Admin Management Endpoints
```
GET /api/admin/admins
- Requires admin authentication
- Returns all admin users

POST /api/admin/promote-user/:userId
- Requires admin authentication
- Promotes a user to admin role
- Returns updated user object

POST /api/admin/demote-user/:userId
- Requires admin authentication
- Demotes an admin back to user role
- Returns updated user object
```

## User Experience

### Player Experience
1. Go to `/login`
2. Click "👤 Player Login" card
3. Enter credentials
4. Redirected to `/dashboard`
5. Access: Dashboard, Scores, Draws, Subscribe

### Admin Experience
1. Go to `/login`
2. Click "🛡️ Admin Login" card
3. Enter admin credentials
4. Redirected to `/admin`
5. Access: User Management, Analytics, Draw Management, Winners, Charities

### Protection Features
- Players cannot log in via admin portal (role validation)
- Admins cannot log in via player portal (role validation)
- Routes enforce `userType` from localStorage
- Attempting to access wrong portal redirects to correct login page

## Database Migration Should Include

```sql
-- Add role column to existing users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Set existing users as 'user' (optional, already default)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create first admin (run manually after migration)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Local Testing

### Create Test Accounts
1. Register player account: `player@test.com`
2. Set as admin by running direct SQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'player@test.com';
   ```
3. Now this account can login to `/login/admin`

### Test Flows
- Player login: `/login` → "Player Login" → `/login/user` → Success → `/dashboard`
- Admin login: `/login` → "Admin Login" → `/login/admin` → Success → `/admin`
- Wrong portal prevention: Admin tries player portal → Error "Only admin accounts..." → Redirects to `/login/admin`

## Security Considerations

✅ **Implemented:**
- Role-based access control on frontend
- Role validation on backend API
- Protected endpoints with `adminOnly` middleware
- UI separation prevents confusion
- Clear error messages for role mismatches

⚠️ **Still Required:**
- Enable Row Level Security (RLS) on Supabase
- Add backend middleware to enforce role for all admin routes
- Audit logging for admin actions
- Two-factor authentication for admin accounts

## Production Deployment

**Pre-Launch Checklist:**
- [ ] Database migration ran successfully
- [ ] At least one admin user created
- [ ] Admin credentials securely stored
- [ ] RLS policies implemented
- [ ] AUDIT table created for admin action logging
- [ ] Test admin login flow in production
- [ ] Test player cannot access admin routes
- [ ] Monitor deployment for auth errors

## Future Enhancements

1. **Role Management UI** in admin dashboard:
   - List all admin users
   - Promote/demote users to admin
   - View admin activity logs

2. **Multi-Factor Authentication**:
   - Required for admin logins
   - Optional for player accounts

3. **Session Management**:
   - Admin session timeout (shorter than players)
   - Login activity logging

4. **Audit Trail**:
   - Track all admin actions
   - Archive reports for compliance
