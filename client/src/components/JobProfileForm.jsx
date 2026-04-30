import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Briefcase, GraduationCap, Code, FileText, 
  Plus, Trash2, GripVertical, Check, AlertCircle, Loader2,
  X, Upload, File, ExternalLink, ChevronRight, ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const JobProfileForm = ({ initialData, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    workExperienceYears: 0,
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    city: '',
    postalCode: '',
    education: [{ id: Date.now(), institute_name: '', degree: '', area_of_study: '', graduation_year: '', currently_studying: false, grade_type: 'percentage', grade_value: '' }],
    workHistory: [],
    skills: [],
    resumeUrl: '',
    resumeFilename: ''
  });

  const [errors, setErrors] = useState({});
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Auto-fill email from token/user session if available
    const user = JSON.parse(localStorage.getItem('tannmp_user') || '{}');
    if (user.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }

    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        firstName: initialData.first_name || '',
        lastName: initialData.last_name || '',
        phone: initialData.phone || '',
        addressLine1: initialData.address_line1 || '',
        addressLine2: initialData.address_line2 || '',
        country: initialData.country || 'India',
        state: initialData.state || '',
        city: initialData.city || '',
        postalCode: initialData.postal_code || '',
        workExperienceYears: initialData.work_experience_years || 0,
        education: initialData.education || formData.education,
        workHistory: initialData.work_history || [],
        skills: initialData.skills || [],
        resumeUrl: initialData.resume_url || '',
        resumeFilename: initialData.resume_filename || ''
      });
    }
  }, [initialData]);

  // Section Progress Calculation
  const getProgress = () => {
    let completed = 0;
    if (formData.firstName && formData.lastName && formData.phone) completed += 20;
    if (formData.addressLine1 && formData.city && formData.postalCode) completed += 20;
    if (formData.education.length > 0 && formData.education[0].institute_name) completed += 20;
    if (formData.skills.length > 0) completed += 20;
    if (formData.resumeUrl) completed += 20;
    return completed;
  };

  const validateField = (name, value) => {
    let error = '';
    if (!value && name !== 'addressLine2' && name !== 'workHistory') {
      error = 'This field is required';
    }
    if (name === 'postalCode' && formData.country === 'India' && !/^\d{6}$/.test(value)) {
      error = 'Invalid 6-digit PIN code';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Education Handlers
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), institute_name: '', degree: '', area_of_study: '', graduation_year: '', currently_studying: false, grade_type: 'percentage', grade_value: '' }]
    }));
  };

  const removeEducation = (id) => {
    if (formData.education.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }));
  };

  const updateEducation = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Work History Handlers
  const addWork = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { id: Date.now(), company_name: '', job_title: '', employment_type: 'Full-Time', start_month: '', start_year: '', end_month: '', end_year: '', is_current: false, responsibilities: '' }]
    }));
  };

  const removeWork = (id) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter(item => item.id !== id)
    }));
  };

  const updateWork = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Skills Handlers
  const [skillInput, setSkillInput] = useState('');
  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (formData.skills.length >= 20) return;
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Resume Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Max file size is 10MB');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      const res = await axios.post('/api/member/job-profile/resume-upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${localStorage.getItem('tannmp_token')}` }
      });
      setFormData(prev => ({
        ...prev,
        resumeUrl: res.data.url,
        resumeFilename: res.data.filename
      }));
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.addressLine1 || !formData.city || !formData.postalCode) {
      toast.error('Please fill in all mandatory fields');
      // Shake animation effect could be added here
      return;
    }

    if (formData.education.length === 0 || !formData.education[0].institute_name) {
      toast.error('At least one education entry is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/member/job-profile', formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tannmp_token')}` }
      });
      toast.success('Job profile saved successfully!');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const getExpBadge = (years) => {
    if (years === 0) return { label: 'Fresher', color: '#737373', bg: '#F5F5F5' };
    if (years <= 2) return { label: 'Entry Level', color: '#2563EB', bg: '#EFF6FF' };
    if (years <= 5) return { label: 'Mid Level', color: '#CA8A04', bg: '#FEFCE8' };
    if (years <= 10) return { label: 'Senior', color: '#EA580C', bg: '#FFF7ED' };
    return { label: 'Expert', color: '#DC2626', bg: '#FEF2F2' };
  };

  const expBadge = getExpBadge(formData.workExperienceYears);

  return (
    <div className="job-profile-form" style={{ maxWidth: 900, margin: '0 auto', background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: 0, overflow: 'hidden' }}>
      
      {/* Top Header & Progress */}
      <div style={{ padding: '32px 40px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', marginBottom: 4 }}>Complete Your Profile</h1>
            <p style={{ color: '#737373' }}>Showcase your talent to the best employers</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>{getProgress()}% Completed</div>
            <div style={{ width: 150, height: 8, background: '#F5F5F5', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div animate={{ width: `${getProgress()}%` }} style={{ height: '100%', background: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 1, label: 'Personal', icon: User },
            { id: 2, label: 'Address', icon: MapPin },
            { id: 3, label: 'Education', icon: GraduationCap },
            { id: 4, label: 'Experience', icon: Briefcase },
            { id: 5, label: 'Skills', icon: Code },
            { id: 6, label: 'Resume', icon: FileText }
          ].map(s => (
            <button 
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 50, border: 'none',
                background: activeSection === s.id ? 'var(--color-primary)' : 'transparent',
                color: activeSection === s.id ? 'white' : '#737373',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap'
              }}
            >
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
        
        {/* SECTION 1: PERSONAL INFO */}
        <AnimatePresence mode='wait'>
          {activeSection === 1 && (
            <motion.div key="section1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Email (Read-only)</label>
                  <input type="email" value={formData.email} readOnly className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #F5F5F5', background: '#FAFAFA', color: '#737373', fontSize: 15 }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
              </div>

              <div style={{ background: '#F9FAFB', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <label style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Total Work Experience</label>
                  <span style={{ padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: expBadge.bg, color: expBadge.color }}>
                    {expBadge.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <input 
                    type="range" min="0" max="25" 
                    value={formData.workExperienceYears} 
                    onChange={e => setFormData(prev => ({ ...prev, workExperienceYears: parseInt(e.target.value) }))}
                    style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                  />
                  <div style={{ width: 80 }}>
                    <input 
                      type="number" value={formData.workExperienceYears} 
                      onChange={e => setFormData(prev => ({ ...prev, workExperienceYears: Math.min(25, Math.max(0, parseInt(e.target.value) || 0)) }))}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #E5E5E5', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                  <span style={{ fontWeight: 600, color: '#737373' }}>Years</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 2: ADDRESS */}
          {activeSection === 2 && (
            <motion.div key="section2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Address Line 1 *</label>
                  <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Address Line 2 (Optional)</label>
                  <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Country</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }}>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>State / Province *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Postal Code *</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15 }} required />
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 3: EDUCATION */}
          {activeSection === 3 && (
            <motion.div key="section3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {formData.education.map((edu, idx) => (
                  <motion.div key={edu.id} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #F0F0F0', padding: 24, position: 'relative' }}>
                    {formData.education.length > 1 && (
                      <button onClick={() => removeEducation(edu.id)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#FEF2F2', color: '#DC2626', width: 32, height: 32, borderRadius: 8, cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Institute Name *</label>
                        <input type="text" value={edu.institute_name} onChange={e => updateEducation(edu.id, 'institute_name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="e.g. Anna University" required />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Degree *</label>
                        <select value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }}>
                          <option value="">Select Degree</option>
                          <option value="B.E / B.Tech">B.E / B.Tech</option>
                          <option value="M.E / M.Tech">M.E / M.Tech</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="M.Sc">M.Sc</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Area of Study</label>
                        <input type="text" value={edu.area_of_study} onChange={e => updateEducation(edu.id, 'area_of_study', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Graduation Year</label>
                        <input type="number" value={edu.graduation_year} onChange={e => updateEducation(edu.id, 'graduation_year', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="YYYY" disabled={edu.currently_studying} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                        <input type="checkbox" checked={edu.currently_studying} onChange={e => updateEducation(edu.id, 'currently_studying', e.target.checked)} />
                        <label style={{ fontSize: 14, fontWeight: 600 }}>Currently Studying</label>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Grade / CGPA</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <select value={edu.grade_type} onChange={e => updateEducation(edu.id, 'grade_type', e.target.value)} style={{ width: 100, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 13 }}>
                            <option value="percentage">%</option>
                            <option value="cgpa">CGPA</option>
                          </select>
                          <input type="text" value={edu.grade_value} onChange={e => updateEducation(edu.id, 'grade_value', e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="e.g. 8.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button type="button" onClick={addEducation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', borderRadius: 16, border: '2px dashed #E5E5E5', background: 'transparent', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>
                  <Plus size={20} /> Add Another Education
                </button>
              </div>
            </motion.div>
          )}

          {/* SECTION 4: WORK EXPERIENCE */}
          {activeSection === 4 && (
            <motion.div key="section4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {formData.workHistory.map((work) => (
                  <motion.div key={work.id} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: 16, border: '1.5px solid #F0F0F0', padding: 24, position: 'relative' }}>
                    <button onClick={() => removeWork(work.id)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#FEF2F2', color: '#DC2626', width: 32, height: 32, borderRadius: 8, cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Company Name *</label>
                        <input type="text" value={work.company_name} onChange={e => updateWork(work.id, 'company_name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="e.g. Google India" required />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Job Title *</label>
                        <input type="text" value={work.job_title} onChange={e => updateWork(work.id, 'job_title', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }} placeholder="e.g. Senior Developer" required />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Employment Type</label>
                        <select value={work.employment_type} onChange={e => updateWork(work.id, 'employment_type', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 14 }}>
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Start Date</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={work.start_month} onChange={e => updateWork(work.id, 'start_month', e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 13 }}>
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input type="number" placeholder="YYYY" value={work.start_year} onChange={e => updateWork(work.id, 'start_year', e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 13 }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>End Date</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={work.end_month} onChange={e => updateWork(work.id, 'end_month', e.target.value)} disabled={work.is_current} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 13 }}>
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input type="number" placeholder="YYYY" value={work.end_year} onChange={e => updateWork(work.id, 'end_year', e.target.value)} disabled={work.is_current} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E5E5', fontSize: 13 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={work.is_current} onChange={e => updateWork(work.id, 'is_current', e.target.checked)} />
                        <label style={{ fontSize: 14, fontWeight: 600 }}>Currently Working</label>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#737373', marginBottom: 6, display: 'block' }}>Responsibilities (Optional)</label>
                        <textarea value={work.responsibilities} onChange={e => updateWork(work.id, 'responsibilities', e.target.value.slice(0, 500))} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid #E5E5E5', minHeight: 100, fontSize: 14, resize: 'vertical' }} placeholder="Max 500 characters..." />
                        <div style={{ textAlign: 'right', fontSize: 12, color: '#A3A3A3', marginTop: 4 }}>{work.responsibilities?.length || 0}/500</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button type="button" onClick={addWork} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', borderRadius: 16, border: '2px dashed #E5E5E5', background: 'transparent', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>
                  <Plus size={20} /> Add Work Experience
                </button>
              </div>
            </motion.div>
          )}

          {/* SECTION 5: SKILLS */}
          {activeSection === 5 && (
            <motion.div key="section5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Technical & Soft Skills</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Type skill and press Enter..." 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '1.5px solid #E5E5E5', fontSize: 15, outline: 'none' }}
                  />
                  <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3', fontSize: 12 }}>
                    {formData.skills.length}/20
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {formData.skills.map(skill => (
                  <motion.span 
                    key={skill} 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, background: '#EFF6FF', color: '#2563EB', fontSize: 14, fontWeight: 600, border: '1px solid #DBEAFE' }}
                  >
                    {skill}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* SECTION 6: RESUME */}
          {activeSection === 6 && (
            <motion.div key="section6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Upload Your Resume</label>
              
              {!formData.resumeUrl ? (
                <div 
                  onClick={() => document.getElementById('resume-file').click()}
                  style={{ border: '2px dashed #E5E5E5', borderRadius: 20, padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#E5E5E5'}
                >
                  <input type="file" id="resume-file" hidden accept=".pdf" onChange={handleResumeUpload} />
                  {uploading ? (
                    <div>
                      <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--color-primary)' }} />
                      <p style={{ fontWeight: 600 }}>Uploading to secure storage...</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Upload size={28} color="#737373" />
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Click to upload or drag and drop</p>
                      <p style={{ color: '#737373', fontSize: 14 }}>PDF (Max 10MB)</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ background: '#F9FAFB', borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #E5E5E5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      <File size={24} color="#DC2626" />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{formData.resumeFilename}</p>
                      <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        View Uploaded Resume <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, resumeUrl: '', resumeFilename: '' }))} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E5E5', background: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Replace
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Actions */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button" 
            disabled={activeSection === 1}
            onClick={() => setActiveSection(prev => prev - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '1.5px solid #E5E5E5', background: 'white', fontWeight: 700, cursor: activeSection === 1 ? 'not-allowed' : 'pointer', opacity: activeSection === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {activeSection < 6 ? (
            <button 
              type="button" 
              onClick={() => setActiveSection(prev => prev + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
            >
              Next Section <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 40px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 20px rgba(183, 15, 10, 0.2)' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
              {loading ? 'Saving Profile...' : 'Save Job Profile'}
            </button>
          )}
        </div>
      </form>

      <style>{`
        .form-input:focus {
          border-color: var(--color-primary) !important;
          outline: none;
          box-shadow: 0 0 0 4px rgba(183, 15, 10, 0.05);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default JobProfileForm;
