import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * <PermissionGate permission="users.create">
 *   <CreateButton />
 * </PermissionGate>
 * Renders children only if the user has the required permission.
 * Optionally renders a fallback (e.g., a 403 message) if `showFallback` is true.
 */
export default function PermissionGate({ permission, children, fallback = null, showFallback = false }) {
  const { hasPermission } = useAuth();
  if (hasPermission(permission)) return children;
  if (showFallback) return fallback || (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>403 – Access Denied</h3>
      <p style={{ fontSize: '0.875rem' }}>You don't have the <code style={{ color: 'var(--accent-light)' }}>{permission}</code> permission.</p>
    </div>
  );
  return null;
}
