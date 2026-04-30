const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const supabase = require('../lib/supabase');
const { sendOTPEmail } = require('../utils/mailer');
const { generateOTP, getOTPExpiry } = require('../utils/idGenerator');

// ============================================================
// POST /api/auth/signup
// Register a new member, hash password, send OTP
// ============================================================
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Password strength: minimum 8 characters
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('members')
      .select('id, is_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_verified) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      // Unverified account exists — resend OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();

      await supabase
        .from('members')
        .update({ otp, otp_expires_at: otpExpiry.toISOString() })
        .eq('id', existing.id);

      await sendOTPEmail(email.toLowerCase(), otp, firstName);

      return res.status(200).json({
        message: 'OTP resent to your email',
        userId: existing.id,
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create member record (unverified)
    const { data: newMember, error: insertError } = await supabase
      .from('members')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password_hash: passwordHash,
        otp,
        otp_expires_at: otpExpiry.toISOString(),
        is_verified: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Signup insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    // Send OTP email
    await sendOTPEmail(email.toLowerCase().trim(), otp, firstName.trim());

    res.status(201).json({
      message: 'Account created. Check your email (including spam) for the OTP.',
      userId: newMember.id,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ============================================================
// POST /api/auth/verify-otp
// Verify OTP and mark account as verified
// ============================================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('id, otp, otp_expires_at, is_verified')
      .eq('id', userId)
      .single();

    if (error || !member) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (member.is_verified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    // Check OTP expiry
    if (new Date() > new Date(member.otp_expires_at)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP match
    if (member.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified, clear OTP
    await supabase
      .from('members')
      .update({
        is_verified: true,
        otp: null,
        otp_expires_at: null,
      })
      .eq('id', userId);

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Server error during OTP verification' });
  }
});

// ============================================================
// POST /api/auth/resend-otp
// Resend OTP (only if not verified)
// ============================================================
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('id, email, first_name, is_verified')
      .eq('id', userId)
      .single();

    if (error || !member) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (member.is_verified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await supabase
      .from('members')
      .update({ otp, otp_expires_at: otpExpiry.toISOString() })
      .eq('id', userId);

    await sendOTPEmail(member.email, otp, member.first_name);

    res.status(200).json({ message: 'New OTP sent to your email (check spam folder)' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error while resending OTP' });
  }
});

// ============================================================
// POST /api/auth/login
// 1) Check admin credentials first (silent, no UI hint)
// 2) Then check Supabase members table
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ─── ADMIN CHECK (silent) ──────────────────────────────
    if (
      normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email: normalizedEmail, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        token,
        isAdmin: true,
        user: { email: normalizedEmail, firstName: 'Admin' },
      });
    }

    // ─── MEMBER CHECK ──────────────────────────────────────
    const { data: member, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, password_hash, is_verified, member_id, community')
      .eq('email', normalizedEmail)
      .single();

    if (error || !member) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!member.is_verified) {
      return res.status(401).json({
        error: 'Please verify your email before logging in',
        needsVerification: true,
        userId: member.id,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, member.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: member.id,
        email: member.email,
        isAdmin: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      isAdmin: false,
      user: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone,
        memberId: member.member_id,
        community: member.community,
        hasMembership: !!member.member_id,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
