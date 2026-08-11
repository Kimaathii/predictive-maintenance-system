import React, { useState, useEffect } from 'react';
import { Shield, Key, Users, Database, FileText, CheckCircle, RefreshCw, Lock, UserPlus, UserCheck, UserX, Sliders, ShieldCheck, AlertCircle, Eye, Trash2 } from 'lucide-react';

export default function SuperAdminView({ auditLogs, usersList, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'security'
  const [users, setUsers] = useState(usersList || []);
  const [logs, setLogs] = useState(auditLogs || []);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Default Roles and Permissions State
  const [roles, setRoles] = useState([
    {
      id: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Global system governance, security policies, KMS master key rotation, unrestricted user & role management.',
      badgeClass: 'badge-rose',
      isSystem: true,
      permissions: ['telemetry.view', 'telemetry.ingest', 'workorders.create', 'workorders.edit', 'workorders.complete', 'reports.view', 'reports.export', 'audit.view', 'users.manage', 'roles.manage', 'kms.rotate']
    },
    {
      id: 'MAINTENANCE_MANAGER',
      name: 'Maintenance Manager',
      description: 'Equipment health monitoring, predictive work order creation, technician task assignment, vibration alert threshold tuning.',
      badgeClass: 'badge-amber',
      isSystem: true,
      permissions: ['telemetry.view', 'telemetry.ingest', 'workorders.create', 'workorders.edit', 'workorders.complete', 'reports.view']
    },
    {
      id: 'OPERATIONS_MANAGER',
      name: 'Operations Manager',
      description: 'Cost avoidance analytics, executive fleet reliability metrics, production downtime loss calculations.',
      badgeClass: 'badge-emerald',
      isSystem: true,
      permissions: ['telemetry.view', 'reports.view', 'reports.export']
    },
    {
      id: 'TECHNICIAN',
      name: 'Field Technician',
      description: 'Field execution of assigned maintenance work orders, repair log submission, vibration sensor validation.',
      badgeClass: 'badge-cyan',
      isSystem: true,
      permissions: ['telemetry.view', 'workorders.complete']
    }
  ]);

  const allPermissions = [
    { key: 'telemetry.view', name: 'View Asset Telemetry', category: 'Telemetry & Asset Monitoring' },
    { key: 'telemetry.ingest', name: 'Ingest Real-time Sensor Data', category: 'Telemetry & Asset Monitoring' },
    { key: 'workorders.create', name: 'Generate Work Orders', category: 'Maintenance & Work Orders' },
    { key: 'workorders.edit', name: 'Edit & Reassign Tasks', category: 'Maintenance & Work Orders' },
    { key: 'workorders.complete', name: 'Complete Maintenance Tasks', category: 'Maintenance & Work Orders' },
    { key: 'reports.view', name: 'View Reliability Reports', category: 'Analytics & Financials' },
    { key: 'reports.export', name: 'Export Financial & Cost Data', category: 'Analytics & Financials' },
    { key: 'audit.view', name: 'Access ISO 27001 Audit Trail', category: 'Governance & Security' },
    { key: 'users.manage', name: 'Provision & Suspend User Accounts', category: 'Governance & Security' },
    { key: 'roles.manage', name: 'Modify RBAC Role Matrix', category: 'Governance & Security' },
    { key: 'kms.rotate', name: 'Rotate AWS KMS Encryption Keys', category: 'Governance & Security' }
  ];

  const [selectedRole, setSelectedRole] = useState('MAINTENANCE_MANAGER');

  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'MAINTENANCE_MANAGER', facility_id: 'fac-1' });

  useEffect(() => {
    if (usersList) setUsers(usersList);
    if (auditLogs) setLogs(auditLogs);
  }, [usersList, auditLogs]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProvisionUser = (e) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email) return;

    const created = {
      id: 'usr-' + Date.now(),
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      facility_name: newUser.facility_id === 'fac-1' ? 'Ovhor Processing Facility' : newUser.facility_id === 'fac-2' ? 'Oben Gas Processing Plant' : 'Amukpe Crude Terminal',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    setUsers([created, ...users]);
    setIsProvisionModalOpen(false);
    setNewUser({ full_name: '', email: '', role: 'MAINTENANCE_MANAGER', facility_id: 'fac-1' });
    showToast(`User account '${created.full_name}' provisioned successfully as ${created.role}.`);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        showToast(`User account '${u.full_name}' status updated to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleTogglePermission = (roleId, permKey) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        const hasPerm = r.permissions.includes(permKey);
        const updatedPerms = hasPerm
          ? r.permissions.filter(p => p !== permKey)
          : [...r.permissions, permKey];
        showToast(`Updated ${r.name} permissions: ${permKey} ${hasPerm ? 'REVOKED' : 'GRANTED'}.`);
        return { ...r, permissions: updatedPerms };
      }
      return r;
    }));
  };

  const currentRoleObj = roles.find(r => r.id === selectedRole) || roles[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 2000,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
          backdropFilter: 'blur(12px)', border: '1px solid #34d399',
          borderRadius: '12px', padding: '14px 20px', color: '#fff',
          boxShadow: '0 10px 30px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <ShieldCheck size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(31,41,61,0.95), rgba(17,24,39,0.95))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-rose" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Super Admin Control Console
            </span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginTop: '4px', fontWeight: 700 }}>
              Seplat Governance & Security Architecture
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              ISO 27001 Data Protection • AWS KMS AES-256 Encryption • Granular Role-Based Access Control (RBAC)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => { onRefreshData?.(); showToast('Security policies & RBAC rules synchronized.'); }}>
              <RefreshCw size={16} /> Sync Security Policies
            </button>
            <button className="btn btn-primary" onClick={() => setIsProvisionModalOpen(true)}>
              <UserPlus size={16} /> Provision User
            </button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              background: activeTab === 'users' ? 'rgba(244,63,94,0.18)' : 'transparent',
              border: activeTab === 'users' ? '1px solid #f43f5e' : '1px solid transparent',
              color: activeTab === 'users' ? '#ffffff' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
            }}
          >
            <Users size={16} /> Enterprise Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            style={{
              background: activeTab === 'roles' ? 'rgba(244,63,94,0.18)' : 'transparent',
              border: activeTab === 'roles' ? '1px solid #f43f5e' : '1px solid transparent',
              color: activeTab === 'roles' ? '#ffffff' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={16} /> RBAC Permission Matrix ({roles.length} Roles)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              background: activeTab === 'security' ? 'rgba(244,63,94,0.18)' : 'transparent',
              border: activeTab === 'security' ? '1px solid #f43f5e' : '1px solid transparent',
              color: activeTab === 'security' ? '#ffffff' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
            }}
          >
            <Lock size={16} /> AWS KMS & Infrastructure Status
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active User Accounts</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>
            {users.filter(u => u.status !== 'SUSPENDED').length} / {users.length} Active
          </div>
          <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Multi-Factor Authentication Enabled
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AWS KMS Encryption</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>ACTIVE / ROTATED</div>
          <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>
            AES-256 Envelope Encryption Active
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Defined RBAC Roles</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>{roles.length} System Roles</div>
          <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' }}>
            {allPermissions.length} Granular Capabilities Configured
          </p>
        </div>
      </div>

      {/* TAB 1: Enterprise User Accounts */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 700 }}>Enterprise User Accounts & Access Controls</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage user identities, role assignments, facility scope, and active states</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsProvisionModalOpen(true)}>
              <UserPlus size={16} /> Provision User Account
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>User / Engineer</th>
                  <th style={{ padding: '12px 16px' }}>Email Address</th>
                  <th style={{ padding: '12px 16px' }}>Assigned Role</th>
                  <th style={{ padding: '12px 16px' }}>Facility Access</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const rObj = roles.find(r => r.id === u.role);
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>{u.full_name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${
                          u.role === 'SUPER_ADMIN' ? 'badge-rose' :
                          u.role === 'MAINTENANCE_MANAGER' ? 'badge-amber' :
                          u.role === 'OPERATIONS_MANAGER' ? 'badge-emerald' : 'badge-cyan'
                        }`}>
                          {rObj?.name || u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{u.facility_name || 'All Facilities'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          color: u.status === 'SUSPENDED' ? '#ef4444' : '#10b981',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.8rem', fontWeight: 600
                        }}>
                          ● {u.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {u.role !== 'SUPER_ADMIN' ? (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            style={{
                              background: u.status === 'SUSPENDED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              border: u.status === 'SUSPENDED' ? '1px solid #10b981' : '1px solid #ef4444',
                              color: u.status === 'SUSPENDED' ? '#10b981' : '#ef4444',
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                              display: 'inline-flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            {u.status === 'SUSPENDED' ? <UserCheck size={14} /> : <UserX size={14} />}
                            {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protected Account</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC Role & Permission Matrix */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Role Selection List */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 700, marginBottom: '8px' }}>Defined System Roles</h3>
            {roles.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer',
                  background: selectedRole === r.id ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.03)',
                  border: selectedRole === r.id ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`badge ${r.badgeClass}`}>{r.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.permissions.length} perms</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.description}</p>
              </div>
            ))}
          </div>

          {/* Permission Toggle Matrix */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className={`badge ${currentRoleObj.badgeClass}`} style={{ marginBottom: '6px' }}>{currentRoleObj.name}</span>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 700 }}>Granular Capabilities & Permissions</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Toggle permissions for the {currentRoleObj.name} role</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              {Array.from(new Set(allPermissions.map(p => p.category))).map(category => (
                <div key={category} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 700 }}>
                    {category}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {allPermissions.filter(p => p.category === category).map(perm => {
                      const isGranted = currentRoleObj.permissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(currentRoleObj.id, perm.key)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                            background: isGranted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            border: isGranted ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isGranted ? '#ffffff' : 'var(--text-muted)' }}>{perm.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{perm.key}</div>
                          </div>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                            background: isGranted ? '#10b981' : 'rgba(255,255,255,0.1)',
                            color: isGranted ? '#ffffff' : 'var(--text-muted)'
                          }}>
                            {isGranted ? 'GRANTED' : 'DENIED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AWS Security & Infrastructure */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key color="#10b981" size={20} /> AWS KMS Master Encryption Key
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Envelope encryption for sensitive operational telemetry, asset maintenance logs, and financial cost-avoidance reports.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', margin: '16px 0', fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981' }}>
                arn:aws:kms:eu-west-1:998877665544:key/seplat-cmk-aes256
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('AWS KMS Master Key rotated successfully.')}>
                <RefreshCw size={16} /> Force Rotate KMS Encryption Key
              </button>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database color="#06b6d4" size={20} /> AWS RDS Multi-AZ Failover Cluster
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                High-availability PostgreSQL database replicated synchronously across primary (eu-west-1a) and standby (eu-west-1b) subnets.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', margin: '16px 0', fontFamily: 'monospace', fontSize: '0.75rem', color: '#06b6d4' }}>
                seplat-db-cluster.primary.eu-west-1.rds.amazonaws.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                <CheckCircle size={14} /> Synchronous Replication (RPO = 0, RTO &lt; 30s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {isProvisionModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#131b2e' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '16px', fontWeight: 700 }}>Provision New Energy System User</h3>
            <form onSubmit={handleProvisionUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Engr. Chinedu Eze"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Corporate Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="user@seplatenergy.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Assigned RBAC System Role</label>
                <select
                  className="input-field"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="MAINTENANCE_MANAGER">Maintenance Manager</option>
                  <option value="OPERATIONS_MANAGER">Operations Manager</option>
                  <option value="TECHNICIAN">Field Technician</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Assigned Facility Access</label>
                <select
                  className="input-field"
                  value={newUser.facility_id}
                  onChange={(e) => setNewUser({ ...newUser, facility_id: e.target.value })}
                >
                  <option value="fac-1">Ovhor Processing Facility (OML 38)</option>
                  <option value="fac-2">Oben Gas Processing Plant (OML 4)</option>
                  <option value="fac-3">Amukpe Crude Terminal (OML 41)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsProvisionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

