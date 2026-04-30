import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Shield, FileText, Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { IDCardDocument } from '../utils/idCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BecomeMemberForm from '../components/BecomeMemberForm';
import api from '../lib/api';
import toast from 'react-hot-toast';

const About = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      <Navbar />
      
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A1A, var(--color-primary))', paddingTop: 140, paddingBottom: 60, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: 16 }}>About TANNMP</h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto' }}>
          Tamil Nadu Naidu NMP Portal is dedicated to the growth, legal protection, and employment opportunities of the Naidu community.
        </p>
      </div>

      <div className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
          
          {/* ── ABOUT CONTENT ──────────────────────────────────────── */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 20 }}>Our Mission</h2>
            <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.8, marginBottom: 24 }}>
              At TANNMP, our core mission is to unify the Tamil Nadu Naidu workforce and legal professionals into a single, cohesive ecosystem. By offering free membership, we aim to eliminate barriers to opportunities and provide a safe space for career growth and legal advocacy.
            </p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Trust &amp; Verification</h3>
                <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6 }}>Every advocate and job listing is vetted to ensure our community receives authentic and reliable support.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Digital First</h3>
                <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6 }}>Instant digital ID cards, online job applications, and a paperless advocate registry.</p>
              </div>
            </div>
          </div>

          {/* ── MEMBERSHIP SECTION ────────────────────────────────── */}
          <div id="become-member" style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>Become a Member</h2>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Membership is free. Complete your profile to get your Official TANNMP ID Card.
            </p>

            {!isLoggedIn ? (
              <div style={{ background: '#F5F5F5', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 15, color: '#525252', marginBottom: 16, fontWeight: 500 }}>You must be logged in to become a member.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Link to="/login"><button className="btn btn-white" style={{ fontSize: 14, padding: '10px 24px', border: '1px solid #E5E5E5' }}>Log In</button></Link>
                  <Link to="/signup"><button className="btn btn-primary" style={{ fontSize: 14, padding: '10px 24px' }}>Sign Up</button></Link>
                </div>
              </div>
            ) : (
              <BecomeMemberForm />
            )}
          </div>
        </div>
      </div>
      
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default About;
