import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function ActivityDot({ status }) {
  const colors = { SUCCESS: 'var(--success)', DENIED: 'var(--danger)', FAILED: 'var(--warning)' };
  return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[status] || 'var(--text-muted)', display: 'inline-block', marginRight: '8px', flexShrink: 0 }} />;
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return d.toLocaleDateString();
}

export default function Dashboard() {
  const { apiCall, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/api/dashboard/stats').then(({ data }) => {
      if (data.success) setStats(data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: '32px', height: '32px' }} /></div>;

  const s = stats?.stats || {};
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.fullName}. Here's your system overview.</p>
      </div>

      {/* KPI Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '28px' }}>
        <StatCard icon="👥" label="Total Users"    value={s.totalUsers}   sub={`${s.activeUsers} active, ${s.suspended} suspended`} color="#6366f1" />
        <StatCard icon="🛡️" label="Roles"          value={s.totalRoles}   sub="Defined access levels"  color="#f59e0b" />
        <StatCard icon="🔑" label="Permissions"    value={s.totalPerms}   sub="Across 6 modules"       color="#10b981" />
        <StatCard icon="📋" label="Audit Events"   value={s.totalLogs}    sub="Total logged actions"   color="#3b82f6" />
        <StatCard icon="🚫" label="Denied Today"   value={s.deniedToday}  sub="Blocked access attempts" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', grid: '1fr / 1fr 1fr', gap: '20px' }}>
        {/* Role Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 User Distribution by Role</span>
          </div>
          <div className="card-body">
            {(stats?.roleBreakdown || []).map(r => (
              <div key={r.name} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: '0.875rem', color: r.color, fontWeight: 600 }}>{r.count}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.totalUsers > 0 ? (r.count / s.totalUsers) * 100 : 0}%`, background: r.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Recent Audit Activity</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(stats?.recentLogs || []).slice(0, 7).map((log, i) => (
              <div key={log.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 20px', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <ActivityDot status={log.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.action?.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.actor_email}</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatTime(log.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <span className="card-title">🆕 Recently Added Users</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Joined</th></tr></thead>
            <tbody>
              {(stats?.recentUsers || []).map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar" style={{ background: u.avatar_color }}>{u.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: `${u.role_color}22`, color: u.role_color }}>{u.role_name}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
