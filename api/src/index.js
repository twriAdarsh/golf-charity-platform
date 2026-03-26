import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Multer configuration for file uploads (MUST be before route imports)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import scoresRoutes from './routes/scores.js';
import drawRoutes from './routes/draws.js';
import charitiesRoutes from './routes/charities.js';
import winnersRoutes from './routes/winners.js';
import adminRoutes from './routes/admin.js';
import stripeWebhookRoutes from './utils/stripeWebhook.js';

// Stripe webhook (must be before express.json() for raw body)
app.use('/api/stripe', stripeWebhookRoutes);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://golf-charity-platform-572gegxe0-twriadarshs-projects.vercel.app',
  process.env.FRONTEND_URL
];

// Allow any vercel.app domain and any localhost variant
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
