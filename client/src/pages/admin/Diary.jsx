import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Lock, Unlock, Plus, Trash2, Calendar, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ heading: '', detail: '' });

  useEffect(() => {
    checkLockStatus();
  }, []);

  const checkLockStatus = async () => {
    try {
      const res = await api.get('/api/admin/diary/has-password');
      // If it has a password, we stay locked. If not, we could prompt for setup.
      // For now, let's just try to fetch entries. If it fails 401, it's locked.
      fetchEntries();
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get('/api/admin/diary');
      setEntries(res.data.entries || []);
      setIsLocked(false);
    } catch (err) {
      if (err.response?.status === 401) setIsLocked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlocking(true);
    try {
      await api.post('/api/admin/diary/unlock', { password });
      toast.success('Diary unlocked');
      fetchEntries();
    } catch (err) {
      toast.error('Incorrect password');
    } finally {
      setUnlocking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/admin/diary', form);
      toast.success('Entry added');
      setShowModal(false);
      setForm({ heading: '', detail: '' });
      fetchEntries();
    } catch (err) {
      toast.error('Failed to add entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/api/admin/diary/${id}`);
      toast.success('Entry deleted');
      fetchEntries();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #E5E5E5' }}>
          <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock size={32} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Diary Locked</h2>
          <p style={{ fontSize: 14, color: '#737373', marginBottom: 32 }}>Enter the master password to access your Personal Diary.</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="password" 
              placeholder="Master Password" 
              className="input-field" 
              style={{ textAlign: 'center', marginBottom: 16 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button disabled={unlocking} type="submit" className="btn btn-primary" style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {unlocking ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Unlock size={20} />}
              Unlock Diary
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Personal Diary</h1>
          <p style={{ fontSize: 16, color: '#737373', margin: 0 }}>Manage your private notes and administrative records.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {entries.length > 0 ? entries.map(entry => (
          <div key={entry.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Calendar size={16} color="#A3A3A3" />
                <span style={{ fontSize: 13, color: '#737373', fontWeight: 600 }}>{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>{entry.heading}</h3>
              <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{entry.detail}</p>
            </div>
            <button onClick={() => handleDelete(entry.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', padding: 8, cursor: 'pointer' }}>
              <Trash2 size={20} />
            </button>
          </div>
        )) : (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', padding: 60, textAlign: 'center' }}>
            <BookOpen size={48} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: '#737373' }}>No diary entries found. Start by adding a new one.</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'white', borderRadius: 20, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A1A' }}>Add Entry</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Heading / Title</label>
                  <input required type="text" className="input-field" value={form.heading} onChange={e => setForm({...form, heading: e.target.value})} placeholder="e.g. Important Meeting Notes" />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#525252', display: 'block', marginBottom: 6 }}>Details / Notes</label>
                  <textarea required rows={6} className="input-field" value={form.detail} onChange={e => setForm({...form, detail: e.target.value})} style={{ resize: 'none' }} placeholder="Enter case details or notes here..." />
                </div>
                <button disabled={submitting} type="submit" className="btn btn-primary" style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={20} />}
                  Save Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Diary;
