import React, { useState } from 'react';
import { Activity, Zap, AlertTriangle, CheckCircle, Flame, Gauge, ArrowRight } from 'lucide-react';

export default function TelemetrySimulatorModal({ equipmentList, onIngestTelemetry, onClose }) {
  const [selectedEqId, setSelectedEqId] = useState(equipmentList[0]?.id || 'eq-101');
  const [vibration, setVibration] = useState(7.8);
  const [temperature, setTemperature] = useState(88.5);
  const [pressure, setPressure] = useState(1420);
  const [flowRate, setFlowRate] = useState(12500);
  const [lastResult, setLastResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEq = equipmentList.find(e => e.id === selectedEqId) || equipmentList[0];

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      equipment_id: selectedEqId,
      vibration_rms_mms: parseFloat(vibration),
      temperature_c: parseFloat(temperature),
      pressure_psi: parseFloat(pressure),
      flow_rate_bpd: parseFloat(flowRate)
    };

    const res = await onIngestTelemetry(payload);
    setIsSubmitting(false);
    if (res) {
      setLastResult(res);
    }
  };

  // Quick Preset Buttons
  const applyPreset = (preset) => {
    if (preset === 'NORMAL') {
      setVibration(2.1);
      setTemperature(62.0);
      setPressure(850);
      setFlowRate(24000);
    } else if (preset === 'WARNING') {
      setVibration(5.2);
      setTemperature(78.0);
      setPressure(1150);
      setFlowRate(18000);
    } else if (preset === 'CRITICAL_BEARING') {
      setVibration(9.4);
      setTemperature(96.0);
      setPressure(1650);
      setFlowRate(11000);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '650px', padding: '28px', background: '#111827', border: '1px solid #10b981' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#10b981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>IoT Telemetry Ingestion Simulator</h3>
                <span className="animate-live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Simulate real-time sensor streams feeding AWS Lambda & Predictive Engine</p>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>✕ Close</button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Quick Presets:</span>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('NORMAL')}>
            🟢 Normal Run
          </button>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('WARNING')}>
            🟡 Bearing Warning
          </button>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => applyPreset('CRITICAL_BEARING')}>
            🔴 Critical Anomaly
          </button>
        </div>

        <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Select Asset Tag</label>
            <select
              className="input-field"
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
            >
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.tag_name} - {eq.equipment_type} ({eq.facility_name})</option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vibration RMS (mm/s)</span>
                <span style={{ color: vibration > 8 ? '#ef4444' : vibration > 4.5 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{vibration} mm/s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.1"
                value={vibration}
                onChange={(e) => setVibration(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bearing Temp (°C)</span>
                <span style={{ color: temperature > 90 ? '#ef4444' : temperature > 75 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>{temperature} °C</span>
              </div>
              <input
                type="range"
                min="30"
                max="130"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Discharge Pressure (PSI)</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{pressure} PSI</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="10"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Flow Rate (BPD)</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{flowRate} BPD</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={flowRate}
                onChange={(e) => setFlowRate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-emerald" style={{ marginTop: '8px', padding: '12px' }} disabled={isSubmitting}>
            <Zap size={18} /> {isSubmitting ? 'Processing Lambda Ingestion Stream...' : 'Fire Telemetry Ingestion Stream'}
          </button>
        </form>

        {/* Prediction Results Banner */}
        {lastResult && (
          <div className="glass-card" style={{ marginTop: '18px', padding: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#10b981" />
                <span style={{ fontWeight: 700, color: '#ffffff' }}>Predictive Engine Response:</span>
              </div>
              <span className={`badge ${lastResult.telemetry.health_index < 50 ? 'badge-rose' : 'badge-emerald'}`}>
                Health Index: {lastResult.telemetry.health_index}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px', fontSize: '0.85rem' }}>
              <div>Failure Mode: <strong style={{ color: '#f59e0b' }}>{lastResult.telemetry.failure_prediction}</strong></div>
              <div>Estimated RUL: <strong style={{ color: '#60a5fa' }}>{lastResult.telemetry.estimated_rul_hours} operating hours</strong></div>
            </div>

            {lastResult.autoWorkOrderCreated && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(244,63,94,0.15)', borderRadius: '6px', border: '1px solid #f43f5e', fontSize: '0.8rem', color: '#ffffff' }}>
                ⚡ <strong>AUTOMATED WORK ORDER TRIGGERED!</strong> Generated Work Order ID <code>{lastResult.autoWorkOrderCreated.work_order_id}</code> with Net Savings Estimate: <strong>${lastResult.autoWorkOrderCreated.netSavingsUsd.toLocaleString()}</strong>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
