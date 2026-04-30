const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/authMiddleware');
const { generateMemberId } = require('../utils/idGenerator');

// ============================================================
// GET /api/members/me
// Get current logged-in member's full data
// ============================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, member_id, community, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Fetch address if exists
    const { data: address } = await supabase
      .from('member_address')
      .select('*')
      .eq('member_id', member.id)
      .single();

    // Fetch ID card if exists
    const { data: idCard } = await supabase
      .from('id_cards')
      .select('card_url, generated_at')
      .eq('member_id', member.id)
      .single();

    res.status(200).json({
      ...member,
      address: address || null,
      idCard: idCard || null,
      hasMembership: !!member.member_id,
    });
  } catch (err) {
    console.error('Get member error:', err);
    res.status(500).json({ error: 'Failed to fetch member data' });
  }
});

// ============================================================
// POST /api/members/complete-profile
// Save membership form (address, community) + generate member_id
// ============================================================
router.post('/complete-profile', authMiddleware, async (req, res) => {
  try {
    const {
      community,
      currentAddressLine1,
      currentAddressLine2,
      currentCity,
      currentState,
      currentPostal,
      permanentAddressLine1,
      permanentAddressLine2,
      permanentCity,
      permanentState,
      permanentPostal,
    } = req.body;

    // Validate required fields
    if (!community || !currentAddressLine1 || !currentCity || !currentState || !currentPostal) {
      return res.status(400).json({ error: 'Community and current address fields are required' });
    }

    if (!['Naidu', 'Other'].includes(community)) {
      return res.status(400).json({ error: 'Community must be Naidu or Other' });
    }

    const memberId = req.user.id;

    // Check if member already has a member_id
    const { data: member } = await supabase
      .from('members')
      .select('member_id, first_name, last_name, email, phone')
      .eq('id', memberId)
      .single();

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    let memberCode = member.member_id;

    // Generate new member_id if not yet assigned
    if (!memberCode) {
      memberCode = await generateMemberId();

      await supabase
        .from('members')
        .update({ community, member_id: memberCode })
        .eq('id', memberId);
    } else {
      // Update community only
      await supabase
        .from('members')
        .update({ community })
        .eq('id', memberId);
    }

    // Upsert address record
    const { error: addressError } = await supabase
      .from('member_address')
      .upsert({
        member_id: memberId,
        current_address_line1: currentAddressLine1.trim(),
        current_address_line2: currentAddressLine2?.trim() || null,
        current_city: currentCity.trim(),
        current_state: currentState.trim(),
        current_postal: currentPostal.trim(),
        permanent_address_line1: permanentAddressLine1?.trim() || currentAddressLine1.trim(),
        permanent_address_line2: permanentAddressLine2?.trim() || null,
        permanent_city: permanentCity?.trim() || currentCity.trim(),
        permanent_state: permanentState?.trim() || currentState.trim(),
        permanent_postal: permanentPostal?.trim() || currentPostal.trim(),
      }, { onConflict: 'member_id' });

    if (addressError) {
      console.error('Address upsert error:', addressError);
      return res.status(500).json({ error: 'Failed to save address' });
    }

    // Return full updated member data for ID card generation
    res.status(200).json({
      message: 'Membership profile completed successfully',
      memberId: memberCode,
      member: {
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        phone: member.phone,
        memberId: memberCode,
        community,
        city: currentCity.trim(),
        state: currentState.trim(),
      },
    });
  } catch (err) {
    console.error('Complete profile error:', err);
    res.status(500).json({ error: 'Failed to complete membership profile' });
  }
});

// ============================================================
// POST /api/members/save-idcard
// Save ID card URL to Supabase after frontend upload
// ============================================================
router.post('/save-idcard', authMiddleware, async (req, res) => {
  try {
    const { cardUrl } = req.body;
    const memberId = req.user.id;

    const { error } = await supabase
      .from('id_cards')
      .upsert({ member_id: memberId, card_url: cardUrl }, { onConflict: 'member_id' });

    if (error) {
      return res.status(500).json({ error: 'Failed to save ID card reference' });
    }

    res.status(200).json({ message: 'ID card saved successfully' });
  } catch (err) {
    console.error('Save ID card error:', err);
    res.status(500).json({ error: 'Server error saving ID card' });
  }
});

// ============================================================
// GET /api/members/profile
// Get member profile (for /member/profile page)
// ============================================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, member_id, community, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const { data: address } = await supabase
      .from('member_address')
      .select('*')
      .eq('member_id', member.id)
      .single();

    const { data: jobProfile } = await supabase
      .from('job_profiles')
      .select('id, work_experience_years, skills, updated_at')
      .eq('member_id', member.id)
      .single();

    const { data: advocate } = await supabase
      .from('advocates')
      .select('status, bar_council_id, submitted_at')
      .eq('member_id', member.id)
      .single();

    const { data: idCard } = await supabase
      .from('id_cards')
      .select('card_url, generated_at')
      .eq('member_id', member.id)
      .single();

    res.status(200).json({
      ...member,
      address: address || null,
      jobProfile: jobProfile || null,
      advocate: advocate || null,
      idCard: idCard || null,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================================
// GET /api/members/address
// Get member's address
// ============================================================
router.get('/address', authMiddleware, async (req, res) => {
  try {
    const { data: address, error } = await supabase
      .from('member_address')
      .select('*')
      .eq('member_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is no rows found
      return res.status(500).json({ error: 'Failed to fetch address' });
    }

    res.status(200).json(address || null);
  } catch (err) {
    console.error('Get address error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// GET /api/members/applications
// Get jobs the member has applied to
// ============================================================
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('id, status, job_posts(title, company_name)')
      .eq('member_id', req.user.id)
      .order('applied_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    res.status(200).json(applications);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
