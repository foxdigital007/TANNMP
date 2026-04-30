import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ─── Password strength meter ─────────────────────────────────
const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;
  return score;
};

const StrengthBar = ({ password }) => {
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: 4, flex: 1, borderRadius: 99,
            background: i <= strength ? colors[strength] : '#E5E5E5',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[strength], fontWeight: 600, marginTop: 4, display: 'block' }}>
        {labels[strength]}
      </span>
    </div>
  );
};

// ─── OTP Input (6 individual boxes) ─────────────────────────
const OTPInput = ({ value, onChange, disabled }) => {
  const inputRefs = useRef([]);
  const otpArray = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpArray];
    newOtp[index] = val;
    onChange(newOtp.join(''));
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {otpArray.map((digit, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 48, height: 56, textAlign: 'center',
            fontSize: 22, fontWeight: 700,
            border: `2px solid ${digit ? '#C8102E' : '#E5E5E5'}`,
            borderRadius: 10, outline: 'none',
            fontFamily: 'Inter, sans-serif',
            color: '#1A1A1A', background: digit ? '#FEF2F2' : 'white',
            transition: 'all 0.2s',
            caretColor: '#C8102E',
          }}
        />
      ))}
    </div>
  );
};

// ─── Countdown Timer ─────────────────────────────────────────
const CountdownTimer = ({ seconds, onComplete }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onComplete?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isWarning = remaining <= 60;

  return (
    <span style={{ fontWeight: 700, color: isWarning ? '#EF4444' : '#C8102E' }}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
};

// ─── Main Signup Component ────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Support coming from login page with pre-filled step
  const initialStep = location.state?.step || 1;
  const initialUserId = location.state?.userId || null;

  const [step, setStep] = useState(initialStep);
  const [userId, setUserId] = useState(initialUserId);
  const [loading, setLoading] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: location.state?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  // ── Step 1: Submit personal details ──────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim())   errs.firstName = 'First name is required';
    if (!form.lastName.trim())    errs.lastName  = 'Last name is required';
    if (!form.email.trim())       errs.email     = 'Email is required';
    if (!form.phone.trim())       errs.phone     = 'Phone number is required';
    if (!form.password)           errs.password  = 'Password is required';
    if (form.password.length < 8) errs.password  = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setUserId(res.data.userId);
      toast.success('OTP sent! Check your email (and spam folder)');
      setStep(2);
      setTimerKey(k => k + 1);
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      await api.post('/api/auth/verify-otp', { userId, otp });
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { userId });
      toast.success('New OTP sent! Check your email (and spam folder)');
      setOtp('');
      setTimerKey(k => k + 1);
      setCanResend(false);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Redirect after success ────────────────────────────────
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => navigate('/login'), 3500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const steps = ['Details', 'Verify Email', 'Account Created'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D0A10 50%, #1A1A1A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,27,35,0.12), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,27,35,0.08), transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 500,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20, padding: '40px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <img src="/assets/logo.png" alt="TANNMP Logo" style={{ height: 70 }} />
          </Link>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {steps.map((s, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600,
                color: i + 1 <= step ? '#1A1A1A' : '#A3A3A3',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{s}</span>
            ))}
          </div>
          <div style={{ height: 6, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: '#1A1A1A', borderRadius: 99 }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep1}
              noValidate
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Create Your Account</h2>
              <p style={{ fontSize: 13, color: '#737373', marginBottom: 24 }}>Join TANNMP — It&apos;s completely free!</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[['firstName', 'First Name', User], ['lastName', 'Last Name', User]].map(([name, label, Icon]) => (
                  <div className="input-group" key={name}>
                    <label className="input-label">{label} *</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                      <input type="text" name={name} value={form[name]} onChange={handleChange}
                        placeholder={label} className={`input-field ${errors[name] ? 'error' : ''}`}
                        style={{ paddingLeft: 36, fontSize: 14 }} disabled={loading} />
                    </div>
                    {errors[name] && <span className="input-error">⚠ {errors[name]}</span>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className={`input-field ${errors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 36 }} disabled={loading} />
                </div>
                {errors.email && <span className="input-error">⚠ {errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+91 98765 43210" className={`input-field ${errors.phone ? 'error' : ''}`}
                    style={{ paddingLeft: 36 }} disabled={loading} />
                </div>
                {errors.phone && <span className="input-error">⚠ {errors.phone}</span>}
              </div>

              {/* Password */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 8 characters" className={`input-field ${errors.password ? 'error' : ''}`}
                    style={{ paddingLeft: 36, paddingRight: 40 }} disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A3' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={form.password} />
                {errors.password && <span className="input-error">⚠ {errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A3A3A3' }} />
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password" className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                    style={{ paddingLeft: 36, paddingRight: 40 }} disabled={loading} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A3' }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="input-error">⚠ {errors.confirmPassword}</span>}
              </div>

              {errors.general && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
                  {errors.general}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: 48 }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending OTP...</> : 'Continue →'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#737373' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
              </p>
            </motion.form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP}
            >
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={28} color="#C8102E" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Check Your Email</h2>
                <p style={{ fontSize: 13, color: '#737373' }}>
                  We sent a 6-digit code to<br />
                  <strong style={{ color: '#1A1A1A' }}>{form.email}</strong>
                </p>
              </div>

              {/* OTP boxes */}
              <div style={{ marginBottom: 20 }}>
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              {/* Spam notice */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, padding: '10px 14px', marginBottom: 20, textAlign: 'center', fontSize: 12, color: '#92400E' }}>
                📬 Didn&apos;t receive it? Check your <strong>Spam / Junk folder</strong>
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: '#737373' }}>
                Code expires in{' '}
                <CountdownTimer key={timerKey} seconds={300} onComplete={() => setCanResend(true)} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6} style={{ width: '100%', height: 48, marginBottom: 12 }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying...</> : 'Verify OTP'}
              </button>

              <button type="button" onClick={handleResendOTP} disabled={!canResend || loading}
                style={{ width: '100%', height: 44, background: 'none', border: '1.5px solid #E5E5E5', borderRadius: 50, fontSize: 14, fontWeight: 600, color: canResend ? '#C8102E' : '#A3A3A3', cursor: canResend ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                Resend OTP {!canResend && '(wait for timer)'}
              </button>
            </motion.form>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ width: 80, height: 80, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
              >
                <CheckCircle size={44} color="#10B981" strokeWidth={2} />
              </motion.div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1A1A1A', marginBottom: 8 }}>
                Welcome to TANNMP! 🎉
              </h2>
              <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
                Your account has been created successfully.<br />
                Redirecting you to login...
              </p>
              <div style={{ width: '100%', height: 4, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, #C8102E, #10B981)', borderRadius: 99 }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Signup;
