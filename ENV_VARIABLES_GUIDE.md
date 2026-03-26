# Production Environment Variables Reference

## Backend (.env - Production)

### What You Need to Get / Create

1. **Supabase**
   - Go to: https://supabase.com/dashboard
   - Select your production project
   - Settings → API → Project URL (copy as SUPABASE_URL)
   - Settings → API → Service Role secret key (copy as SUPABASE_SERVICE_ROLE_KEY)

2. **JWT Secret** (CREATE NEW)
   - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Use output as JWT_SECRET (must be NEW for production, not development key)

3. **SendGrid**
   - Go to: https://sendgrid.com/
   - Settings → API Keys → Create API Key
   - Copy as SENDGRID_API_KEY
   - Use noreply@golfcharity.app as SENDGRID_FROM_EMAIL (must be verified domain)

4. **Stripe**
   - Go to: https://dashboard.stripe.com/
   - Switch to Live Mode (top toggle)
   - Developers → API Keys → Copy Live Secret Key (sk_live_...)
   - Copy as STRIPE_SECRET_KEY
   - Get webhook secret from: Developers → Webhooks → create new endpoint
   - Copy as STRIPE_WEBHOOK_SECRET
   - Find product price IDs in: Products → Subscriptions
   - Copy IDs as STRIPE_PRICE_MONTHLY_ID and STRIPE_PRICE_YEARLY_ID

5. **Frontend URL**
   - Your Vercel production domain: https://your-golf-platform.vercel.app
   - Copy as FRONTEND_URL

6. **Port**
   - Leave as 5000 (or use Railway's default)

### Complete Production .env File

```env
# ===== SUPABASE (Production) =====
SUPABASE_URL=https://your-project-name.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-key...

# ===== JWT (CRITICAL: NEW KEY FOR PRODUCTION) =====
JWT_SECRET=your_new_production_secret_min_32_chars_generated_above

# ===== FRONTEND URL =====
FRONTEND_URL=https://your-golf-platform.vercel.app

# ===== PORT =====
PORT=5000

# ===== SENDGRID (Email Service) =====
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key...
SENDGRID_FROM_EMAIL=noreply@golfcharity.app

# ===== STRIPE (Payments - LIVE MODE ONLY) =====
STRIPE_SECRET_KEY=sk_live_your_actual_live_key...
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret...
STRIPE_PRICE_MONTHLY_ID=price_1234567890abcdefgh
STRIPE_PRICE_YEARLY_ID=price_0987654321abcdefgh

# ===== OPTIONAL: MONITORING =====
LOG_LEVEL=info
SENTRY_DSN=https://your.sentry.io...  # Optional error tracking
```

---

## Frontend (web/.env.production)

### Simple - Just One Variable

```env
VITE_API_URL=https://your-production-api-url
```

**Where to get the value:**
- If using Railway: `https://your-railway-app.up.railway.app`
- If using Render: `https://your-render-app.onrender.com`
- Must NOT include `/api` at the end (code adds it automatically)

---

## How to Deploy Environment Variables

### Railway (Backend)

1. Go to https://railway.app/dashboard
2. Select your production project
3. Click "Variables" tab
4. Paste each variable above into the form
5. Click "Deploy" to apply changes

### Vercel (Frontend)

1. Go to https://vercel.com/dashboard
2. Select your golf-platform project
3. Settings → Environment Variables
4. Add `VITE_API_URL` with your production API URL
5. Click "Save" and redeploy

---

## Verification Checklist

Run these after setting environment variables:

### Backend Health Check
```bash
curl https://your-production-api-url/api/health
# Should return: {"status":"Golf platform API running"}
```

### Frontend Smoke Test
1. Visit your frontend domain
2. Click Login
3. Check browser console (F12) for any errors
4. Verify API URL correct in network tab

### Payment Test
1. Login to Stripe dashboard
2. Use test card: 4242 4242 4242 4242
3. Attempt subscription
4. Should succeed and email sent

### Email Test
1. Register new account
2. Check your email for welcome
3. Verify no spam folder

---

## Common Issues & Solutions

### "CORS Error" or "API not reachable"
- Check FRONTEND_URL is correct in backend `.env`
- Check VITE_API_URL is correct in frontend `.env`
- Redeploy both after changing

### "Invalid JWT" or "token expired"
- Make sure new JWT_SECRET in backend
- All users need to re-login with new secret
- Clear browser localStorage and retry

### "Stripe payment declined"
- Check STRIPE_SECRET_KEY starts with `sk_live_`
- Verify webhook secret matches in Stripe dashboard
- Check live mode is ON in Stripe

### "Email not being sent"
- Check SendGRID_API_KEY is valid
- Verify SENDGRID_FROM_EMAIL is verified domain in SendGrid
- Check email templates exist in SendGrid

### "Database permission denied"
- Check SUPABASE_SERVICE_ROLE_KEY (NOT anon key)
- Verify it matches your Supabase project
- Check RLS policies if they're blocking operations

---

## Secret Management Best Practices

1. **Never commit .env files** - they has the main branch
2. **Use Platform Dashboards** - Railway/Vercel environment variable UI
3. **Rotate Secrets Quarterly** - generate new JWT_SECRET every 3 months
4. **Use Secure Vault** - 1Password, LastPass, or AWS Secrets Manager
5. **Audit Access** - who has access to production secrets?
6. **Alert on Rotation** - notify team when secrets change

---

## Monitoring Production

After deployment, monitor these dashboards:

- **Backend**: Railway dashboard → Deployments & Metrics
- **Frontend**: Vercel dashboard → Analytics & Deployments
- **Database**: Supabase dashboard → Realtime Charts
- **Errors**: Sentry dashboard (if configured)
- **Payments**: Stripe dashboard → Payments

---

**Next**: After configuring all environment variables, run the full testing checklist in PRODUCTION_DEPLOYMENT_CHECKLIST.md
