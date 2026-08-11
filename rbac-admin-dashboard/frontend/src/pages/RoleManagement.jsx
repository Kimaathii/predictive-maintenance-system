import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PermissionGate from '../components/PermissionGate';

const ROLE_COLORS = ['#6366f1','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

function RoleFormModal({ role, onClose, onSave }) {
  const [form, setForm] = useState(role ? { name: role.name, description: role.description || '', color: role.color || '#6366f1' } : { name: '', description: '', color: '#6366f1' });
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{role ? '✏️ Edit Role' : '➕ Create Role'}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Role Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Auditor" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Describe this role's purpose" rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Colour</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ROLE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({...p, color: c}))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={async () => { if (!form.name) return; setLoading(true); try { await onSave(form); } finally { setLoading(false); } }} className="btn btn-primary" disabled={loading || !form.name}>
            {loading ? 'Saving…' : role ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionsPanel({ role, allPerms, onSave }) {
  const grouped = {};
  allPerms.forEach(p => { if (!grouped[p.module]) grouped[p.module] = []; grouped[p.module].push(p); });
  const [assigned, setAssigned] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { apiCall } = useAuth();

  useEffect(() => {
    apiCall(`/api/roles/${role.id}/permissions`).then(({ data }) => {
      if (data.success) setAssigned(new Set(data.assigned));
    }).finally(() => setLoading(false));
  }, [role.id]);

  const toggle = (permId) => setAssigned(prev => {
    const next = new Set(prev);
    next.has(permId) ? next.delete(permId) : next.add(permId);
    return next;
  });

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(role.id, [...assigned]); } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontWeight: 700, color: '#fff' }}>
            <span style={{ color: role.color }}>■</span> {role.name} — Permissions
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{assigned.size} of {allPerms.length} permissions assigned</p>
        </div>
        <PermissionGate permission="roles.assign_permissions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Permissions'}
          </button>
        </PermissionGate>
      </div>

      {role.is_system && (
        <div style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--warning)' }}>
          ⚠️ This is a system role. Changes will affect all users with this role.
        </div>
      )}

      {Object.entries(grouped).map(([module, perms]) => (
        <div key={module} className="perm-module">
          <div className="perm-module-title">📦 {module}</div>
          <div className="perm-grid">
            {perms.map(p => (
              <label key={p.id} className={`perm-item ${assigned.has(p.id) ? 'checked' : ''}`} onClick={() => toggle(p.id)}>
                <input type="checkbox" checked={assigned.has(p.id)} onChange={() => {}} style={{ accentColor: 'var(--accent)' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.key}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoleManagement() {
  const { apiCall } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPerms, setAllPerms] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(() => {
    apiCall('/api/roles').then(({ data }) => { if (data.success) { setRoles(data.roles); if (!selectedRole && data.roles.length) setSelectedRole(data.roles[0]); } });
    apiCall('/api/permissions').then(({ data }) => { if (data.success) setAllPerms(data.permissions); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    const { ok, data } = await apiCall('/api/roles', { method: 'POST', body: JSON.stringify(form) });
    if (ok) { showToast('Role created!'); setModal(null); load(); }
    else showToast(data.message, 'error');
  };

  const handleEdit = async (form) => {
    const { ok, data } = await apiCall(`/api/roles/${modal.role.id}`, { method: 'PUT', body: JSON.stringify(form) });
    if (ok) { showToast('Role updated!'); setModal(null); load(); }
    else showToast(data.message, 'error');
  };

  const handleDelete = async (role) => {
    if (!confirm(`Delete role "${role.name}"? Users must be reassigned first.`)) return;
    const { ok, data } = await apiCall(`/api/roles/${role.id}`, { method: 'DELETE' });
    if (ok) { showToast('Role deleted.'); if (selectedRole?.id === role.id) setSelectedRole(null); load(); }
    else showToast(data.message, 'error');
  };

  const handleDuplicate = async (role) => {
    const { ok, data } = await apiCall(`/api/roles/${role.id}/duplicate`, { method: 'POST' });
    if (ok) { showToast(`Role duplicated as "${role.name} (Copy)".`); load(); }
    else showToast(data.message, 'error');
  };

  const handleSavePerms = async (roleId, permIds) => {
    const { ok, data } = await apiCall(`/api/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissionIds: permIds }) });
    if (ok) showToast('Permissions saved!');
    else showToast(data.message, 'error');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header-row" style={{ marginBottom: '24px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Roles & Permissions</h1>
          <p>Create roles and assign permissions to control system access.</p>
        </div>
        <PermissionGate permission="roles.create">
          <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>➕ New Role</button>
        </PermissionGate>
      </div>

      <div style={{ display: 'grid', grid: '1fr / 280px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Role List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roles.map(r => (
            <div
              key={r.id}
              className={`role-card ${selectedRole?.id === r.id ? 'selected' : ''}`}
              style={{ '--role-color': r.color }}
              onClick={() => setSelectedRole(r)}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: r.color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{r.name}</span>
                    {r.is_system && <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>System</span>}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>{r.description}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: r.color, fontWeight: 600 }}>🔑 {r.permission_count} perms</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>👥 {r.user_count} users</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                <PermissionGate permission="roles.edit">
                  <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setModal({ type: 'edit', role: r })}>✏️</button>
                </PermissionGate>
                <PermissionGate permission="roles.create">
                  <button className="btn btn-ghost btn-sm btn-icon" title="Duplicate" onClick={() => handleDuplicate(r)}>📋</button>
                </PermissionGate>
                <PermissionGate permission="roles.delete">
                  {!r.is_system && (
                    <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(r)}>🗑️</button>
                  )}
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>

        {/* Permission Panel */}
        <div className="card card-p">
          {selectedRole ? (
            <PermissionsPanel key={selectedRole.id} role={selectedRole} allPerms={allPerms} onSave={handleSavePerms} />
          ) : (
            <div className="empty-state"><div className="empty-state-icon">🛡️</div><h3>Select a role</h3><p>Click a role on the left to view and edit its permissions.</p></div>
          )}
        </div>
      </div>

      {modal?.type === 'create' && <RoleFormModal onClose={() => setModal(null)} onSave={handleCreate} />}
      {modal?.type === 'edit' && <RoleFormModal role={modal.role} onClose={() => setModal(null)} onSave={handleEdit} />}
      {toast && <div className={`toast toast-${toast.type}`}><span>{toast.type === 'success' ? '✅' : '❌'}</span>{toast.msg}</div>}
    </div>
  );
}
