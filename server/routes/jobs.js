const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/authMiddleware');

// ============================================================
// GET /api/jobs
// Get active jobs, optionally filtered
// ============================================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('is_active', true)
      .order('posted_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/jobs/apply
// Apply for a job
// ============================================================
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.body;
    const memberId = req.user.id;

    // Check if job is active
    const { data: job, error: jobError } = await supabase
      .from('job_posts')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job || !job.is_active) {
      return res.status(404).json({ error: 'Job not found or no longer active' });
    }

    // Check if already applied
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('member_id', memberId)
      .single();

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Submit application
    const { error: applyError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        member_id: memberId,
        status: 'pending'
      });

    if (applyError) {
      return res.status(500).json({ error: 'Failed to submit application' });
    }

    res.status(200).json({ message: 'Successfully applied for job' });
  } catch (err) {
    console.error('Apply job error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
