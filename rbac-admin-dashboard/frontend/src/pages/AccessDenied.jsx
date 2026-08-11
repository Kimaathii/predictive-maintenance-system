import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied({ permission }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--danger)', marginBottom: '8px' }}>403</h1>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '24px' }}>
        You don't have permission to access this page.
        {permission && <> The <code style={{ color: 'var(--accent-light)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: '4px' }}>{permission}</code> permission is required.</>}
      </p>
      <div style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Logged in as <strong style={{ color: user?.roleColor }}>{user?.roleName}</strong>
      </div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost">← Go Back</button>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginLeft: '8px' }}>🏠 Dashboard</button>
    </div>
  );
}
