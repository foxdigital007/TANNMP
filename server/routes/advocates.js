const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/advocates/register
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { barCouncilId } = req.body;
    const memberId = req.user.id;

    if (!barCouncilId) {
      return res.status(400).json({ error: 'Bar Council ID is required' });
    }

    const { data: member } = await supabase
      .from('members')
      .select('first_name, last_name, phone, member_id')
      .eq('id', memberId)
      .single();

    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (!member.member_id) {
      return res.status(400).json({ error: 'Please complete your membership profile first' });
    }

    const { data: existing } = await supabase
      .from('advocates')
      .select('id, status')
      .eq('member_id', memberId)
      .single();

    if (existing) {
      return res.status(409).json({
        error: 'You have already submitted an advocate registration',
        status: existing.status,
      });
    }

    const { error } = await supabase.from('advocates').insert({
      member_id: memberId,
      name: `${member.first_name} ${member.last_name}`,
      phone: member.phone,
      bar_council_id: barCouncilId.trim(),
      status: 'pending',
    });

    if (error) return res.status(500).json({ error: 'Failed to submit registration' });

    res.status(201).json({ message: 'Advocate registration submitted. Pending admin review.' });
  } catch (err) {
    console.error('Advocate register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/advocates/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('advocates')
      .select('status, bar_council_id, submitted_at, reviewed_at')
      .eq('member_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to fetch status' });
    }

    res.status(200).json({ advocate: data || null });
  } catch (err) {
    console.error('Advocate status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
