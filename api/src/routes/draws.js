import express from 'express';
import { supabase } from '../index.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { generateRandomDraw } from '../utils/drawEngine.js';

const router = express.Router();

// Get draws
router.get('/', async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });

    if (error) throw error;
    res.json(draws);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create draw
router.post('/', adminOnly, async (req, res) => {
  try {
    const { drawMonth, algorithmType } = req.body;

    if (!drawMonth) {
      return res.status(400).json({ error: 'Draw month required' });
    }

    const drawNumbers = generateRandomDraw();

    const { data: draw, error } = await supabase
      .from('draws')
      .insert([{
        draw_month: drawMonth,
        draw_type: 'monthly',
        status: 'pending',
        draw_numbers: drawNumbers.join(','),
        algorithm_type: algorithmType || 'random'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(draw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Publish draw
router.post('/:id/publish', adminOnly, async (req, res) => {
  try {
    const { error } = await supabase
      .from('draws')
      .update({ status: 'published', published_at: new Date() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Draw published' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
