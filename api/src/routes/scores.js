import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../index.js';

const router = express.Router();

// Get user's last 5 scores
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new score
router.post('/', authenticate, async (req, res) => {
  try {
    const { score, scoreDate } = req.body;

    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1-45' });
    }

    // Get existing scores
    const { data: existingScores } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: false })
      .limit(5);

    // If 5 scores exist, delete the oldest
    if (existingScores && existingScores.length >= 5) {
      const oldestScore = existingScores[4];
      await supabase
        .from('golf_scores')
        .delete()
        .eq('id', oldestScore.id);
    }

    // Insert new score
    const { data: newScore, error } = await supabase
      .from('golf_scores')
      .insert([{
        user_id: req.user.id,
        score: parseInt(score),
        score_date: scoreDate || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
