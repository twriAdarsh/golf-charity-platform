-- Golf Charity Subscription Platform - Supabase Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  phone VARCHAR(20),
  country VARCHAR(2),
  password_reset_token VARCHAR(255),
  password_reset_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Charities Table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'monthly' or 'yearly'
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'pending'
  amount_cents INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  charity_id UUID REFERENCES charities(id),
  charity_percentage INTEGER DEFAULT 10, -- 10-100%
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  canceled_at TIMESTAMP
);

-- Golf Scores Table
CREATE TABLE golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score > 0 AND score <= 45), -- Stableford format
  score_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Draws Table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL UNIQUE,
  draw_type VARCHAR(50) NOT NULL, -- 'monthly', 'special'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'published', 'completed'
  draw_numbers VARCHAR(20) NOT NULL, -- e.g. "5,12,23,38,42"
  algorithm_type VARCHAR(50) DEFAULT 'random', -- 'random' or 'algorithm'
  total_subscribers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Winners Table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type INTEGER NOT NULL, -- 5, 4, or 3 (number matches)
  matched_numbers VARCHAR(20) NOT NULL,
  prize_amount_cents INTEGER NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  proof_image_url TEXT,
  payout_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payout_date TIMESTAMP,
  stripe_payout_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prize Pool Distribution Table
CREATE TABLE prize_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id),
  match_type INTEGER NOT NULL, -- 5, 4, 3
  pool_share_percentage INTEGER NOT NULL,
  total_pool_cents INTEGER NOT NULL,
  distributed_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charity Donations Table (tracking per user)
CREATE TABLE charity_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount_cents INTEGER NOT NULL,
  from_subscription BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'admin', 'moderator', 'financial_admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX idx_golf_scores_date ON golf_scores(score_date);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_winners_verification_status ON winners(verification_status);
CREATE INDEX idx_charity_donations_user_id ON charity_donations(user_id);
CREATE INDEX idx_charity_donations_charity_id ON charity_donations(charity_id);
CREATE INDEX idx_draws_status ON draws(status);
