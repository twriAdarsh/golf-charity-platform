import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Routes
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import scoresRoutes from './routes/scores.js';
import drawRoutes from './routes/draws.js';
import charitiesRoutes from './routes/charities.js';
import winnersRoutes from './routes/winners.js';
import adminRoutes from './routes/admin.js';
import stripeWebhookRoutes from './utils/stripeWebhook.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe webhook (must be before express.json() for raw body)
app.use('/api/stripe', stripeWebhookRoutes);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://golf-charity-platform-ebon.vercel.app',
    'https://golf-charity-platform-ceao469ly-twriadarshs-projects.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Golf platform API running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charitiesRoutes);
app.use('/api/winners', winnersRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Golf Platform API running on http://localhost:${PORT}`);
});
