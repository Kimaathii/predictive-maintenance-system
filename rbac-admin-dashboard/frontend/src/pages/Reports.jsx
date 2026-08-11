import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PermissionGate from '../components/PermissionGate';

export default function Reports() {
  const { apiCall } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall('/api/dashboard/stats'),
      apiCall('/api/roles'),
    ]).then(([statsRes, rolesRes]) => {
      if (statsRes.data.success && rolesRes.data.success) {
        setData({ stats: statsRes.data, roles: rolesRes.data.roles });
      }
    }).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const rows = [['Role','User Count','Permission Count']];
    data.roles.forEach(r => rows.push([r.name, r.user_count, r.permission_count]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rbac_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>;

  const s = data?.stats?.stats || {};

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Reports</h1>
          <p>System-wide analytics and user distribution insights.</p>
        </div>
        <PermissionGate permission="reports.export">
          <button className="btn btn-success" onClick={exportCSV}>⬇️ Export CSV</button>
        </PermissionGate>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Users',    value: s.totalUsers,   icon: '👥', color: '#6366f1' },
          { label: 'Active Users',   value: s.activeUsers,  icon: '✅', color: '#10b981' },
          { label: 'Suspended',      value: s.suspended,    icon: '⏸️', color: '#ef4444' },
          { label: 'Total Roles',    value: s.totalRoles,   icon: '🛡️', color: '#f59e0b' },
          { label: 'Permissions',    value: s.totalPerms,   icon: '🔑', color: '#3b82f6' },
        ].map(item => (
          <div key={item.label} className="card stat-card" style={{ borderTop: `3px solid ${item.color}` }}>
            <div className="stat-icon" style={{ background: `${item.color}22`, color: item.color }}>{item.icon}</div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', grid: '1fr / 1fr 1fr', gap: '20px' }}>
        {/* Role Breakdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">🛡️ Role Distribution</span></div>
          <div className="card-body">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Role','Users','Permissions','System'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', paddingBottom: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.roles || []).map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.875rem', color: r.color, fontWeight: 600 }}>{r.user_count}</td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.permission_count}</td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {r.is_system ? <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>System</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Custom</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Audit Activity Summary</span></div>
          <div className="card-body">
            {[
              { label: 'Total Events',   value: s.totalLogs,    color: '#6366f1', pct: 100 },
              { label: 'Denied Today',   value: s.deniedToday,  color: '#ef4444', pct: s.totalLogs > 0 ? (s.deniedToday / s.totalLogs) * 100 : 0 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>System Health</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                {s.totalUsers > 0 ? Math.round((s.activeUsers / s.totalUsers) * 100) : 100}% Active
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.activeUsers} of {s.totalUsers} users active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
