import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { IDCardDocument } from '../utils/idCard';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const BecomeMemberForm = ({ onComplete }) => {
  const { user, hasMembership, refreshUser } = useAuth();
  
  const [form, setForm] = useState({
    community: 'Naidu',
    currentAddressLine1: '',
    currentAddressLine2: '',
    currentCity: '',
    currentState: 'Tamil Nadu',
    currentPostal: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentAddressLine1 || !form.currentCity || !form.currentState || !form.currentPostal) {
      toast.error('Please fill all required address fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/members/complete-profile', form);
      await refreshUser();
      toast.success('Membership profile completed! You can now download your ID card.');
      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (hasMembership) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: 24, borderRadius: 12, textAlign: 'center' }}>
        <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>You are an Official Member!</h3>
        <p style={{ fontSize: 14, color: '#047857', marginBottom: 20 }}>Your Member ID is <strong>{user?.memberId || user?.member_id}</strong></p>
        
        <PDFDownloadLink 
          document={<IDCardDocument member={{
            firstName: user.firstName || user.first_name,
            lastName: user.lastName || user.last_name,
            community: user.community,
            city: user.address?.current_city || user.city,
            memberId: user.memberId || user.member_id
          }} />} 
          fileName={`TANNMP_ID_${user.memberId || user.member_id}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={pdfLoading}>
              {pdfLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
              {pdfLoading ? 'Preparing Document...' : 'Download ID Card PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group" style={{ marginBottom: 16 }}>
        <label className="input-label">Community *</label>
        <select name="community" value={form.community} onChange={handleChange} className="input-field" disabled={loading}>
          <option value="Naidu">Naidu</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Address</h3>
      
      <div className="input-group" style={{ marginBottom: 16 }}>
        <input type="text" name="currentAddressLine1" value={form.currentAddressLine1} onChange={handleChange} placeholder="Address Line 1 *" className="input-field" disabled={loading} />
      </div>
      <div className="input-group" style={{ marginBottom: 16 }}>
        <input type="text" name="currentAddressLine2" value={form.currentAddressLine2} onChange={handleChange} placeholder="Address Line 2 (Optional)" className="input-field" disabled={loading} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <input type="text" name="currentCity" value={form.currentCity} onChange={handleChange} placeholder="City *" className="input-field" disabled={loading} />
        <input type="text" name="currentPostal" value={form.currentPostal} onChange={handleChange} placeholder="Pincode *" className="input-field" disabled={loading} />
        <input type="text" name="currentState" value={form.currentState} onChange={handleChange} placeholder="State *" className="input-field" style={{ gridColumn: '1 / -1' }} disabled={loading} />
      </div>
      
      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Complete Profile & Get ID'}
      </button>
    </form>
  );
};

export default BecomeMemberForm;
