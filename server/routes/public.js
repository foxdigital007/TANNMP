const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// GET /api/public/stats — No auth required (safe public counts only)
router.get('/stats', async (req, res) => {
  try {
    const [membersRes, advocatesRes, jobsRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_verified', true).not('member_id', 'is', null),
      supabase.from('advocates').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('job_posts').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    res.json({
      totalMembers: membersRes.count || 0,
      approvedAdvocates: advocatesRes.count || 0,
      activeJobs: jobsRes.count || 0,
      citiesCovered: 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
