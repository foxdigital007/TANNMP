const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/admin/stats
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [membersRes, advocatesRes, jobsRes, diaryRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('advocates').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('job_posts').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('admin_diary').select('*', { count: 'exact', head: true }),
    ]);
    res.json({
      totalMembers: membersRes.count || 0,
      pendingAdvocates: advocatesRes.count || 0,
      activeJobs: jobsRes.count || 0,
      diaryEntries: diaryRes.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/members?community=Nadar|Other
router.get('/members', adminMiddleware, async (req, res) => {
  try {
    const { community } = req.query;
    let query = supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, member_id, community, created_at, is_verified')
      .order('created_at', { ascending: false });

    if (community) query = query.eq('community', community);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to fetch members' });
    res.json({ members: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/members/:id - Full member detail
router.get('/members/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: member, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, member_id, community, created_at')
      .eq('id', id)
      .single();

    if (error || !member) return res.status(404).json({ error: 'Member not found' });

    const [addressRes, jobProfileRes, advocateRes, idCardRes] = await Promise.all([
      supabase.from('member_address').select('*').eq('member_id', id).single(),
      supabase.from('job_profiles').select('*').eq('member_id', id).single(),
      supabase.from('advocates').select('*').eq('member_id', id).single(),
      supabase.from('id_cards').select('*').eq('member_id', id).single(),
    ]);

    res.json({
      member,
      address: addressRes.data || null,
      jobProfile: jobProfileRes.data || null,
      advocate: advocateRes.data || null,
      idCard: idCardRes.data || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/jobs - All jobs WITH contact info
router.get('/jobs', adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .order('posted_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to fetch jobs' });
    res.json({ jobs: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/jobs
router.post('/jobs', adminMiddleware, async (req, res) => {
  try {
    const { companyName, jobDescription, minExperience, maxExperience, companyWhatsapp, companyEmail } = req.body;
    if (!companyName || !jobDescription || !companyWhatsapp || !companyEmail) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }
    const { data, error } = await supabase
      .from('job_posts')
      .insert({
        company_name: companyName.trim(),
        job_description: jobDescription.trim(),
        min_experience: parseInt(minExperience) || 0,
        max_experience: parseInt(maxExperience) || 25,
        company_whatsapp: companyWhatsapp.trim(),
        company_email: companyEmail.trim(),
      })
      .select('id')
      .single();
    if (error) return res.status(500).json({ error: 'Failed to create job post' });
    res.status(201).json({ message: 'Job post created', jobId: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/jobs/:id
router.put('/jobs/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, jobDescription, minExperience, maxExperience, companyWhatsapp, companyEmail, isActive } = req.body;
    const { error } = await supabase
      .from('job_posts')
      .update({
        company_name: companyName?.trim(),
        job_description: jobDescription?.trim(),
        min_experience: parseInt(minExperience),
        max_experience: parseInt(maxExperience),
        company_whatsapp: companyWhatsapp?.trim(),
        company_email: companyEmail?.trim(),
        is_active: isActive,
      })
      .eq('id', id);
    if (error) return res.status(500).json({ error: 'Failed to update job' });
    res.json({ message: 'Job updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('job_posts').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to delete job' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/advocates?status=pending|approved|rejected
router.get('/advocates', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('advocates')
      .select('id, name, phone, bar_council_id, status, submitted_at, reviewed_at, member_id')
      .order('submitted_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to fetch advocates' });
    res.json({ advocates: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/advocates/:id/approve
router.patch('/advocates/:id/approve', adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('advocates')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to approve' });
    res.json({ message: 'Advocate approved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/advocates/:id/reject
router.patch('/advocates/:id/reject', adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('advocates')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to reject' });
    res.json({ message: 'Advocate rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/diary/setup
router.post('/diary/setup', adminMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Diary password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(password, 12);
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key: 'diary_password', value: hash }, { onConflict: 'key' });
    if (error) return res.status(500).json({ error: 'Failed to set diary password' });
    res.json({ message: 'Diary password set successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/diary/has-password
router.get('/diary/has-password', adminMiddleware, async (req, res) => {
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'diary_password')
      .single();
    res.json({ hasPassword: !!data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/diary/unlock
router.post('/diary/unlock', adminMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'diary_password')
      .single();
    if (error || !data) return res.status(400).json({ error: 'Diary password not set' });
    const isValid = await bcrypt.compare(password, data.value);
    if (!isValid) return res.status(401).json({ error: 'Incorrect diary password' });
    res.json({ message: 'Diary unlocked', unlocked: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/diary
router.get('/diary', adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_diary')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: 'Failed to fetch diary' });
    res.json({ entries: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/diary
router.post('/diary', adminMiddleware, async (req, res) => {
  try {
    const { heading, detail } = req.body;
    if (!heading || !detail) return res.status(400).json({ error: 'Heading and detail are required' });
    const { data, error } = await supabase
      .from('admin_diary')
      .insert({ heading: heading.trim(), detail: detail.trim() })
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: 'Failed to add entry' });
    res.status(201).json({ entry: data });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/diary/:id
router.put('/diary/:id', adminMiddleware, async (req, res) => {
  try {
    const { heading, detail } = req.body;
    const { error } = await supabase
      .from('admin_diary')
      .update({ heading: heading?.trim(), detail: detail?.trim() })
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to update entry' });
    res.json({ message: 'Entry updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/diary/:id
router.delete('/diary/:id', adminMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from('admin_diary').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Failed to delete entry' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
