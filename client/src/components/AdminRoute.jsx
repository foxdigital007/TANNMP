import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';

/**
 * Protects admin-only routes.
 * Redirects to /login if not authenticated.
 * Redirects to / if logged in but not admin.
 */
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid var(--color-gray-200)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)   return <Navigate to="/" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
      <AdminSidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '40px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default AdminRoute;
