import React, { useState } from 'react';
import { Smartphone, CheckCircle, Clock, AlertCircle, Send, Wifi, WifiOff, FileText } from 'lucide-react';

export default function TechnicianView({ workOrders, onUpdateWOStatus }) {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedWO, setSelectedWO] = useState(null);
  const [techNote, setTechNote] = useState('');

  const handleUpdateStatus = (woId, newStatus) => {
    onUpdateWOStatus(woId, newStatus);
    if (selectedWO?.id === woId) {
      setSelectedWO({ ...selectedWO, status: newStatus });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Field Tech Mobile Header */}
      <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(8,145,178,0.3), rgba(17,24,39,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>
              <Smartphone size={12} /> Field Mobile Web Portal
            </span>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginTop: '2px' }}>
              Field Operations & Diagnostic Logging
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Optimized for low-bandwidth offshore and onshore swamp facilities.
            </p>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`btn ${isOnline ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Online (Synced)' : 'Offline Caching'}
          </button>
        </div>
      </div>

      {/* Work Orders List for Assigned Technician */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#06b6d4" /> Assigned Field Work Orders
        </h3>

        {workOrders.map((wo) => {
          const isSelected = selectedWO?.id === wo.id;

          return (
            <div
              key={wo.id}
              className="glass-card"
              style={{
                padding: '18px',
                borderColor: isSelected ? '#3b82f6' : 'var(--border-color)',
                background: isSelected ? 'rgba(30,58,138,0.25)' : 'rgba(31,41,61,0.7)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{wo.tag_name}</span>
                  <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginTop: '4px' }}>{wo.title}</h4>
                </div>
                <span className={`badge ${wo.priority === 'CRITICAL' ? 'badge-rose' : wo.priority === 'HIGH' ? 'badge-amber' : 'badge-emerald'}`}>
                  {wo.priority}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {wo.description}
              </p>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Predicted Failure: <strong style={{ color: '#f59e0b' }}>{wo.predicted_failure_mode}</strong>
                </div>

                {/* Status Toggle Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {wo.status !== 'IN_PROGRESS' && wo.status !== 'COMPLETED' && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleUpdateStatus(wo.id, 'IN_PROGRESS')}
                    >
                      Start Repair
                    </button>
                  )}

                  {wo.status !== 'COMPLETED' && (
                    <button
                      className="btn btn-emerald"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleUpdateStatus(wo.id, 'COMPLETED')}
                    >
                      <CheckCircle size={12} /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
