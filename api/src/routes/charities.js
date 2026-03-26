import express from 'express';
import { supabase } from '../index.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all charities
router.get('/', async (req, res) => {
  try {
    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .order('is_featured', { ascending: false });

    if (error) throw error;
    res.json(charities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured charities
router.get('/featured', async (req, res) => {
  try {
    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .limit(3);

    if (error) throw error;
    res.json(charities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create charity
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, description, logoUrl, website, isFeatured } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Charity name required' });
    }

    const { data: charity, error } = await supabase
      .from('charities')
      .insert([{
        name,
        description,
        logo_url: logoUrl,
        website,
        is_featured: isFeatured || false
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(charity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
