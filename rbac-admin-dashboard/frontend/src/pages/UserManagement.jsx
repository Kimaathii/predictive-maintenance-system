import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PermissionGate from '../components/PermissionGate';

function UserModal({ user, roles, allPerms, onClose, onSave, mode }) {
  const [form, setForm] = useState(user ? { fullName: user.full_name, email: user.email, roleId: user.role_id, department: user.department || '', avatarColor: user.avatar_color || '#6366f1' } : { fullName: '', email: '', password: '', roleId: 'role-staff', department: '', avatarColor: '#6366f1' });
  const [loading, setLoading] = useState(false);
  const colors = ['#6366f1','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#64748b'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? '➕ Add New User' : '✏️ Edit User'}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', grid: '1fr / 1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name *</label>
                <input className="form-control" required value={form.fullName} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} placeholder="Alice Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="alice@company.com" />
              </div>
              {mode === 'create' && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="Min 8 chars" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-control" value={form.roleId} onChange={e => setForm(p => ({...p, roleId: e.target.value}))}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" value={form.department} onChange={e => setForm(p => ({...p, department: e.target.value}))} placeholder="Engineering" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Avatar Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colors.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({...p, avatarColor: c}))} style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: c, border: form.avatarColor === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.1s',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:'14px',height:'14px'}} /> Saving…</> : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionsModal({ user, allPerms, onClose, onSave }) {
  const grouped = {};
  allPerms.forEach(p => { if (!grouped[p.module]) grouped[p.module] = []; grouped[p.module].push(p); });
  const [overrides, setOverrides] = useState(() => {
    const m = {};
    (user.individualPermissions || []).forEach(ip => { m[ip.key] = ip.granted; });
    return m;
  });
  const [loading, setLoading] = useState(false);

  const toggle = (key) => setOverrides(prev => {
    const next = { ...prev };
    if (key in next) delete next[key];
    else next[key] = true;
    return next;
  });

  const handleSave = async () => {
    setLoading(true);
    const perms = Object.entries(overrides).map(([key, granted]) => ({ key, granted }));
    try { await onSave(perms); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">🔑 Individual Permissions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.full_name} — overrides on top of role permissions</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {Object.entries(grouped).map(([module, perms]) => (
            <div key={module} className="perm-module">
              <div className="perm-module-title">📦 {module}</div>
              <div className="perm-grid">
                {perms.map(p => (
                  <label key={p.key} className={`perm-item ${p.key in overrides ? 'checked' : ''}`} onClick={() => toggle(p.key)}>
                    <input type="checkbox" checked={p.key in overrides && overrides[p.key]} onChange={() => {}} style={{ accentColor: 'var(--accent)' }} />
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
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Permission Overrides'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onSave }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title">🔒 Reset Password</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Reset password for <strong>{user.full_name}</strong>.</p>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-control" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min 6 characters" />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={async () => { setLoading(true); try { await onSave(pw); } finally { setLoading(false); } }} className="btn btn-warning" disabled={loading || pw.length < 6}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPerms, setAllPerms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type, user? }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, ...(search && { search }), ...(filterRole && { role: filterRole }), ...(filterStatus && { status: filterStatus }) });
    apiCall(`/api/users?${params}`).then(({ data }) => {
      if (data.success) { setUsers(data.users); setTotal(data.total); setPages(data.pages); }
    }).finally(() => setLoading(false));
  }, [page, search, filterRole, filterStatus]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiCall('/api/roles').then(({ data }) => { if (data.success) setRoles(data.roles); }); apiCall('/api/permissions').then(({ data }) => { if (data.success) setAllPerms(data.permissions); }); }, []);

  const handleCreate = async (form) => {
    const { ok, data } = await apiCall('/api/users', { method: 'POST', body: JSON.stringify(form) });
    if (ok) { showToast('User created!'); setModal(null); load(); }
    else showToast(data.message, 'error');
  };

  const handleEdit = async (form) => {
    const { ok, data } = await apiCall(`/api/users/${modal.user.id}`, { method: 'PUT', body: JSON.stringify(form) });
    if (ok) { showToast('User updated!'); setModal(null); load(); }
    else showToast(data.message, 'error');
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.full_name}? This cannot be undone.`)) return;
    const { ok, data } = await apiCall(`/api/users/${u.id}`, { method: 'DELETE' });
    if (ok) { showToast('User deleted.'); load(); }
    else showToast(data.message, 'error');
  };

  const handleStatus = async (u) => {
    const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const { ok, data } = await apiCall(`/api/users/${u.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    if (ok) { showToast(`User ${newStatus === 'SUSPENDED' ? 'suspended' : 'activated'}.`); load(); }
    else showToast(data.message, 'error');
  };

  const handleResetPw = async (pw) => {
    const { ok, data } = await apiCall(`/api/users/${modal.user.id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword: pw }) });
    if (ok) { showToast('Password reset!'); setModal(null); }
    else showToast(data.message, 'error');
  };

  const handleSavePerms = async (perms) => {
    const { ok, data } = await apiCall(`/api/users/${modal.user.id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: perms }) });
    if (ok) { showToast('Permissions updated!'); setModal(null); load(); }
    else showToast(data.message, 'error');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>User Management</h1>
          <p>Manage accounts, roles, and individual permissions.</p>
        </div>
        <PermissionGate permission="users.create">
          <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>➕ Add User</button>
        </PermissionGate>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: '20px 0', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: '34px' }} />
        </div>
        <select className="form-control" value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }} style={{ width: '160px' }}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="form-control" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ width: '140px' }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3><p>Try adjusting your filters.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ background: u.avatar_color }}>{u.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: `${u.role_color}22`, color: u.role_color }}>{u.role_name}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status === 'ACTIVE' ? '● Active' : '● Suspended'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <PermissionGate permission="users.edit">
                          <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setModal({ type: 'edit', user: u })}>✏️</button>
                        </PermissionGate>
                        <PermissionGate permission="roles.assign_permissions">
                          <button className="btn btn-ghost btn-sm btn-icon" title="Permissions" onClick={() => setModal({ type: 'permissions', user: u })}>🔑</button>
                        </PermissionGate>
                        <PermissionGate permission="users.suspend">
                          <button className={`btn btn-sm btn-icon ${u.status === 'ACTIVE' ? 'btn-ghost' : 'btn-success'}`} title={u.status === 'ACTIVE' ? 'Suspend' : 'Activate'} onClick={() => handleStatus(u)}>
                            {u.status === 'ACTIVE' ? '⏸️' : '▶️'}
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="users.password_reset">
                          <button className="btn btn-ghost btn-sm btn-icon" title="Reset Password" onClick={() => setModal({ type: 'reset', user: u })}>🔒</button>
                        </PermissionGate>
                        <PermissionGate permission="users.delete">
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(u)}>🗑️</button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: '12px 16px' }}>
            <div className="pagination">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>{total} users</span>
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
              {Array.from({ length: pages }, (_, i) => i+1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === pages}>›</button>
            </div>
          </div>
        )}
      </div>

      {modal?.type === 'create' && <UserModal mode="create" roles={roles} allPerms={allPerms} onClose={() => setModal(null)} onSave={handleCreate} />}
      {modal?.type === 'edit' && <UserModal mode="edit" user={modal.user} roles={roles} allPerms={allPerms} onClose={() => setModal(null)} onSave={handleEdit} />}
      {modal?.type === 'permissions' && <PermissionsModal user={modal.user} allPerms={allPerms} onClose={() => setModal(null)} onSave={handleSavePerms} />}
      {modal?.type === 'reset' && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} onSave={handleResetPw} />}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
