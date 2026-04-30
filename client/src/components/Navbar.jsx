import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, Briefcase, Scale, Info, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isLoggedIn, user, isAdmin, logout, hasMembership } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBecomeMember = () => {
    if (!isLoggedIn) {
      toast.error('Please login first to become a member');
      navigate('/login');
      return;
    }
    if (hasMembership) {
      toast.success('You already have an ID card!');
      navigate('/member/profile');
      return;
    }
    navigate('/job-search');
    setMobileOpen(false);
  };

  const [scrolled, setScrolled]         = useState(false);
  const [hidden, setHidden]             = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [aboutOpen, setAboutOpen]       = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const lastScrollY = useRef(0);
  const aboutRef    = useRef(null);
  const profileRef  = useRef(null);

  // Scroll behaviour — shrink + hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastScrollY.current && y > 80);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Job Search', to: '/job-search', icon: Briefcase },
    { label: 'Advocate', to: '/advocate', icon: Scale },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
        padding: scrolled ? '12px 0' : '20px 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img 
            src="/assets/logo.png" 
            alt="TANNMP Logo" 
            style={{ 
              height: scrolled ? 44 : 54, 
              transition: 'height 0.3s',
              filter: scrolled ? 'none' : 'drop-shadow(0 2px 10px rgba(0,0,0,0.2))'
            }} 
          />
          {!scrolled && (
            <span style={{
              fontSize: 22, fontWeight: 900, color: 'white',
              letterSpacing: '1px', fontFamily: 'Inter, sans-serif',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              TANNMP
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                padding: '8px 16px', borderRadius: 50,
                fontSize: 14, fontWeight: 600,
                color: isActive(to) ? 'var(--color-primary)' : scrolled ? '#1A1A1A' : 'white',
                background: isActive(to) ? 'rgba(200,16,46,0.08)' : 'transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = 'rgba(200,16,46,0.06)'; }}
              onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = 'transparent'; }}
            >
              {label}
            </Link>
          ))}

          {/* About Us dropdown */}
          <div ref={aboutRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 16px', borderRadius: 50, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'transparent',
                color: (isActive('/about') || aboutOpen) ? 'var(--color-primary)' : scrolled ? '#1A1A1A' : 'white',
                transition: 'all 0.2s',
              }}
            >
              About Us
              <motion.div animate={{ rotate: aboutOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence>
              {aboutOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    background: 'white', borderRadius: 12, minWidth: 200,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Link to="/about" onClick={() => setAboutOpen(false)}
                    style={{ display: 'block', padding: '12px 18px', fontSize: 14, color: '#1A1A1A', fontWeight: 500, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Info size={14} style={{ marginRight: 8, verticalAlign: 'middle', color: '#C8102E' }} />
                    About TANNMP
                  </Link>
                  <div style={{ height: 1, background: '#F0F0F0' }} />
                  <button onClick={handleBecomeMember}
                    style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', padding: '12px 18px', fontSize: 14, color: '#C8102E', fontWeight: 600, transition: 'background 0.15s', cursor: 'pointer', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    ✦ Become a Member
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Auth buttons or user avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="desktop-nav">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <button style={{
                  padding: '8px 20px', borderRadius: 50, border: `2px solid ${scrolled ? '#C8102E' : 'white'}`,
                  background: 'transparent', color: scrolled ? '#C8102E' : 'white',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px 6px 6px', borderRadius: 50,
                  border: '2px solid rgba(200,16,46,0.2)', background: 'white',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C8102E, #8B0000)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 13, fontWeight: 700,
                }}>
                  {(user?.firstName?.[0] || user?.first_name?.[0] || 'U').toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.firstName || user?.first_name || 'Member'}
                </span>
                <ChevronDown size={14} color="#737373" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'white', borderRadius: 12, minWidth: 180,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
                    }}
                  >
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', fontSize: 14, color: '#1A1A1A', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={15} color="#C8102E" /> Admin Panel
                      </Link>
                    ) : (
                      <Link to="/member/profile" onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', fontSize: 14, color: '#1A1A1A', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={15} color="#C8102E" /> My Profile
                      </Link>
                    )}
                    <div style={{ height: 1, background: '#F0F0F0' }} />
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 18px', fontSize: 14, color: '#EF4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-nav"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 8,
            color: scrolled ? '#1A1A1A' : 'white', borderRadius: 8,
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'white', borderTop: '1px solid #F0F0F0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 24px 20px' }}>
                <div key={to}>
                  {label === '✦ Become a Member' ? (
                    <button onClick={handleBecomeMember}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '12px 0',
                        fontSize: 15, fontWeight: 600, color: '#C8102E', borderBottom: '1px solid #F5F5F5'
                      }}
                    >
                      {label}
                    </button>
                  ) : (
                    <Link to={to}
                      style={{
                        display: 'block', padding: '12px 0',
                        fontSize: 15, fontWeight: 600,
                        color: isActive(to) ? '#C8102E' : '#1A1A1A',
                        borderBottom: '1px solid #F5F5F5',
                        transition: 'color 0.2s',
                      }}
                    >
                      {label}
                    </Link>
                  )}
                </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                {!isLoggedIn ? (
                  <>
                    <Link to="/login" style={{ flex: 1 }}>
                      <button style={{ width: '100%', padding: '10px', borderRadius: 50, border: '2px solid #C8102E', background: 'transparent', color: '#C8102E', fontWeight: 600, cursor: 'pointer' }}>Login</button>
                    </Link>
                    <Link to="/signup" style={{ flex: 1 }}>
                      <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Sign Up</button>
                    </Link>
                  </>
                ) : (
                  <button onClick={handleLogout} style={{ flex: 1, padding: '10px', borderRadius: 50, border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 600, cursor: 'pointer' }}>
                    Logout
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
