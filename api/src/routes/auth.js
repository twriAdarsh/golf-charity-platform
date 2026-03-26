import express from 'express';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        full_name: fullName
      }])
      .select()
      .single();

    if (error) throw error;

    // Send welcome email
    await sendEmail(newUser.email, 'welcome', {
      fullName: newUser.full_name,
      email: newUser.email
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email, fullName: newUser.full_name },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, fullName: user.full_name },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Generate reset token and send email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError || !user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({ 
        message: 'If an account exists with this email, a reset link has been sent' 
      });
    }

    // Generate secure token (32 bytes = 256 bits)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for storage (security: store hash, not plain token)
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry to 24 hours from now
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with reset token and expiry
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetTokenHash,
        password_reset_expiry: expiryTime.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Build reset link with plain token (token will be hashed on reset page)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email with reset link
    await sendEmail(user.email, 'passwordReset', {
      fullName: user.full_name,
      resetLink: resetLink
    });

    res.status(200).json({ 
      message: 'If an account exists with this email, a reset link has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset Password - Validate token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: 'Token, email, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError || !user) {
      return res.status(401).json({ error: 'Invalid email or token' });
    }

    // Hash the provided token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Verify token matches and hasn't expired
    if (user.password_reset_token !== resetTokenHash) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    if (new Date() > new Date(user.password_reset_expiry)) {
      return res.status(401).json({ error: 'Reset token has expired. Request a new one.' });
    }

    // Hash new password
    const passwordHash = await bcryptjs.hash(newPassword, 10);

    // Update password and clear reset token/expiry
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Send confirmation email
    await sendEmail(user.email, 'passwordResetConfirm', {
      fullName: user.full_name
    });

    res.status(200).json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
