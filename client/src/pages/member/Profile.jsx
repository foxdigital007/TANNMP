import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { User, MapPin, Download, Loader2, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { IDCardDocument } from '../../utils/idCard';

const Profile = () => {
  const { user, hasMembership, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [advocateStatus, setAdvocateStatus] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Fetch user's address if they have membership
      if (hasMembership) {
        const addressRes = await api.get('/api/members/address');
        setAddress(addressRes.data);
      }
      
      // Fetch user's job applications
      const jobsRes = await api.get('/api/members/applications');
      setJobs(jobsRes.data || []);
      
      // Fetch advocate status
      const advRes = await api.get('/api/advocates/status').catch(() => null);
      if (advRes && advRes.data) {
        setAdvocateStatus(advRes.data.status);
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
    }
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #1A1A1A, var(--color-primary))', paddingTop: 140, paddingBottom: 60, color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,237,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-gold)' }}>
              <User size={40} color="var(--color-gold)" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, marginBottom: 8 }}>{user?.firstName} {user?.lastName}</h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{user?.email}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>•</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{user?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ flex: 1, padding: '40px 0' }}>
        
        {/* ID Card Header (Always at the top) */}
        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5', textAlign: 'center', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', marginBottom: 20 }}>Membership ID Card</h2>
          {hasMembership ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: 24, borderRadius: 16, width: '100%', marginBottom: 24 }}>
                <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 18, color: '#047857', fontWeight: 800, margin: 0 }}>Official Verified Member</p>
                <p style={{ fontSize: 16, color: '#065F46', fontWeight: 600, margin: '8px 0 0' }}>Member ID: {user?.memberId || user?.member_id}</p>
              </div>
              <PDFDownloadLink 
                document={<IDCardDocument member={{
                  firstName: user.firstName || user.first_name,
                  lastName: user.lastName || user.last_name,
                  community: user.community,
                  city: address?.current_city || 'Tamil Nadu',
                  memberId: user.memberId || user.member_id
                }} />} 
                fileName={`TANNMP_ID_${user.memberId || user.member_id}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }} disabled={pdfLoading}>
                    {pdfLoading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                    {pdfLoading ? 'Generating PDF...' : 'Download My Digital ID Card'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 16, color: '#737373', marginBottom: 24 }}>Complete your membership application to receive your official digital ID card.</p>
              <Link to="/job-search">
                <button className="btn btn-primary" style={{ padding: '12px 32px' }}>Complete Application</button>
              </Link>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'start' }}>
          
          {/* Left Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Address Box */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={20} color="var(--color-primary)" /> Address Details
              </h2>
              {address ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 13, color: '#737373', marginBottom: 4 }}>City</p>
                    <p style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 600 }}>{address.current_city}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: '#737373', marginBottom: 4 }}>State</p>
                    <p style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 600 }}>{address.current_state}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: 13, color: '#737373', marginBottom: 4 }}>Address</p>
                    <p style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 500, lineHeight: 1.5 }}>{address.current_address_line1}</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#737373' }}>No address details found.</p>
              )}
            </div>

            {/* Job Applications */}
            <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 20 }}>Recent Applications</h2>
              {jobs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #F3F4F6' }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{app.job_posts.title}</p>
                        <p style={{ fontSize: 13, color: '#737373', margin: 0 }}>{app.job_posts.company_name}</p>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: app.status === 'pending' ? '#FEF3C7' : '#ECFDF5', color: app.status === 'pending' ? '#D97706' : '#059669' }}>
                        {app.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#737373' }}>You haven't applied to any jobs yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Advocate Status */}
            {advocateStatus && (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E5E5E5' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Advocate Status</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {advocateStatus === 'approved' ? <CheckCircle size={24} color="#10B981" /> : <Clock size={24} color="#D97706" />}
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0, textTransform: 'capitalize' }}>{advocateStatus}</p>
                    <p style={{ fontSize: 13, color: '#737373', margin: 0 }}>
                      {advocateStatus === 'approved' ? 'Verified Advocate' : 'Under Review'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Profile;
