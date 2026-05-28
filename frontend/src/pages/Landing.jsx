import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidBackground from '../components/LiquidBackground';
import InteractiveSandbox from '../components/InteractiveSandbox';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../api/client';

export default function Landing({ initialDrawerOpen = false, initialAuthMode = 'login' }) {
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);
  const [authMode, setAuthMode] = useState(initialAuthMode); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const attemptAuth = async () => {
      if (authMode === 'register') {
        await apiRegister(username.trim(), password);
        await login(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    };

    try {
      await attemptAuth();
      navigate('/dashboard');
    } catch (err) {
      // 503 = backend cold start / DB not ready — auto-retry once after 3s
      if (err.response?.status === 503) {
        setError('⏳ Waking up the server, retrying in 3 seconds…');
        setTimeout(async () => {
          try {
            await attemptAuth();
            navigate('/dashboard');
          } catch (retryErr) {
            setError(retryErr.response?.data?.error || `${authMode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
          } finally {
            setLoading(false);
          }
        }, 3000);
        return; // don't hit finally yet
      }
      setError(err.response?.data?.error || `${authMode === 'login' ? 'Login' : 'Registration'} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* 1. Dynamic Liquid Canvas Backdrop */}
      <LiquidBackground />

      {/* 2. Top Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="font-bold text-2xl tracking-widest" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
          PRAXIS
        </div>
        <div className="flex gap-4">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => openAuth('login')} className="px-4 py-2 text-sm font-semibold hover:text-white transition" style={{ color: 'var(--text-sec)' }}>
                Log in
              </button>
              <button onClick={() => openAuth('register')} className="btn btn-primary btn-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="landing-hero flex-col text-center">
        <h1 className="landing-title">
          Tell it about your day.<br/>
          <span style={{ color: 'var(--primary-h)' }}>It figures out the rest.</span>
        </h1>
        <p className="landing-tagline">
          The first behavior and habit tracker powered by natural language AI. Drop the checkboxes and grids. Speak or type naturally, and Praxis gamifies your momentum.
        </p>
        {!user && (
          <button onClick={() => openAuth('register')} className="btn btn-primary btn-lg shadow-lg hover:-translate-y-1 transition-transform mb-12">
            Start Tracking Free
          </button>
        )}

        {/* 4. Interactive Sandbox Sandbox Playground */}
        <div className="w-full relative z-20">
          <InteractiveSandbox />
        </div>
      </section>

      {/* 5. Features & Comparison */}
      <section className="relative z-20 py-20 px-6 bg-surface border-t border-border mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-mono tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk' }}>Why Praxis?</h2>
            <p className="text-lg" style={{ color: 'var(--text-sec)' }}>Traditional trackers feel like chores. Praxis feels like a conversation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card p-8 rounded-2xl glass-panel relative">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold mb-3">Voice Logging</h3>
              <p style={{ color: 'var(--text-sec)' }}>Log your entire day hands-free using the Web Speech API. Just talk to Praxis while commuting.</p>
            </div>
            
            <div className="feature-card p-8 rounded-2xl glass-panel relative">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3">Zero Configuration</h3>
              <p style={{ color: 'var(--text-sec)' }}>No tedious forms or pre-defined habits. The AI contextually extracts goals, distractions, and productivity dynamically.</p>
            </div>
            
            <div className="feature-card p-8 rounded-2xl glass-panel relative">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold mb-3">Momentum Score</h3>
              <p style={{ color: 'var(--text-sec)' }}>Gamify your life with a rolling 0-100 Momentum Score and gorgeous heatmap streaks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="relative z-20 border-t border-border py-8 text-center" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-sec)' }}>
        <p className="font-semibold tracking-widest text-sm" style={{ fontFamily: 'Space Grotesk' }}>PRAXIS AI</p>
        <p className="text-xs mt-2 opacity-60">© 2026 Praxis. All rights reserved.</p>
      </footer>

      {/* 7. Auth Drawer Overlay */}
      {drawerOpen && !user && (
        <div className="auth-drawer-overlay">
          <div className="auth-drawer shadow-2xl relative">
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            
            <div className="font-bold text-2xl tracking-widest mb-10" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
              PRAXIS
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setError(''); }}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setError(''); }}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="p-3 text-sm rounded-lg border bg-danger/10 text-danger border-danger/20" style={{ color: 'var(--danger)', backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}>
                  {error}
                </div>
              )}
              
              <div>
                <label className="label" htmlFor="drawer-user">Username</label>
                <input
                  id="drawer-user"
                  className="input"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label" htmlFor="drawer-pass">Password</label>
                <input
                  id="drawer-pass"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg mt-4 justify-center" disabled={loading}>
                {loading ? <><span className="spinner"></span> Processing...</> : (authMode === 'login' ? 'Sign In →' : 'Create Account →')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
