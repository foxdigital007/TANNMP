import { useState, useEffect } from 'react';
import { Users, Briefcase, Scale, Loader2 } from 'lucide-react';
import api from '../../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ fontSize: 16, color: '#737373', marginBottom: 32 }}>Welcome to the TANNMP Admin Panel.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        
        {/* Stat Card 1 */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E5E5E5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(226,27,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#737373', fontWeight: 600, margin: 0 }}>Total Members</p>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>{stats?.totalMembers || 0}</h3>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E5E5E5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,237,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} color="#D97706" />
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#737373', fontWeight: 600, margin: 0 }}>Active Jobs</p>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>{stats?.activeJobs || 0}</h3>
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E5E5E5', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={24} color="#059669" />
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#737373', fontWeight: 600, margin: 0 }}>Pending Advocates</p>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>{stats?.pendingAdvocates || 0}</h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
