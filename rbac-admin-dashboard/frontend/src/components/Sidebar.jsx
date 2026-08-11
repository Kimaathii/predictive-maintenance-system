import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',        icon: '📊', permission: 'dashboard.view' },
  { path: '/users',        label: 'User Management',  icon: '👥', permission: 'users.edit' },
  { path: '/roles',        label: 'Roles & Perms',    icon: '🛡️', permission: 'roles.create' },
  { path: '/reports',      label: 'Reports',          icon: '📈', permission: 'reports.view' },
  { path: '/audit-logs',   label: 'Audit Logs',       icon: '📋', permission: 'audit.view' },
  { path: '/settings',     label: 'Settings',         icon: '⚙️', permission: 'settings.view' },
];

export default function Sidebar() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(item => hasPermission(item.permission));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'linear-gradient(180deg, #0d1424 0%, #070b14 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>🔐</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>RBAC Admin</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Access Control</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 8px 4px' }}>
          Navigation
        </div>
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(99,102,241,0.1))' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
            })}
          >
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        {/* Role badge */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
            background: `${user?.roleColor}22`, color: user?.roleColor,
            border: `1px solid ${user?.roleColor}44`,
          }}>
            🛡️ {user?.roleName}
          </span>
        </div>

        {/* User card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div className="avatar" style={{ background: user?.avatarColor || '#6366f1', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
