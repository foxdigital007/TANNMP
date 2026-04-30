import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Briefcase, Shield, CreditCard, Users, Bell, Scale, ChevronDown, Phone, Mail, MapPin, ChevronRight, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

// ── Animated counter ──────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{inView ? count.toLocaleString() : 0}{suffix}</span>;
};

// ── Scroll reveal wrapper ─────────────────────────────────────
const Reveal = ({ children, direction = 'up', delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 40 : 0, x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, delay, ease: 'easeOut' } },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? 'visible' : 'hidden'} style={style}>
      {children}
    </motion.div>
  );
};

// ── FAQ Item ──────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E5E5E5', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} color="#C8102E" />
        </motion.div>
      </button>
      <motion.div animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} initial={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
        <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7, paddingBottom: 18 }}>{a}</p>
      </motion.div>
    </div>
  );
};

// ── Board member data ─────────────────────────────────────────
const boardMembers = [
  { name: 'Murugan Nadar', role: 'President', initials: 'MN' },
  { name: 'Selvi Ramasamy', role: 'Vice President', initials: 'SR' },
  { name: 'Karthik Pillai', role: 'Secretary General', initials: 'KP' },
  { name: 'Anitha Durai', role: 'Joint Secretary', initials: 'AD' },
  { name: 'Rajan Selvam', role: 'Treasurer', initials: 'RS' },
  { name: 'Priya Nadar', role: 'Executive Member', initials: 'PN' },
  { name: 'Balamurugan K', role: 'Executive Member', initials: 'BK' },
  { name: 'Kavitha Mani', role: 'Executive Member', initials: 'KM' },
];

const benefits = [
  { icon: Briefcase, title: 'Job Search Portal', desc: 'Exclusive access to jobs posted for TANNMP members.' },
  { icon: Scale, title: 'Advocate Network', desc: 'Connect with registered advocates for legal support.' },
  { icon: CreditCard, title: 'Digital ID Card', desc: 'Download your official TANNMP membership ID card.' },
  { icon: Users, title: 'Community Connect', desc: 'Be part of a thriving Tamil Nadu Nadar community.' },
  { icon: Bell, title: 'Priority Job Alerts', desc: 'Get notified first when new jobs are posted.' },
  { icon: Shield, title: 'Legal Aid Access', desc: 'Guidance and support for legal matters.' },
];

const faqs = [
  { q: 'Is TANNMP membership free?', a: 'Yes! Becoming a member of TANNMP is completely free. There are no hidden charges.' },
  { q: 'Who can join TANNMP?', a: 'Anyone from Tamil Nadu, especially from the Nadar community, can join. Others are welcome too.' },
  { q: 'How do I get my membership ID?', a: 'After signing up and completing your membership profile, a unique digital ID (e.g. TANNMP0001) is auto-generated and available for download.' },
  { q: 'How do I search for jobs?', a: 'After logging in and completing your membership, visit the Job Search page to view and apply for jobs.' },
  { q: 'How do advocates register?', a: 'After becoming a member, visit the Advocate page and submit your Bar Council ID for admin verification (within 24 hours).' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted and stored securely. Your contact info is never shared publicly.' },
];

// ── Home Page ─────────────────────────────────────────────────
const Home = () => {
  const [stats, setStats] = useState({ members: 0, jobs: 0, advocates: 0, cities: 0 });
  const carouselRef = useRef(null);

  useEffect(() => {
    // Fetch live stats — use plain axios so no auth redirect on public page
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/public/stats');
        setStats({
          members: res.data.totalMembers || 0,
          jobs: res.data.activeJobs || 0,
          advocates: 0,
          cities: 0,
        });
      } catch { /* silent — show 0 if unauthenticated */ }
    };
    fetchStats();

    // Auto-scroll carousel
    const el = carouselRef.current;
    if (!el) return;
    let paused = false;
    el.addEventListener('mouseenter', () => { paused = true; });
    el.addEventListener('mouseleave', () => { paused = false; });
    const interval = setInterval(() => {
      if (!paused && el) el.scrollLeft += 1;
      if (el && el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#F5F5F5' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D0A10 40%, var(--color-primary) 100%)',
        display: 'flex', alignItems: 'center',
      }}>
        {/* Parallax texture dots */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(226,27,35,0.12) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />


        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 80 }}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(226,27,35,0.2)', border: '1px solid rgba(226,27,35,0.3)', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Tamil Nadu Naidu NMP Portal</span>
            </motion.div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
              Empowering Tamil Nadu&apos;s{' '}
              <span style={{ color: 'var(--color-primary)' }}>Workforce</span> &amp;{' '}
              <span style={{ color: 'var(--color-gold)' }}>Legal Community</span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
              TANNMP connects job seekers with opportunities and members with verified advocates — all in one free platform built for the Naidu community.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/job-search"><button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>🔍 Find Jobs</button></Link>
              <Link to="/signup"><button className="btn btn-white" style={{ fontSize: 16, padding: '14px 32px' }}>✦ Become a Member — Free</button></Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={18} />
        </motion.div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)', padding: '0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
            {[
              { label: 'Total Members', value: stats.members },
              { label: 'Jobs Posted', value: stats.jobs },
              { label: 'Advocates Registered', value: stats.advocates },
            ].map(({ label, value }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ textAlign: 'center', padding: '48px 24px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    <Counter target={value} />
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8, fontWeight: 500 }}>{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT TANNMP ───────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <Reveal direction="left">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FEF2F2', borderRadius: 50, padding: '6px 16px', marginBottom: 20 }}>
                <Briefcase size={14} color="#C8102E" />
                <span style={{ fontSize: 12, color: '#C8102E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>For Job Seekers</span>
              </div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Find Your Next Opportunity</h2>
              <div className="divider" />
              <p style={{ fontSize: 15, color: '#737373', lineHeight: 1.8, marginTop: 16, marginBottom: 24 }}>
                TANNMP connects Tamil Nadu&apos;s workforce with curated job opportunities. Create a detailed profile, upload your resume, and apply to jobs posted specifically for our members.
              </p>
              {['Free job search access', 'Detailed job profiles', 'Resume upload & tracking', 'Experience-matched listings'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronRight size={12} color="#C8102E" />
                  </div>
                  <span style={{ fontSize: 14, color: '#525252' }}>{item}</span>
                </div>
              ))}
              <Link to="/job-search" style={{ display: 'inline-block', marginTop: 24 }}>
                <button className="btn btn-primary">Browse Jobs →</button>
              </Link>
            </Reveal>

            <Reveal direction="right">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFBEB', borderRadius: 50, padding: '6px 16px', marginBottom: 20 }}>
                <Scale size={14} color="#B8860B" />
                <span style={{ fontSize: 12, color: '#B8860B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>For Advocates</span>
              </div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Join the Advocate Network</h2>
              <div style={{ width: 60, height: 4, background: '#B8860B', borderRadius: 99, margin: '0 0 16px' }} />
              <p style={{ fontSize: 15, color: '#737373', lineHeight: 1.8, marginBottom: 24 }}>
                Are you a licensed advocate? Register with TANNMP and be discoverable to members who need legal guidance. Admin-verified in under 24 hours.
              </p>
              {['Bar Council ID verification', 'Admin approval within 24 hrs', 'Verified advocate badge', 'Community legal aid access'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ChevronRight size={12} color="#B8860B" />
                  </div>
                  <span style={{ fontSize: 14, color: '#525252' }}>{item}</span>
                </div>
              ))}
              <Link to="/advocate" style={{ display: 'inline-block', marginTop: 24 }}>
                <button className="btn" style={{ background: '#B8860B', color: 'white', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Register as Advocate →</button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── BOARD MEMBERS ──────────────────────────────────── */}
      <section className="section" style={{ background: '#F5F5F5', overflow: 'hidden' }}>
        <div className="container" style={{ marginBottom: 40 }}>
          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <h2 className="section-title">Our Board Members</h2>
              <p className="section-subtitle">The dedicated leadership driving TANNMP&apos;s mission</p>
            </div>
          </Reveal>
        </div>
        <div ref={carouselRef} style={{ display: 'flex', gap: 24, overflowX: 'hidden', padding: '8px 0 24px', userSelect: 'none', cursor: 'grab', WebkitOverflowScrolling: 'touch' }}>
          {[...boardMembers, ...boardMembers].map((member, i) => (
            <div key={i} style={{ flexShrink: 0, width: 220, background: 'white', borderRadius: 16, padding: 28, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #8B0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: 1 }}>
                {member.initials}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{member.name}</div>
              <div style={{ fontSize: 12, color: '#C8102E', fontWeight: 600 }}>{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="container" style={{ position: 'relative' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Membership Perks</span>
              <h2 className="section-title" style={{ color: 'white', marginTop: 8 }}>Why Become a Member?</h2>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '8px 24px', marginTop: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#FFD700' }}>🎉 IT&apos;S COMPLETELY FREE!</span>
              </div>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }} transition={{ duration: 0.25 }}
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/signup"><button className="btn btn-white" style={{ fontSize: 16, padding: '14px 40px' }}>Join Free Today →</button></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VIDEO ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">About Our Organization</h2>
              <p className="section-subtitle">Learn more about TANNMP&apos;s vision and mission</p>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #1A1A1A, #2D0A10)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ textAlign: 'center' }}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,16,46,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(200,16,46,0.5)' }}>
                  <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />
                </motion.div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>TANNMP Introduction Video</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT + FAQ ──────────────────────────────────── */}
      <section className="section" style={{ background: '#F5F5F5' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64 }}>
            {/* Contact */}
            <Reveal direction="left">
              <h2 className="section-title" style={{ marginBottom: 8 }}>Contact Us</h2>
              <div className="divider" style={{ marginBottom: 32 }} />
              {[
                { icon: Phone, label: 'Phone', lines: ['+91 98765 43210', '+91 91234 56789'] },
                { icon: Mail, label: 'Email', lines: ['support@tannmp.org', 'help@tannmp.org'] },
                { icon: MapPin, label: 'Address', lines: ['No. 12, Anna Nagar,', 'Chennai - 600 040, Tamil Nadu'] },
              ].map(({ icon: Icon, label, lines }, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 28, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color="#C8102E" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                    {lines.map((line, j) => <div key={j} style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{line}</div>)}
                  </div>
                </div>
              ))}
            </Reveal>

            {/* FAQ */}
            <Reveal direction="right">
              <h2 className="section-title" style={{ marginBottom: 8 }}>Frequently Asked Questions</h2>
              <div className="divider" style={{ marginBottom: 32 }} />
              {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
