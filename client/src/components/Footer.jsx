import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#1A1A1A', color: 'white', paddingTop: 64 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img src="/assets/logo.png" alt="TANNMP" style={{ height: 50 }} />
              <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>TANNMP</span>
            </div>
            <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Tamil Nadu Naidu NMP Portal<br />
              Empowering the community through jobs, advocacy, and digital identity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Quick Links</h4>
            {[
              { label: 'Home', to: '/' },
              { label: 'Job Search', to: '/job-search' },
              { label: 'Advocate', to: '/advocate' },
              { label: 'About Us', to: '/about' },
              { label: 'Become a Member', to: '/about#become-member' },
              { label: 'Sign Up — Free!', to: '/signup' },
            ].map(({ label, to }) => (
              <Link key={to} to={to} style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Contact Us</h4>
            {[
              { icon: Phone, lines: ['+91 98765 43210', '+91 91234 56789'] },
              { icon: Mail, lines: ['support@tannmp.org', 'help@tannmp.org'] },
              { icon: MapPin, lines: ['No. 12, Anna Nagar', 'Chennai - 600 040, Tamil Nadu'] },
            ].map(({ icon: Icon, lines }, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(200,16,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={15} color="var(--color-primary)" />
                </div>
                <div>
                  {lines.map((line, j) => (
                    <p key={j} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.8 }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Membership CTA */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Membership</h4>
            <div style={{ background: 'linear-gradient(135deg, rgba(200,16,46,0.15), rgba(139,0,0,0.15))', border: '1px solid rgba(200,16,46,0.25)', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>It&apos;s 100% FREE!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Join the TANNMP community and get access to jobs, advocates, and your digital membership ID.
              </p>
              <Link to="/signup">
                <button className="btn btn-primary" style={{ width: '100%', fontSize: 13 }}>
                  Join Now — Free
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            © 2024 TANNMP — Tamil Nadu Naidu NMP Portal. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Use'].map(label => (
              <a key={label} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
