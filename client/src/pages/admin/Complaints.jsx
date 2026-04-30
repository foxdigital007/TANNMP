import { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Calendar, MapPin, FileText, CheckCircle, Clock, ExternalLink, Loader2, User, Phone } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/api/admin/complaints');
      setComplaints(res.data.complaints || []);
      if (res.data.complaints?.length > 0 && !selected) {
        setSelected(res.data.complaints[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.patch(`/api/admin/complaints/${id}/status`, { status });
      toast.success('Status updated');
      setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
      setSelected({ ...selected, status });
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await api.delete(`/api/admin/complaints/${id}`);
      toast.success('Complaint deleted');
      const filtered = complaints.filter(c => c.id !== id);
      setComplaints(filtered);
      setSelected(filtered[0] || null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filtered = complaints.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.complaint_type.toLowerCase().includes(search.toLowerCase()) ||
    c.place.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} color="var(--color-primary)" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 24, padding: '0 0 24px' }}>
      
      {/* ── LEFT: INBOX LIST ──────────────────────────────── */}
      <div style={{ width: 400, background: 'white', borderRadius: 20, border: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #F5F5F5' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A', marginBottom: 16 }}>Complaints</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#A3A3A3" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              style={{ width: '100%', height: 40, padding: '0 12px 0 40px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 14 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length > 0 ? filtered.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelected(c)}
              style={{ 
                padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid #F9F9F9',
                background: selected?.id === c.id ? '#FEF2F2' : 'transparent',
                borderLeft: selected?.id === c.id ? '4px solid var(--color-primary)' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{c.name}</span>
                <span style={{ fontSize: 11, color: '#A3A3A3' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>{c.complaint_type}</div>
              <p style={{ fontSize: 13, color: '#737373', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                {c.description}
              </p>
            </div>
          )) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#A3A3A3' }}>
              <Mail size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>No complaints found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: DETAIL VIEW ───────────────────────────── */}
      <div style={{ flex: 1, background: 'white', borderRadius: 20, border: '1px solid #E5E5E5', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} key={selected.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Header Actions */}
              <div style={{ padding: '20px 32px', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={() => updateStatus(selected.id, selected.status === 'resolved' ? 'pending' : 'resolved')}
                    disabled={updating}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: selected.status === 'resolved' ? '#DCFCE7' : '#F3F4F6',
                      color: selected.status === 'resolved' ? '#166534' : '#4B5563',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {selected.status === 'resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    {selected.status === 'resolved' ? 'Resolved' : 'Mark as Resolved'}
                  </button>
                  <button onClick={() => deleteComplaint(selected.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ fontSize: 13, color: '#737373', fontWeight: 500 }}>Ref ID: {selected.id.split('-')[0].toUpperCase()}</div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                   <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <User size={24} color="#6B7280" />
                   </div>
                   <div>
                     <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>{selected.name}</h2>
                     <div style={{ display: 'flex', gap: 16, color: '#737373', fontSize: 13, marginTop: 4 }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {selected.phone || 'N/A'}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {selected.place}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(selected.created_at).toLocaleString()}</span>
                     </div>
                   </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 6, background: '#FEF2F2', color: 'var(--color-primary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
                    {selected.complaint_type}
                  </div>
                  <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 8, fontWeight: 600 }}>Address:</div>
                  <div style={{ fontSize: 15, color: '#1A1A1A', marginBottom: 24, padding: '12px 16px', background: '#F9FAFB', borderRadius: 10 }}>{selected.address}</div>
                  
                  <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 8, fontWeight: 600 }}>Description:</div>
                  <p style={{ fontSize: 16, color: '#1A1A1A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selected.description}</p>
                </div>

                {selected.document_url && (
                  <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 24 }}>
                    <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 12, fontWeight: 600 }}>Attached Document:</div>
                    <a 
                      href={selected.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 12,
                        background: '#F9FAFB', border: '1px solid #E5E5E5', color: '#1A1A1A', textDecoration: 'none',
                        fontSize: 14, fontWeight: 600, transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <FileText size={20} color="var(--color-primary)" />
                      {selected.document_name || 'View Attachment'}
                      <ExternalLink size={16} color="#A3A3A3" />
                    </a>
                  </div>
                )}
              </div>

            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A3A3A3' }}>
              <Mail size={64} style={{ marginBottom: 16, opacity: 0.2 }} />
              <p>Select a complaint to read the details</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Complaints;
