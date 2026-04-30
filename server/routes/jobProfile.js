const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage (we'll upload to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// ============================================================
// GET /api/member/job-profile
// Fetch current member's job profile
// ============================================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('job_profiles')
      .select('*')
      .eq('member_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Fetch profile error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.status(200).json(profile || null);
  } catch (err) {
    console.error('Fetch profile server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/member/job-profile
// Create or Update job profile
// ============================================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const memberId = req.user.id;
    const profileData = {
      member_id: memberId,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      phone: req.body.phone,
      address_line1: req.body.addressLine1,
      address_line2: req.body.addressLine2,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      postal_code: req.body.postalCode,
      work_experience_years: parseInt(req.body.workExperienceYears) || 0,
      education: req.body.education || [],
      work_history: req.body.workHistory || [],
      skills: req.body.skills || [],
      resume_url: req.body.resumeUrl,
      resume_filename: req.body.resumeFilename
    };

    const { data, error } = await supabase
      .from('job_profiles')
      .upsert(profileData, { onConflict: 'member_id' })
      .select()
      .single();

    if (error) {
      console.error('Upsert profile error:', error);
      return res.status(500).json({ error: 'Failed to save profile' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Save profile server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/member/resume-upload
// Upload PDF to Supabase Storage
// ============================================
router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const memberId = req.user.id;
    const timestamp = Date.now();
    const fileName = `${memberId}/${timestamp}.pdf`;
    const filePath = `resumes/${fileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return res.status(500).json({ error: 'Failed to upload to storage' });
    }

    // Get public URL (if bucket is public) or a signed URL / internal path
    // Since we'll likely use our backend to serve or just store the path
    // Let's get the public URL if it's public, or just the path
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    res.status(200).json({
      url: urlData.publicUrl,
      filename: req.file.originalname
    });
  } catch (err) {
    console.error('Resume upload server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
