const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const multer = require('multer');

// Configure multer for complaint document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================================
// POST /api/public/complaints
// Raise a public complaint (no login required)
// ============================================================
router.post('/complaints', upload.single('document'), async (req, res) => {
  try {
    const { name, place, address, complaintType, description } = req.body;

    if (!name || !place || !address || !complaintType || !description) {
      return res.status(400).json({ error: 'All fields except document are mandatory' });
    }

    let documentUrl = null;
    let documentName = null;

    // Handle optional file upload
    if (req.file) {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `public/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('complaints')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error('Complaint document upload error:', uploadError);
        // We continue even if upload fails, but log it
      } else {
        const { data: urlData } = supabase.storage
          .from('complaints')
          .getPublicUrl(filePath);
        documentUrl = urlData.publicUrl;
        documentName = req.file.originalname;
      }
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        name,
        place,
        address,
        complaint_type: complaintType,
        description,
        document_url: documentUrl,
        document_name: documentName,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Save complaint error:', error);
      return res.status(500).json({ error: 'Failed to submit complaint' });
    }

    res.status(201).json({ message: 'Complaint submitted successfully', id: data.id });
  } catch (err) {
    console.error('Submit complaint server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
