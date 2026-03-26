# Production Deployment Checklist - Golf Charity Subscription Platform

## 📋 Pre-Deployment Planning

### Infrastructure Resources
- [ ] **Backend Server**: Railway, Render, or AWS Lambda configured
- [ ] **Database**: Supabase PostgreSQL instance created
- [ ] **Frontend Hosting**: Vercel configured and linked to GitHub
- [ ] **Storage**: Supabase Storage bucket ('winner-proofs') created for proof images
- [ ] **CDN**: Cloudflare or similar configured for static assets

### Team & Access
- [ ] Production database credentials securely stored
- [ ] API keys and secrets in secure vault (1Password, Vault)
- [ ] Admin dashboard credentials for production
- [ ] Rollback procedures documented for each component

---

## 🔧 Backend Configuration

### Environment Variables (API/.env - PRODUCTION)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (CRITICAL: Use NEW strong secret for production)
JWT_SECRET=your_new_production_jwt_secret_min_32_chars

# Frontend URL (for CORS and email links)
FRONTEND_URL=https://your-production-domain.com

# Port Configuration
PORT=5000

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@golfcharity.app

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_MONTHLY_ID=price_1234567890abcdef
STRIPE_PRICE_YEARLY_ID=price_0987654321fedcba

# Optional: Logging & Monitoring
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

### Deployment Steps (Backend - Railway)
- [ ] Create new Railway project for production
- [ ] Set all environment variables in Railway dashboard
- [ ] Connect GitHub repository (main branch)
- [ ] Deploy and verify: `GET /api/health` returns 200
- [ ] Run database migrations: Deploy schema.sql to Supabase
- [ ] Test API endpoints from production URL
- [ ] Set up error logging with Sentry

### Database Setup (Supabase)
- [ ] Run `database/schema.sql` to create all tables
- [ ] Verify all 11 tables created:
  - [ ] users
  - [ ] subscriptions
  - [ ] scores
  - [ ] draws
  - [ ] winners
  - [ ] charities
  - [ ] charity_subscriptions
  - [ ] charity_donations
  - [ ] draw_matches
  - [ ] admin_users
  - [ ] payment_records
- [ ] Create 'winner-proofs' storage bucket in Supabase Storage
- [ ] Set storage bucket permissions (public read, authenticated write)
- [ ] Create database backups schedule (daily automated)
- [ ] Enable Row Level Security (RLS) on sensitive tables
- [ ] Test database connections from backend

### Security (Backend)
- [ ] Enable HTTPS only (no HTTP traffic)
- [ ] Set CORS origins strictly (production frontend URL only)
- [ ] Configure rate limiting: 100 req/min per IP
- [ ] Enable JWT token expiration: 7 days
- [ ] Hash and salt passwords (bcryptjs with 10 rounds - already implemented)
- [ ] Implement password reset token expiration: 24 hours
- [ ] Enable SQL injection prevention (Supabase handles this)
- [ ] Add request validation on all endpoints
- [ ] Implement request logging and monitoring
- [ ] Set up IP whitelisting if needed (for admin endpoints)

---

## 🎨 Frontend Configuration

### Environment Variables (web/.env.production)
```env
VITE_API_URL=https://your-production-api-url
```

### Deployment Steps (Frontend - Vercel)
- [ ] Create new Vercel project (link GitHub repo)
- [ ] Deploy from main branch only
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure production domain (custom domain if applicable)
- [ ] Build and deploy: `npm run build`
- [ ] Verify deployment: Visit production URL
- [ ] Test all auth flows (login, register, password reset)
- [ ] Test file uploads (proof images)
- [ ] Check responsive design on mobile and desktop
- [ ] Verify all API calls hit production backend

### Frontend Configuration
- [ ] Update all API base paths to production URL
- [ ] Verify email links in emails point to production domain
- [ ] Set analytics tracking (Google Analytics, Mixpanel)
- [ ] Configure error tracking (Sentry or Rollbar)
- [ ] Enable performance monitoring
- [ ] Test PWA features if applicable
- [ ] Verify service worker caching

### Security (Frontend)
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options)
- [ ] Implement CSRF token protection
- [ ] Enable secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Remove all console.log statements from production
- [ ] Test XSS protections

---

## 💳 Payment Integration (Stripe)

### Stripe Account Setup
- [ ] Upgrade Stripe account from Test to Live mode
- [ ] Add business information and verify account
- [ ] Enable Stripe webhooks for production domain
- [ ] Configure webhook events: `charge.succeeded`, `charge.failed`, `customer.subscription.updated`
- [ ] Test Stripe webhook delivery (use live Stripe dashboard)

### Stripe API Keys
- [ ] Generate new live Secret Key (sk_live_...)
- [ ] Add to backend .env as STRIPE_WEBHOOK_SECRET
- [ ] Store Stripe webhook signing secret securely
- [ ] Disable/delete test API keys from production

### Testing Stripe Integration
- [ ] Create basic test subscription (small amount)
- [ ] Verify payment webhook received and processed
- [ ] Check subscription status updated in database
- [ ] Verify email sent to user on subscription success
- [ ] Test payment failure scenario
- [ ] Test subscription cancellation
- [ ] Test subscription renewal

---

## 📧 Email Integration (SendGrid)

### SendGrid Setup
- [ ] Create SendGrid account and verify domain
- [ ] Add production domain to SendGrid (verify DKIM, SPF records)
- [ ] Generate SendGrid API key (live key)
- [ ] Add to backend .env as SENDGRID_API_KEY
- [ ] Create sender address (noreply@golfcharity.app)
- [ ] Create email templates in SendGrid for each template type

### Email Templates to Verify
- [ ] Welcome email (new registration)
- [ ] Subscription confirmed
- [ ] Password reset
- [ ] Password reset confirmation
- [ ] Draw results published
- [ ] Winner notification (approved)
- [ ] Winner notification (rejected)
- [ ] Payment failed
- [ ] Subscription renewed
- [ ] Subscription cancelled

### Testing Email Flow
- [ ] Send test email from API (no errors)
- [ ] Verify email received in inbox
- [ ] Check email formatting and links
- [ ] Test email on mobile clients (Gmail, Outlook, Apple Mail)
- [ ] Verify unsubscribe links work

---

## 🔐 Supabase Configuration

### Services & Features
- [ ] Enable Email/Password authentication
- [ ] Configure JWT expiration (matches backend config)
- [ ] Enable Google OAuth (optional for sign-in with Google)
- [ ] Enable storage bucket for proof images
- [ ] Configure storage bucket policies (public read, authenticated  write)

### Security (Supabase)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure RLS policies for users table (users can only see own data)
- [ ] Configure RLS policies for admin operations (admin only)
- [ ] Set up backup retention (30 days minimum)
- [ ] Enable point-in-time recovery
- [ ] Configure database firewall rules

### Supabase Keys
- [ ] Use Service Role Key only for backend (never expose to frontend)
- [ ] Use public Anon Key is safe for frontend
- [ ] Rotate keys every 90 days
- [ ] Store keys in secure environment variable manager

---

## 🏗️ Database Backup & Recovery

### Backup Strategy
- [ ] Enable automated daily backups in Supabase
- [ ] Store backups for minimum 30 days
- [ ] Test backup restoration process (do once weekly)
- [ ] Document recovery procedures

### Disaster Recovery Plan
- [ ] Document complete recovery steps
- [ ] Identify Recovery Time Objective (RTO): X hours
- [ ] Identify Recovery Point Objective (RPO): Most recent backup
- [ ] Store procedures in secure wiki/documentation

---

## 📊 Monitoring & Logging

### Error Tracking
- [ ] Set up Sentry for error tracking (both frontend and backend)
- [ ] Configure error notifications (email or Slack)
- [ ] Create error logging board for team

### Performance Monitoring
- [ ] Configure Google Analytics or Mixpanel
- [ ] Set up APM monitoring (New Relic or DataDog)
- [ ] Monitor API response times (target < 500ms)
- [ ] Monitor database query performance
- [ ] Set up alerts for slow queries (> 1s)

### Application Logs
- [ ] Enable backend request logging (all API calls)
- [ ] Log authentication attempts and failures
- [ ] Log payment-related operations
- [ ] Set log retention to 30 days minimum
- [ ] Create log aggregation dashboard

---

## 🧪 Production Testing Checklist

### User Registration & Login
- [  ] Register new user with valid email
- [ ] Register with duplicate email (should fail)
- [ ] Register with weak password (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Token generated and stored correctly
- [ ] Token persists after page refresh
- [ ] Logout clears token

### Password Reset
- [ ] Request password reset (valid email)
- [ ] Receive email with reset link
- [ ] Click reset link (valid token)
- [ ] Reset password with new credentials
- [ ] Login with new password (success)
- [ ] Request reset with invalid email (should not reveal)
- [ ] Attempt reset with expired token

### Subscription Flow
- [ ] View subscription plans on homepage
- [ ] Subscribe to monthly plan
- [ ] Receive subscription confirmation email
- [ ] Check subscription active in dashboard
- [ ] View subscription status and renewal date
- [ ] Cancel subscription
- [ ] Subscribe to yearly plan with discount

### Golf Score Entry
- [ ] Add single score (1-45 valid range)
- [ ] Add score outside valid range (should fail)
- [ ] Add 5 scores (full history)
- [ ] Add 6th score (oldest should be replaced)
- [ ] Display scores in reverse chronological order
- [ ] Edit existing score
- [ ] Delete score

### Draw System
- [ ] View published draw results
- [ ] Check own matched numbers against draw
- [ ] Verify prize calculation for different match tiers
- [ ] Admin: Create new draw
- [ ] Admin: Publish draw
- [ ] Admin: View all winners
- [ ] Check winner notification email received

### Winner Verification
- [ ] Submit proof image as winner
- [ ] Upload proof image to production
- [ ] Admin receives proof image in dashboard
- [ ] Admin approve winner claim
- [ ] Winner receives approval email
- [ ] Admin reject winner claim
- [ ] Winner receives rejection email with reason
- [ ] Approved winner marked as paid

### Charity System
- [ ] Select charity on registration
- [ ] View charity directory and profiles
- [ ] Change charity selection in dashboard
- [ ] View charity contribution percentage
- [ ] Admin: Add new charity
- [ ] Admin: View charity contribution totals
- [ ] Verify donation email sent

### Admin Dashboard
- [ ] Login as admin
- [ ] View analytics (total users, revenue, etc.)
- [ ] View all users
- [ ] Edit user profile
- [ ] View all subscriptions
- [ ] View payment status
- [ ] View all draws and results
- [ ] Create and run simulations
- [ ] View all winners and verification status
- [ ] View charity listings

### Mobile Responsiveness
- [ ] Test on iPhone 12/13/14/15
- [ ] Test on Android device
- [ ] Test on tablet (iPad, Galaxy Tab)
- [ ] All forms responsive and usable
- [ ] Navigation accessible on mobile
- [ ] Images load properly
- [ ] Touch interactions work smoothly
- [ ] No horizontal scrolling

### Performance
- [ ] Homepage loads < 2 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] API response time < 500ms
- [ ] Database queries < 1 second
- [ ] No console errors or warnings
- [ ] Lighthouse score > 80 (Performance)
- [ ] Core Web Vitals passing

### Security Testing
- [ ] HTTPS enforced (no HTTP redirect not working)
- [ ] Cannot access admin pages without auth
- [ ] Cannot access user dashboard without auth
- [ ] JWT token validation working
- [ ] Expired tokens properly rejected
- [ ] Passwords properly hashed (can't see in DB)
- [ ] Sensitive data not leaked in API responses
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized

---

## 🚀 Go-Live Procedure

### Final Checks (24 Hours Before Launch)
- [ ] All tests passing
- [ ] All critical features working
- [ ] Performance benchmarks met
- [ ] No P0/P1 bugs remaining
- [ ] Database backups verified
- [ ] Monitoring and alerting configured
- [ ] Team trained on monitoring dashboard

### Launch Day
- [ ] Notify team 1 hour before launch
- [ ] Do final smoke test on production
- [ ] Monitor error tracking and performance
- [ ] Monitor payment processing (first transactions)
- [ ] Have rollback plan ready (within 30 min response time)
- [ ] Monitor user signups and registrations
- [ ] Check support emails for issues

### First Week Monitoring
- [ ] Daily review of error logs
- [ ] Monitor payment success/failure rates
- [ ] Check email delivery rates
- [ ] Review user feedback
- [ ] Monitor database performance
- [ ] Check storage usage growth
- [ ] Verify automated tasks (draws, notifications) run

---

## 📱 Post-Launch (Week 1-4)

### Ongoing Monitoring
- [ ] Weekly backup restoration tests
- [ ] Weekly performance reviews
- [ ] Monthly security audit
- [ ] Review and optimize slow queries

### Features to Monitor
- [ ] Payment success rate (target > 99%)
- [ ] Email delivery rate (target > 95%)
- [ ] API uptime (target > 99.9%)
- [ ] Database uptime (target > 99.9%)
- [ ] Average API response time
- [ ] Error rate (target < 0. 1%)

### Scaling Considerations
- [ ] Monitor database size growth
- [ ] Implement caching if needed
- [ ] Consider CDN for images
- [ ] Set up auto-scaling for backend if on cloud

---

## 🔄 Maintenance Checklist

### Weekly
- [ ] Review error logs
- [ ] Check uptime metrics
- [ ] Verify backups completed
- [ ] Review support emails

### Monthly
- [ ] Security patch updates
- [ ] Dependency updates for critical CVEs
- [ ] Performance review and optimization
- [ ] Database maintenance (VACUUM, ANALYZE)

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Capacity planning review

---

## ⚠️ Critical Pre-Launch Verifications

**MUST COMPLETE BEFORE LAUNCH:**
- [ ] All sensitive passwords changed from defaults
- [ ] JWT_SECRET is NEW and strong (min 32 chars)
- [ ] No .env files committed to GitHub
- [ ] No API keys logged in application code
- [ ] All CORS origins configured correctly
- [ ] Database credentials not exposed
- [ ] Admin default credentials changed
- [ ] HTTPS certificate valid
- [ ] All external APIs (Stripe, SendGrid) verified working
- [ ] Payment webhooks receiving events
- [ ] Email sending verified end-to-end
- [ ] Database migration tested and successful
- [ ] Backups enabled and tested
- [ ] Error tracking configured
- [ ] Monitoring alerts set up

---

## 📞 Support & Escalation

### 24/7 Monitoring
- [ ] Set up PagerDuty or OnCall rotation
- [ ] Define escalation procedures
- [ ] Create runbooks for common issues
- [ ] Set up Slack/email alerts

### Incident Response
- [ ] Document incident procedures
- [ ] Post-mortem process defined
- [ ] Root cause analysis template
- [ ] Communication plan for outages

---

## 🎯 Success Criteria

**Platform is ready for production and considered successful when:**
1. ✅ All core features tested and working
2. ✅ No critical or high-severity bugs
3. ✅ Performance targets met
4. ✅ Security checks completed
5. ✅ Monitoring and alerts configured
6. ✅ Backup and recovery procedures verified
7. ✅ Team trained and prepared
8. ✅ All environment variables configured
9. ✅ Database schema deployed
10. ✅ Third-party integrations verified

---

**Last Updated**: March 26, 2026
**Status**: Ready for deployment preparation
**Deployment Target**: Q2 2026
