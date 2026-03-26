import express from 'express';
import { supabase } from '../index.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get winners
router.get('/', async (req, res) => {
  try {
    const { data: winners, error } = await supabase
      .from('winners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(winners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my winnings
router.get('/my-winnings', authenticate, async (req, res) => {
  try {
    const { data: winnings, error } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(winnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Verify winner
router.patch('/:id/verify', adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { error } = await supabase
      .from('winners')
      .update({ verification_status: status, verified_at: new Date() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: `Winner ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
