import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Scale, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', to: '/admin', icon: Home },
    { label: 'Members', to: '/admin/members', icon: Users },
    { label: 'Jobs', to: '/admin/jobs', icon: Briefcase },
    { label: 'Advocates', to: '/admin/advocates', icon: Scale },
    { label: 'Personal Diary', to: '/admin/diary', icon: BookOpen },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside style={{
      width: 260,
      background: 'linear-gradient(180deg, #1A1A1A 0%, #2D0A10 100%)',
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      zIndex: 50,
    }}>
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--color-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>A</span>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'white', letterSpacing: 0.5 }}>Admin Panel</h2>
            <p style={{ fontSize: 12, color: 'var(--color-gold)', margin: 0, fontWeight: 600 }}>TANNMP Portal</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menuItems.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 10,
            color: isActive(to) ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
            background: isActive(to) ? 'rgba(255,237,0,0.1)' : 'transparent',
            fontWeight: isActive(to) ? 700 : 500,
            fontSize: 14,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '12px 16px', borderRadius: 10,
            background: 'rgba(226,27,35,0.1)', border: '1px solid rgba(226,27,35,0.2)',
            color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,27,35,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,27,35,0.1)'}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
