import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PermissionGate from '../components/PermissionGate';

export default function Settings() {
  const { apiCall } = useAuth();
  const [grouped, setGrouped] = useState({});
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    apiCall('/api/settings').then(({ ok, data }) => {
      if (ok && data.success) {
        setGrouped(data.grouped);
        const v = {};
        data.settings.forEach(s => { v[s.key] = s.value; });
        setValues(v);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const settings = Object.entries(values).map(([key, value]) => ({ key, value }));
    const { ok, data } = await apiCall('/api/settings', { method: 'PUT', body: JSON.stringify({ settings }) });
    if (ok) showToast('Settings saved!');
    else showToast(data.message, 'error');
    setSaving(false);
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>;

  const groupIcons = { Security: '🔒', General: '⚙️', Compliance: '📋' };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>System Settings</h1>
          <p>Configure security policies, session management, and compliance settings.</p>
        </div>
        <PermissionGate permission="settings.edit">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '💾 Saving…' : '💾 Save All Changes'}
          </button>
        </PermissionGate>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Object.entries(grouped).map(([group, settings]) => (
          <div key={group} className="card">
            <div className="card-header">
              <span className="card-title">{groupIcons[group] || '⚙️'} {group}</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', grid: 'auto / 1fr 1fr', gap: '16px' }}>
                {settings.map(s => (
                  <div key={s.key} className="form-group">
                    <label className="form-label">{s.label}</label>
                    {s.value === 'true' || s.value === 'false' ? (
                      <PermissionGate permission="settings.edit"
                        fallback={<div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '10px 0' }}>{s.value === 'true' ? '✅ Enabled' : '❌ Disabled'}</div>}
                        showFallback>
                        <select className="form-control" value={values[s.key] || s.value} onChange={e => setValues(p => ({...p, [s.key]: e.target.value}))}>
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      </PermissionGate>
                    ) : (
                      <PermissionGate permission="settings.edit"
                        fallback={<div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '10px 0', fontFamily: 'monospace' }}>{values[s.key] || s.value}</div>}
                        showFallback>
                        <input className="form-control" value={values[s.key] || ''} onChange={e => setValues(p => ({...p, [s.key]: e.target.value}))} />
                      </PermissionGate>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span>{toast.msg}</div>}
    </div>
  );
}
