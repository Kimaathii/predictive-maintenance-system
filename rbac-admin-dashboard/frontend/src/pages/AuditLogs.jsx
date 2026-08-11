import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  SUCCESS: { class: 'badge-success', label: '✓ Success' },
  DENIED:  { class: 'badge-danger',  label: '✗ Denied'  },
  FAILED:  { class: 'badge-warning', label: '⚠ Failed'  },
};

function formatTS(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

export default function AuditLogs() {
  const { apiCall } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 25, ...(search && { search }), ...(filterAction && { action: filterAction }), ...(filterStatus && { status: filterStatus }) });
    apiCall(`/api/audit-logs?${p}`).then(({ data }) => {
      if (data.success) { setLogs(data.logs); setTotal(data.total); setPages(data.pages); setActions(data.actions || []); }
    }).finally(() => setLoading(false));
  }, [page, search, filterAction, filterStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Audit Logs</h1>
          <p>Complete, tamper-evident log of all system actions. {total > 0 && <strong style={{ color: 'var(--accent-light)' }}>{total} total events.</strong>}</p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={() => {
            if (!logs.length) return;
            const headers = ['Timestamp', 'Actor Email', 'Actor Role', 'Action', 'Target Name', 'Target Type', 'IP Address', 'Status'];
            const rows = logs.map(l => [
              `"${formatTS(l.timestamp)}"`,
              `"${l.actor_email || ''}"`,
              `"${l.actor_role || ''}"`,
              `"${l.action || ''}"`,
              `"${l.target_name || ''}"`,
              `"${l.target_type || ''}"`,
              `"${l.ip_address || ''}"`,
              `"${l.status || ''}"`
            ].join(','));
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `ncdmb_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <span>📥</span> Export CSV (NCDMB Audit)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by actor, target, or action…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: '34px' }} />
        </div>
        <select className="form-control" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} style={{ width: '200px' }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="form-control" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ width: '140px' }}>
          <option value="">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="DENIED">Denied</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No audit events found</h3><p>Try adjusting your filters.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatTS(log.timestamp)}</td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{log.actor_email || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.actor_role}</div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.78rem', background: 'var(--bg-input)', padding: '3px 7px', borderRadius: '4px', color: 'var(--accent-light)' }}>
                          {log.action}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{log.target_name || '—'}</div>
                        {log.target_type && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.target_type}</div>}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.ip_address || '—'}</td>
                      <td>
                        <span className={`badge ${STATUS_STYLES[log.status]?.class || 'badge-muted'}`}>
                          {STATUS_STYLES[log.status]?.label || log.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{expanded === log.id ? '▲' : '▼'}</td>
                    </tr>
                    {expanded === log.id && log.details && (
                      <tr>
                        <td colSpan={7} style={{ background: 'rgba(255,255,255,0.02)', padding: '0 16px 12px' }}>
                          <pre style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: '8px 0 0', fontFamily: 'monospace' }}>
                            {JSON.stringify(JSON.parse(log.details || '{}'), null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div style={{ padding: '12px 16px' }}>
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {pages > 7 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>…{pages}</span>}
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === pages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
