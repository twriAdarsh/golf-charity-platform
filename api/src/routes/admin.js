import express from 'express';
import { adminOnly } from '../middleware/auth.js';
import { supabase, upload } from '../index.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Admin: Get all users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get analytics
router.get('/analytics', adminOnly, async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total charity donations
    const { data: charityDonations } = await supabase
      .from('charity_donations')
      .select('amount_cents');

    const totalCharityAmount = charityDonations?.reduce((sum, d) => sum + d.amount_cents, 0) || 0;

    res.json({
      totalUsers,
      activeSubscriptions,
      totalCharityAmount: totalCharityAmount / 100, // convert to dollars
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create new draw
router.post('/draws', adminOnly, async (req, res) => {
  try {
    const { drawNumbers, drawMonth } = req.body;

    if (!drawNumbers || !Array.isArray(drawNumbers) || drawNumbers.length === 0) {
      return res.status(400).json({ error: 'Draw numbers array required' });
    }

    // Validate draw numbers (1-45 for Stableford)
    if (!drawNumbers.every(n => n >= 1 && n <= 45)) {
      return res.status(400).json({ error: 'Draw numbers must be between 1-45' });
    }

    // Get active subscribers
    const { count: totalSubscribers } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Create draw
    const { data: draw, error } = await supabase
      .from('draws')
      .insert([{
        draw_month: drawMonth || new Date().toISOString(),
        draw_numbers: drawNumbers.join(','),
        total_subscribers: totalSubscribers || 0,
        status: 'published'
      }])
      .select()
      .single();

    if (error) throw error;

    // Auto-match scores for existing subscribers
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (subscribers && subscribers.length > 0) {
      for (const sub of subscribers) {
        // Get user's last 5 scores
        const { data: scores } = await supabase
          .from('scores')
          .select('score')
          .eq('user_id', sub.user_id)
          .order('score_date', { ascending: false })
          .limit(5);

        if (scores && scores.length > 0) {
          const userScores = scores.map(s => s.score);
          const matches = drawNumbers.filter(n => userScores.includes(n));

          if (matches.length >= 3) {
            // Calculate prize based on match count
            const prizeTiers = {
              5: 50000, // 5 matches: $500
              4: 35000, // 4 matches: $350
              3: 25000  // 3 matches: $250
            };

            const prizeAmount = prizeTiers[matches.length] || 0;

            // Create winner record
            await supabase
              .from('winners')
              .insert([{
                draw_id: draw.id,
                user_id: sub.user_id,
                match_type: matches.length,
                matched_numbers: matches.join(','),
                prize_amount_cents: prizeAmount,
                verification_status: 'pending'
              }]);

            // Get user details for email
            const { data: user } = await supabase
              .from('users')
              .select('*')
              .eq('id', sub.user_id)
              .single();

            if (user) {
              await sendEmail(user.email, 'drawResults', {
                fullName: user.full_name,
                email: user.email,
                isWinner: true,
                matchCount: matches.length,
                prizeAmount: prizeAmount / 100,
                yourNumbers: userScores.slice(0, 5),
                drawNumbers: drawNumbers
              });
            }
          }
        }
      }
    }

    res.status(201).json({ draw, matchesProcessed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get draws
router.get('/draws', adminOnly, async (req, res) => {
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

// Admin: Delete draw (only if draft)
router.delete('/draws/:id', adminOnly, async (req, res) => {
  try {
    const { data: draw, error: queryError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (queryError || !draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    if (draw.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft draws' });
    }

    const { error: deleteError } = await supabase
      .from('draws')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;
    res.json({ message: 'Draw deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Upload proof image for winner verification
router.post('/winners/:id/upload-proof', adminOnly, upload.single('proofImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const winnerId = req.params.id;
    const fileName = `proof-${winnerId}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;

    // Upload file to Supabase storage
    const { data, error: uploadError } = await supabase
      .storage
      .from('winner-proofs')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('winner-proofs')
      .getPublicUrl(fileName);

    const proofImageUrl = publicUrlData?.publicUrl;

    // Update winner record with proof image URL
    const { data: updated, error: updateError } = await supabase
      .from('winners')
      .update({ proof_image_url: proofImageUrl })
      .eq('id', winnerId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Proof image uploaded successfully',
      proof_image_url: proofImageUrl,
      winner: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve winner payout
router.post('/winners/:id/approve', adminOnly, async (req, res) => {
  try {
    const { data: winner, error: queryError } = await supabase
      .from('winners')
      .select('*, users(*)')
      .eq('id', req.params.id)
      .single();

    if (queryError || !winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }

    // Update winner status
    const { data: updated, error: updateError } = await supabase
      .from('winners')
      .update({
        verification_status: 'approved',
        verified_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send winner notification
    if (winner.users) {
      await sendEmail(winner.users.email, 'winnerApproved', {
        fullName: winner.users.full_name,
        email: winner.users.email,
        prizeAmount: (winner.prize_amount_cents / 100).toFixed(2)
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Reject winner claim
router.post('/winners/:id/reject', adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;

    const { data: winner, error: queryError } = await supabase
      .from('winners')
      .select('*, users(*)')
      .eq('id', req.params.id)
      .single();

    if (queryError || !winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }

    // Update winner status
    const { data: updated, error: updateError } = await supabase
      .from('winners')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason || 'Does not meet criteria'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send rejection email
    if (winner.users) {
      await sendEmail(winner.users.email, 'winnerRejected', {
        fullName: winner.users.full_name,
        email: winner.users.email,
        reason: reason || 'Your claim did not pass verification'
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
