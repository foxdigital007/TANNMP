import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Scale, ShieldCheck, Clock, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Advocate = () => {
  const { user, hasMembership } = useAuth();
  const [status, setStatus] = useState(null); // 'pending', 'approved', 'rejected', or null
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [barCouncilId, setBarCouncilId] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/advocates/status');
      if (res.data.status) {
        setStatus(res.data.status);
      }
    } catch (err) {
      // If 404, they haven't applied yet, which is fine
      if (err.response?.status !== 404) {
        toast.error('Failed to check advocate status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barCouncilId.trim()) {
      toast.error('Please enter your Bar Council ID');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/advocates/register', { barCouncilId });
      toast.success('Registration submitted for review');
      setStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #1A1A1A, var(--color-primary))', paddingTop: 140, paddingBottom: 60, color: 'white', textAlign: 'center' }}>
        <div className="container">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(184,134,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(184,134,11,0.4)' }}>
            <Scale size={40} color="var(--color-gold)" />
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: 16 }}>Advocate Network</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto' }}>
            Register as a verified legal professional to offer your services to the TANNMP community.
          </p>
        </div>
      </div>

      <div className="container" style={{ flex: 1, padding: '60px 0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader2 size={32} color="var(--color-gold)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#737373' }}>Loading status...</p>
            </div>
          ) : !hasMembership ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ShieldCheck size={28} color="var(--color-primary)" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 12 }}>Membership Required</h2>
              <p style={{ fontSize: 15, color: '#737373', marginBottom: 24, lineHeight: 1.6 }}>
                You must be an official TANNMP member before you can register as an advocate. Please complete your membership profile first.
              </p>
              <a href="/about#become-member">
                <button className="btn btn-primary" style={{ width: '100%' }}>Complete Profile</button>
              </a>
            </div>
          ) : status === 'pending' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Clock size={36} color="#D97706" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginBottom: 12 }}>Application Under Review</h2>
              <p style={{ fontSize: 15, color: '#B45309', marginBottom: 0, lineHeight: 1.6 }}>
                Your advocate registration has been received. Our admin team will verify your Bar Council ID and approve your profile within 24-48 hours.
              </p>
            </motion.div>
          ) : status === 'approved' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShieldCheck size={36} color="#059669" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#065F46', marginBottom: 12 }}>Verified Advocate</h2>
              <p style={{ fontSize: 15, color: '#047857', marginBottom: 0, lineHeight: 1.6 }}>
                Congratulations! You are officially verified as a TANNMP Advocate. Your profile is now visible to members seeking legal assistance.
              </p>
            </motion.div>
          ) : status === 'rejected' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={36} color="#DC2626" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#991B1B', marginBottom: 12 }}>Application Rejected</h2>
              <p style={{ fontSize: 15, color: '#B91C1C', marginBottom: 24, lineHeight: 1.6 }}>
                We were unable to verify your Bar Council ID. Please double-check your ID and try applying again.
              </p>
              <button onClick={() => setStatus(null)} className="btn btn-primary" style={{ width: '100%' }}>Re-apply Now</button>
            </motion.div>
          ) : (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Register Your Practice</h2>
              <p style={{ fontSize: 15, color: '#737373', marginBottom: 32 }}>
                Please provide your State Bar Council ID. Our admin team will verify it within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: 32 }}>
                  <label className="input-label">Bar Council ID / Enrollment Number *</label>
                  <input 
                    type="text" 
                    value={barCouncilId} 
                    onChange={e => setBarCouncilId(e.target.value)} 
                    placeholder="e.g. MS/1234/2018" 
                    className="input-field" 
                    disabled={submitting} 
                  />
                </div>

                <div style={{ background: '#F5F5F5', padding: 16, borderRadius: 12, marginBottom: 32 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', marginBottom: 8 }}>What happens next?</h4>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#525252', lineHeight: 1.7 }}>
                    <li>Admins will cross-check your ID with public records.</li>
                    <li>You will be notified upon approval.</li>
                    <li>Your contact details will be shared with verified members seeking aid.</li>
                  </ul>
                </div>

                <button type="submit" className="btn" style={{ width: '100%', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 8, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={submitting}>
                  {submitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Advocate;
