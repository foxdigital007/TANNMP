import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      const { token, isAdmin, user } = res.data;
      login(token, user, isAdmin);

      toast.success(`Welcome back, ${user.firstName || 'Admin'}!`);

      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      // Check if user needs to verify email
      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/signup', {
          state: {
            step: 2,
            userId: err.response.data.userId,
            email: form.email,
          },
        });
      } else {
        toast.error(msg);
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D0A10 50%, var(--color-primary) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,27,35,0.15), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -100,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,27,35,0.10), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '48px 40px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <img src="/assets/logo.png" alt="TANNMP Logo" style={{ height: 70 }} />
          </Link>
          <p style={{ fontSize: 13, color: '#737373', marginTop: 6 }}>
            Tamil Nadu Naidu NMP Portal
          </p>
          <div style={{
            marginTop: 24, textAlign: 'left',
          }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 14, color: '#737373' }}>Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: '#A3A3A3',
              }} />
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 40 }}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="input-error">⚠ {errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', color: '#A3A3A3',
              }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`input-field ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#A3A3A3',
                  padding: 0, display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="input-error">⚠ {errors.password}</span>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                fontSize: 13, color: '#DC2626',
              }}
            >
              {errors.general}
            </motion.div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', height: 48, fontSize: 15 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Sign up link */}
        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 14, color: '#737373',
        }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign Up — It&apos;s Free!
          </Link>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
