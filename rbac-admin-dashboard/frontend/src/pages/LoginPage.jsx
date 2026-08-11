import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ROLES = [
  { label: 'Super Admin', email: 'super@rbac.dev',   color: '#ef4444', icon: '👑', desc: 'Full system access' },
  { label: 'Admin',       email: 'admin@rbac.dev',   color: '#f59e0b', icon: '🔧', desc: 'User management' },
  { label: 'Manager',     email: 'manager@rbac.dev', color: '#6366f1', icon: '📋', desc: 'Team oversight' },
  { label: 'Staff',       email: 'staff@rbac.dev',   color: '#10b981', icon: '💼', desc: 'Assigned modules' },
  { label: 'Viewer',      email: 'viewer@rbac.dev',  color: '#64748b', icon: '👁️', desc: 'Read-only access' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Admin@123');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'Admin@123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.15), transparent), #070b14',
    }}>
      {/* Left Panel — Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'rgba(99,102,241,0.04)',
        borderRight: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '440px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', marginBottom: '28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>🔐</div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '16px' }}>
            RBAC Admin<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dashboard
            </span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px' }}>
            Enterprise-grade Role-Based Access Control with granular permission management, real-time audit logging, and secure JWT authentication.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🛡️', title: '5 Built-in Roles', desc: 'Super Admin → Viewer permission hierarchy' },
              { icon: '🔑', title: '15 Granular Permissions', desc: 'Per-module access control with user overrides' },
              { icon: '📋', title: 'Full Audit Trail', desc: 'Every action logged with actor, target, and status' },
              { icon: '🔒', title: 'JWT + bcrypt Auth', desc: 'Secure token-based authentication' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{f.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{ width: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px', color: 'var(--danger)', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-control"
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} className="form-control"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required style={{ paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}>
            {loading ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Signing in…</> : '→ Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Quick-Login */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Quick Demo Logins</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', grid: 'auto / 1fr 1fr', gap: '8px' }}>
            {DEMO_ROLES.map(r => (
              <button
                key={r.email} onClick={() => quickLogin(r.email)} disabled={loading}
                style={{
                  background: `${r.color}11`, border: `1px solid ${r.color}33`,
                  borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                }}
                onMouseOver={e => { e.currentTarget.style.background = `${r.color}22`; e.currentTarget.style.borderColor = `${r.color}66`; }}
                onMouseOut={e => { e.currentTarget.style.background = `${r.color}11`; e.currentTarget.style.borderColor = `${r.color}33`; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.color }}>{r.label}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.desc}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            All demo accounts use password: <strong style={{ color: 'var(--text-secondary)' }}>Admin@123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
