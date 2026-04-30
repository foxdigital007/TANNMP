import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages — lazy imports for code splitting
import { lazy, Suspense } from 'react';

const Home       = lazy(() => import('./pages/Home'));
const Login      = lazy(() => import('./pages/Login'));
const Signup     = lazy(() => import('./pages/Signup'));
const About      = lazy(() => import('./pages/About'));
const JobSearch  = lazy(() => import('./pages/JobSearch'));
const Advocate   = lazy(() => import('./pages/Advocate'));
const Profile    = lazy(() => import('./pages/member/Profile'));

const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'));
const AdminMembers    = lazy(() => import('./pages/admin/Members'));
const AdminJobs       = lazy(() => import('./pages/admin/Jobs'));
const AdminAdvocates  = lazy(() => import('./pages/admin/Advocates'));
const AdminDiary      = lazy(() => import('./pages/admin/Diary'));

// Page-level loading fallback
const PageLoader = () => (
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#C8102E', secondary: 'white' },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* ── Public Routes ─────────────────────────── */}
              <Route path="/"       element={<Home />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about"  element={<About />} />

              {/* ── Protected Member Routes ───────────────── */}
              <Route path="/job-search" element={
                <ProtectedRoute><JobSearch /></ProtectedRoute>
              } />
              <Route path="/advocate" element={
                <ProtectedRoute><Advocate /></ProtectedRoute>
              } />
              <Route path="/member/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              {/* ── Protected Admin Routes ────────────────── */}
              <Route path="/admin" element={
                <AdminRoute><AdminDashboard /></AdminRoute>
              } />
              <Route path="/admin/members" element={
                <AdminRoute><AdminMembers /></AdminRoute>
              } />
              <Route path="/admin/jobs" element={
                <AdminRoute><AdminJobs /></AdminRoute>
              } />
              <Route path="/admin/advocates" element={
                <AdminRoute><AdminAdvocates /></AdminRoute>
              } />
              <Route path="/admin/diary" element={
                <AdminRoute><AdminDiary /></AdminRoute>
              } />

              {/* ── 404 ──────────────────────────────────── */}
              <Route path="*" element={
                <div style={{
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  <h1 style={{ fontSize: 80, fontWeight: 900, color: '#C8102E', lineHeight: 1 }}>404</h1>
                  <p style={{ fontSize: 18, color: '#737373' }}>Page not found</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
