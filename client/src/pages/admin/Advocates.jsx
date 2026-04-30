import { useState, useEffect } from 'react';
import { Scale, Loader2, Check, X, Phone, Calendar, User } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const Advocates = () => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvocates();
  }, []);

  const fetchAdvocates = async () => {
    try {
      const res = await api.get('/api/admin/advocates?status=pending');
      setAdvocates(res.data.advocates || []);
    } catch (err) {
      console.error('Failed to fetch advocates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/api/admin/advocates/${id}/${action}`);
      toast.success(`Advocate ${action}ed successfully`);
      fetchAdvocates();
    } catch (err) {
      toast.error('Failed to update status');
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
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Advocates</h1>
          <p style={{ fontSize: 16, color: '#737373', margin: 0 }}>Review and approve advocate registrations.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
        {advocates.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Advocate</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Bar Council ID</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase' }}>Submitted</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#737373', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advocates.map((adv) => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{adv.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#737373' }}>
                        <Phone size={12} /> {adv.phone}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#525252' }}>{adv.bar_council_id}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#737373' }}>
                        <Calendar size={14} /> {new Date(adv.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button 
                          onClick={() => handleAction(adv.id, 'approve')}
                          style={{ padding: '8px 16px', background: '#ECFDF5', border: '1px solid #10B981', color: '#059669', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(adv.id, 'reject')}
                          style={{ padding: '8px 16px', background: '#FEF2F2', border: '1px solid #EF4444', color: '#DC2626', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#737373' }}>
            <Scale size={48} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>No pending advocates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advocates;
