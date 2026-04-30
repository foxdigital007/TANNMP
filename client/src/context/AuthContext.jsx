import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);  // true while restoring session

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('tannmp_token');
    const savedUser = localStorage.getItem('tannmp_user');
    const savedIsAdmin = localStorage.getItem('tannmp_is_admin');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAdmin(savedIsAdmin === 'true');
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem('tannmp_token');
        localStorage.removeItem('tannmp_user');
        localStorage.removeItem('tannmp_is_admin');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login: stores token + user in localStorage and state.
   */
  const login = useCallback((token, userData, adminFlag = false) => {
    localStorage.setItem('tannmp_token', token);
    localStorage.setItem('tannmp_user', JSON.stringify(userData));
    localStorage.setItem('tannmp_is_admin', String(adminFlag));
    setUser(userData);
    setIsAdmin(adminFlag);
  }, []);

  /**
   * Logout: clears all auth state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('tannmp_token');
    localStorage.removeItem('tannmp_user');
    localStorage.removeItem('tannmp_is_admin');
    setUser(null);
    setIsAdmin(false);
  }, []);

  /**
   * Refresh user data from the server.
   */
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/members/me');
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('tannmp_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  /**
   * Update specific fields in user state (e.g. after completing membership).
   */
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('tannmp_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    isAdmin,
    loading,
    isLoggedIn: !!user,
    hasMembership: !!(user?.memberId || user?.member_id),
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;
