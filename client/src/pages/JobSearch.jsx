import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobProfileForm from '../components/JobProfileForm';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Search, MapPin, Briefcase, IndianRupee, Loader2, Building, Edit3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BecomeMemberForm from '../components/BecomeMemberForm';

const JobSearch = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [jobProfile, setJobProfile] = useState(null);

  // Job application modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/api/member/job-profile');
      setJobProfile(res.data);
      if (!res.data) {
        setShowProfileForm(true);
      } else {
        setShowProfileForm(false);
        fetchJobs();
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/jobs');
      setJobs(res.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      await api.post('/api/jobs/apply', { jobId: selectedJob.id });
      toast.success('Successfully applied for this job!');
      setSelectedJob(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const title = job.title || '';
    const company = job.company_name || '';
    const loc = job.location || '';
    
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                       company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = loc.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchLocation;
  });

  const handleSaveSuccess = () => {
    fetchProfile();
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #1A1A1A, var(--color-primary))', borderBottom: '4px solid var(--color-gold)', paddingTop: 140, paddingBottom: 60, color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: 16, color: '#FFFFFF' }}>Find Your Next Role</h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600 }}>
                Exclusive job opportunities curated for TANNMP members. <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>Apply instantly.</span>
              </p>
            </div>
            
            {jobProfile && !showProfileForm && (
              <button 
                onClick={() => setShowProfileForm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14, backdropFilter: 'blur(10px)'
                }}
              >
                <Edit3 size={16} /> Edit My Job Profile
              </button>
            )}
          </div>

          {!showProfileForm && (
            <div style={{ display: 'flex', gap: 16, background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'white', borderRadius: 8, padding: '0 16px' }}>
                <Search size={20} color="#737373" />
                <input type="text" placeholder="Job title or company" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '16px', border: 'none', outline: 'none', fontSize: 15, color: '#1A1A1A' }} />
              </div>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: 'white', borderRadius: 8, padding: '0 16px' }}>
                <MapPin size={20} color="#737373" />
                <input type="text" placeholder="Location (e.g. Chennai)" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '16px', border: 'none', outline: 'none', fontSize: 15, color: '#1A1A1A' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ flex: 1, padding: '40px 0' }}>
        {profileLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 size={40} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#737373', fontWeight: 600 }}>Loading your preferences...</p>
          </div>
        ) : showProfileForm ? (
          <JobProfileForm initialData={jobProfile} onSaveSuccess={handleSaveSuccess} />
        ) : !user?.memberId && !user?.member_id ? (
          <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <IndianRupee size={32} color="#D97706" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', marginBottom: 12 }}>Membership Application</h2>
              <p style={{ fontSize: 16, color: '#737373', lineHeight: 1.6 }}>
                To unlock job applications, please complete your membership profile. You will receive your digital ID card instantly.
              </p>
            </div>
            
            <BecomeMemberForm />
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 size={40} className="animate-spin" color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#737373' }}>Loading matching opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 16, border: '1px solid #E5E5E5' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Briefcase size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>No jobs found</h3>
            <p style={{ color: '#737373', maxWidth: 400, margin: '0 auto' }}>We couldn&apos;t find any jobs matching your criteria. Try adjusting your search filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredJobs.map(job => (
              <motion.div key={job.id} whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>{job.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building size={14} /> {job.company_name}
                    </p>
                  </div>
                  <div style={{ padding: '4px 10px', background: '#F5F5F5', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#525252' }}>
                    {job.job_type}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#737373' }}>
                    <MapPin size={16} /> {job.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#737373' }}>
                    <Briefcase size={16} /> Min. {job.min_experience} years exp
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#737373' }}>
                    <IndianRupee size={16} /> {job.salary_range || 'Not Disclosed'}
                  </div>
                </div>

                <button onClick={() => setSelectedJob(job)} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'transparent', border: '1.5px solid #E5E5E5', color: '#1A1A1A' }}>
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── JOB DETAILS MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedJob(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} style={{ position: 'relative', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 25px 80px rgba(0,0,0,0.4)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>{selectedJob.title}</h2>
                  <p style={{ fontSize: 16, color: 'var(--color-primary)', fontWeight: 600 }}>{selectedJob.company_name}</p>
                </div>
                <div style={{ padding: '6px 14px', background: '#F5F5F5', borderRadius: 50, fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                  {selectedJob.job_type}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#525252' }}>
                  <MapPin size={18} color="#A3A3A3" /> {selectedJob.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#525252' }}>
                  <Briefcase size={18} color="#A3A3A3" /> Min. {selectedJob.min_experience} Yrs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#525252' }}>
                  <IndianRupee size={18} color="#A3A3A3" /> {selectedJob.salary_range || 'Not Disclosed'}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>Job Description</h3>
                <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selectedJob.job_description}</p>
              </div>

              <div style={{ marginBottom: 40 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>Required Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {selectedJob.skills_required && Array.isArray(selectedJob.skills_required) && selectedJob.skills_required.length > 0 ? (
                    selectedJob.skills_required.map((skill, i) => (
                      <span key={i} style={{ padding: '6px 14px', background: '#FEF2F2', color: 'var(--color-primary)', borderRadius: 50, fontSize: 13, fontWeight: 600 }}>{skill}</span>
                    ))
                  ) : (
                    <span style={{ color: '#737373', fontSize: 14 }}>No specific skills mentioned</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => setSelectedJob(null)} className="btn btn-white" style={{ flex: 1, border: '1.5px solid #E5E5E5' }}>Cancel</button>
                <button onClick={handleApply} className="btn btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: 8 }} disabled={applying}>
                  {applying && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  {applying ? 'Submitting Application...' : 'Apply Now'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default JobSearch;
