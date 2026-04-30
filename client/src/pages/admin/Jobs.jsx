import { useState, useEffect } from 'react';
import { Briefcase, Plus, Loader2, Trash2, MapPin, Building, Calendar, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    title: '',
    location: '',
    jobType: 'Full-time',
    jobDescription: '',
    minExperience: 0,
    maxExperience: 5,
    companyWhatsapp: '',
    companyEmail: '',
    salaryRange: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/api/admin/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job post?')) return;
    try {
      await api.delete(`/api/admin/jobs/${id}`);
      toast.success('Job post deleted');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/admin/jobs', form);
      toast.success('Job posted successfully');
      setShowModal(false);
      fetchJobs();
      setForm({
        companyName: '', title: '', location: '', jobType: 'Full-time',
        jobDescription: '', minExperience: 0, maxExperience: 5,
        companyWhatsapp: '', companyEmail: '', salaryRange: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Jobs</h1>
          <p style={{ fontSize: 16, color: '#737373', margin: 0 }}>Manage job postings for the community.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
        >
          <Plus size={18} /> Post New Job
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        {jobs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Job Post</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{job.title || 'Untitled Job'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#737373', marginTop: 4 }}>
                        <MapPin size={12} /> {job.location || 'Remote'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#525252' }}>
                        <Building size={14} color="#A3A3A3" /> {job.company_name}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ padding: '4px 10px', background: job.is_active ? '#ECFDF5' : '#F5F5F5', borderRadius: 50, fontSize: 12, fontWeight: 600, color: job.is_active ? '#059669' : '#737373' }}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        style={{ padding: '8px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#737373' }}>
            <Briefcase size={48} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>No job posts found.</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: 600, background: 'white', borderRadius: 20, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A' }}>Post New Job</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Company Name *</label>
                    <input required type="text" className="input-field" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Job Title *</label>
                    <input required type="text" className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Location *</label>
                    <input required type="text" className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Job Type</label>
                    <select className="input-field" value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Job Description *</label>
                  <textarea required rows={4} className="input-field" value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Min Experience (Years)</label>
                    <input type="number" className="input-field" value={form.minExperience} onChange={e => setForm({...form, minExperience: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Salary Range</label>
                    <input type="text" placeholder="e.g. 5LPA - 8LPA" className="input-field" value={form.salaryRange} onChange={e => setForm({...form, salaryRange: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Contact WhatsApp *</label>
                    <input required type="text" className="input-field" value={form.companyWhatsapp} onChange={e => setForm({...form, companyWhatsapp: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Contact Email *</label>
                    <input required type="email" className="input-field" value={form.companyEmail} onChange={e => setForm({...form, companyEmail: e.target.value})} />
                  </div>
                </div>

                <button disabled={submitting} type="submit" className="btn btn-primary" style={{ marginTop: 8, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Post Job Opportunity'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;
