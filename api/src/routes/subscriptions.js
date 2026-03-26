import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../index.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Subscription plan details
const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 9.99,
    currency: 'USD',
    interval: 'month'
  },
  yearly: {
    name: 'Yearly Plan (Save 20%)',
    amount: 99.99,
    currency: 'USD',
    interval: 'year'
  }
};

// Get user subscriptions
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription checkout session (demo/placeholder for future payment integration)
router.post('/create-checkout', authenticate, async (req, res) => {
  try {
    const { plan_type, charity_id, charity_percentage } = req.body;

    if (!plan_type || !Object.keys(SUBSCRIPTION_PLANS).includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    // Get charity details
    const { data: charity } = await supabase
      .from('charities')
      .select('*')
      .eq('id', charity_id)
      .single();

    const planInfo = SUBSCRIPTION_PLANS[plan_type];

    // Create subscription record (demo - will be activated manually or via payment gateway)
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: req.user.id,
        plan_type: plan_type,
        status: 'demo_active',  // Demo mode - not a real payment
        amount_cents: Math.round(planInfo.amount * 100),
        charity_id: charity_id,
        charity_percentage: charity_percentage || 10,
        created_at: new Date().toISOString(),
        billing_cycle_start: new Date(),
        billing_cycle_end: new Date(Date.now() + (plan_type === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // Send subscription confirmation email
    if (user) {
      await sendEmail(user.email, 'subscriptionConfirmed', {
        fullName: user.full_name,
        email: user.email,
        charity: charity || { name: 'Selected Charity' },
        plan: plan_type
      });
    }

    res.status(201).json({
      success: true,
      subscription,
      message: `✅ Demo subscription activated! [${planInfo.name}]`,
      note: 'Payment gateway integration coming soon'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { data: subscription, error: queryError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (queryError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Update database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({ message: 'Subscription canceled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
