import React, { useState } from 'react';
import { Wrench, AlertTriangle, Activity, Clock, CheckCircle2, PlusCircle, Filter, Zap, ShieldAlert, Cpu } from 'lucide-react';
import TelemetrySparkChart from './TelemetrySparkChart';

export default function MaintenanceManagerView({ equipmentList, workOrders, onOpenSimulator, onCreateWorkOrder, onUpdateWOStatus }) {
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isWOModalOpen, setIsWOModalOpen] = useState(false);
  const [newWO, setNewWO] = useState({
    equipment_id: equipmentList[0]?.id || 'eq-101',
    title: '',
    description: '',
    priority: 'HIGH'
  });

  const filteredEquipment = equipmentList.filter(eq => {
    if (selectedStatus === 'ALL') return true;
    return eq.status === selectedStatus;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newWO.title) return;
    onCreateWorkOrder(newWO);
    setIsWOModalOpen(false);
    setNewWO({ equipment_id: equipmentList[0]?.id || 'eq-101', title: '', description: '', priority: 'HIGH' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Maintenance Header & Action Controls */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(30,58,138,0.4), rgba(17,24,39,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-amber" style={{ marginBottom: '8px' }}>
              <Wrench size={12} /> Maintenance Management Portal
            </span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginTop: '4px' }}>
              Equipment Reliability & Work Order Scheduling
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Monitor rotating equipment health indices, analyze anomaly streams, and schedule predictive work orders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-emerald" onClick={onOpenSimulator}>
              <Zap size={16} /> Open Telemetry Simulator
            </button>
            <button className="btn btn-primary" onClick={() => setIsWOModalOpen(true)}>
              <PlusCircle size={16} /> Create Work Order
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Equipment Health Overview Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="#60a5fa" /> Rotating Asset Fleet Health Matrix
          </h3>

          {/* Filter Status Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'OPERATIONAL', 'WARNING', 'DEGRADED'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: selectedStatus === status ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.03)',
                  color: selectedStatus === status ? '#60a5fa' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredEquipment.map((eq, i) => {
            const isWarning = eq.status === 'WARNING';
            const isDegraded = eq.status === 'DEGRADED';
            const healthColor = isDegraded ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

            return (
              <div
                key={eq.id}
                className={`glass-card animate-slide-in ${isDegraded ? 'card-degraded' : ''}`}
                style={{ padding: '20px', borderLeft: `4px solid ${healthColor}`, animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{eq.facility_name}</span>
                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginTop: '2px' }}>{eq.tag_name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{eq.equipment_type}</p>
                  </div>
                  <span className={`badge ${isDegraded ? 'badge-rose' : isWarning ? 'badge-amber' : 'badge-emerald'}`}>
                    {eq.status}
                  </span>
                </div>

                {/* Health Index Bar */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Health Index Score</span>
                    <span style={{ fontWeight: 700, color: healthColor }}>{eq.health_index}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${eq.health_index}%`, height: '100%', background: healthColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Telemetry Sparkline */}
                <TelemetrySparkChart
                  equipmentId={eq.id}
                  equipmentTag={eq.tag_name}
                  currentVibration={null}
                  currentTemp={null}
                />

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Serial: {eq.serial_number}</span>
                  <span className="badge badge-indigo">{eq.criticality_rating} CRITICAL</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Orders Kanban & Scheduling Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#f59e0b" /> Active Work Orders & Maintenance Schedule
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Work Order Title</th>
                <th style={{ padding: '12px 16px' }}>Asset Tag</th>
                <th style={{ padding: '12px 16px' }}>Priority</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Est. RUL</th>
                <th style={{ padding: '12px 16px' }}>Assigned Tech</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 600 }}>
                    {wo.title}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>{wo.description}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#60a5fa', fontWeight: 600 }}>{wo.tag_name}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${wo.priority === 'CRITICAL' ? 'badge-rose' : wo.priority === 'HIGH' ? 'badge-amber' : 'badge-emerald'}`}>
                      {wo.priority}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${wo.status === 'COMPLETED' ? 'badge-emerald' : wo.status === 'IN_PROGRESS' ? 'badge-cyan' : 'badge-amber'}`}>
                      {wo.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: wo.estimated_rul_hours < 50 ? '#ef4444' : 'var(--text-main)', fontWeight: 700 }}>
                    {wo.estimated_rul_hours ? `${wo.estimated_rul_hours} hrs` : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {wo.assigned_technician_name || 'Tunde Adeleke'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {wo.status !== 'COMPLETED' ? (
                      <button
                        className="btn btn-emerald"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => onUpdateWOStatus(wo.id, 'COMPLETED')}
                      >
                        <CheckCircle2 size={12} /> Complete
                      </button>
                    ) : (
                      <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Work Order Modal */}
      {isWOModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', background: '#131b2e' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '16px' }}>Generate Predictive Work Order</h3>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Target Asset</label>
                <select
                  className="input-field"
                  value={newWO.equipment_id}
                  onChange={(e) => setNewWO({ ...newWO, equipment_id: e.target.value })}
                >
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.tag_name} - {eq.equipment_type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Work Order Title</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Inspect Compressor Bearing Vibrations"
                  value={newWO.title}
                  onChange={(e) => setNewWO({ ...newWO, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Priority Level</label>
                <select
                  className="input-field"
                  value={newWO.priority}
                  onChange={(e) => setNewWO({ ...newWO, priority: e.target.value })}
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Maintenance Instructions & Diagnosis</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Describe field procedure and required spare parts..."
                  value={newWO.description}
                  onChange={(e) => setNewWO({ ...newWO, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsWOModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Generate Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
