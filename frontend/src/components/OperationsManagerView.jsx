import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Activity, Award, BarChart2, PieChart, RefreshCw } from 'lucide-react';

// SVG Donut Chart for fleet health distribution
function FleetHealthDonut({ distribution }) {
  const total = distribution.reduce((s, d) => s + d.count, 0) || 1;
  const colors = { OPERATIONAL: '#10b981', WARNING: '#f59e0b', DEGRADED: '#ef4444', OFFLINE: '#6b7280' };
  
  let startAngle = -90;
  const radius = 46;
  const cx = 60, cy = 60;
  const segments = [];

  distribution.forEach(seg => {
    const pct = seg.count / total;
    const angle = pct * 360;
    const endAngle = startAngle + angle;
    const rad1 = (startAngle * Math.PI) / 180;
    const rad2 = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(rad1);
    const y1 = cy + radius * Math.sin(rad1);
    const x2 = cx + radius * Math.cos(rad2);
    const y2 = cy + radius * Math.sin(rad2);
    const largeArc = angle > 180 ? 1 : 0;

    segments.push({
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[seg.status] || '#6366f1',
      label: seg.status,
      count: seg.count,
      pct: (pct * 100).toFixed(0)
    });
    startAngle = endAngle;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill={seg.color} opacity="0.85" style={{ transition: 'opacity 0.2s' }}>
            <title>{seg.label}: {seg.count} ({seg.pct}%)</title>
          </path>
        ))}
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r="30" fill="#111827" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#9ca3af">Assets</text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{seg.label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f3f4f6', marginLeft: 'auto' }}>{seg.count}</span>
            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>({seg.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// SVG Bar chart for cost savings by facility
function CostBarChart({ reports }) {
  const byFacility = {};
  reports.forEach(r => {
    if (!byFacility[r.facility_name]) byFacility[r.facility_name] = 0;
    byFacility[r.facility_name] += r.net_savings_usd;
  });

  const entries = Object.entries(byFacility).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const maxVal = Math.max(...entries.map(([, v]) => v));
  const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'];
  const barW = 28;
  const chartH = 90;
  const gap = 18;
  const totalW = entries.length * (barW + gap);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(totalW + 20, 260)} height={chartH + 50} style={{ display: 'block' }}>
        {entries.map(([facility, value], i) => {
          const barH = (value / maxVal) * chartH;
          const x = 10 + i * (barW + gap);
          const y = chartH - barH;
          const shortName = facility.includes('Ovhor') ? 'Ovhor Plant' : facility.includes('Oben') ? 'Oben Gas' : 'Amukpe';
          const formattedVal = value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000).toFixed(0)}K`;

          return (
            <g key={i}>
              {/* Bar background */}
              <rect x={x} y={0} width={barW} height={chartH} fill="rgba(255,255,255,0.03)" rx="4" />
              {/* Bar fill */}
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={colors[i % colors.length]}
                opacity="0.85" rx="4"
                style={{ transition: 'height 0.8s ease, y 0.8s ease' }}
              />
              {/* Value label on top */}
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9" fill={colors[i % colors.length]} fontWeight="700">
                {formattedVal}
              </text>
              {/* Facility label below */}
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="8" fill="#9ca3af">
                {shortName.split(' ')[0]}
              </text>
              <text x={x + barW / 2} y={chartH + 24} textAnchor="middle" fontSize="8" fill="#6b7280">
                {shortName.split(' ')[1] || ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function OperationsManagerView({ analyticsData, costAvoidanceReports, equipmentList }) {
  const [liveAnalytics, setLiveAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const kpis = liveAnalytics?.kpis || analyticsData?.kpis || {
    totalCostAvoidedUsd: 2784000,
    fleetHealthScore: 84.5,
    activeWorkOrdersCount: 2,
    totalEquipmentCount: 5
  };

  const reports = costAvoidanceReports || [];

  // Build fleet distribution from live equipment or analytics
  const getFleetDistribution = () => {
    const src = liveAnalytics?.statusBreakdown || [];
    if (src.length > 0) return src.map(s => ({ status: s.status, count: s.count }));
    // Derive from equipmentList if provided
    if (equipmentList && equipmentList.length > 0) {
      const counts = {};
      equipmentList.forEach(eq => { counts[eq.status] = (counts[eq.status] || 0) + 1; });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }
    return [
      { status: 'OPERATIONAL', count: 3 },
      { status: 'WARNING', count: 1 },
      { status: 'DEGRADED', count: 1 }
    ];
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/v1/analytics/summary', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveAnalytics(data);
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const totalSavedFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis.totalCostAvoidedUsd);
  const fleetDist = getFleetDistribution();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(6,78,59,0.5), rgba(17,24,39,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
              <TrendingUp size={12} /> Executive Operations & Financial Analytics
            </span>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginTop: '4px' }}>
              Operational Efficiency & Downtime Cost Avoidance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Real-time financial impact reporting of avoided unplanned oil production losses across Nigerian facilities.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#9ca3af' }}>
                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Live sync...
              </div>
            )}
            {!loading && liveAnalytics && (
              <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Backend Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{ padding: '20px', borderTop: '2px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Net Cost Avoided</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '10px' }}>
            {totalSavedFormatted}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Direct financial savings from prevented shutdowns
          </p>
          {/* Mini bar chart */}
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
            {[40, 55, 48, 72, 68, 90, 85, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(16,185,129,${0.3 + (i / 10)})`, borderRadius: '2px 2px 0 0' }} />
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderTop: '2px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fleet Reliability Index</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>
            {kpis.fleetHealthScore}%
          </div>
          {/* Progress arc indicator */}
          <div style={{ marginTop: '10px', position: 'relative', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
            <div style={{ width: `${kpis.fleetHealthScore}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)', borderRadius: '3px', transition: 'width 1s ease' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#06b6d4', marginTop: '6px' }}>
            Target benchmark: &gt;80.0%
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderTop: '2px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unplanned Downtime Reduction</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} color="#6366f1" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>
            32.4%
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '6px' }}>
            Seplat Benchmark Achieved
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderTop: '2px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Preventive Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '10px' }}>
            {kpis.activeWorkOrdersCount} Active
          </div>
          <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' }}>
            0 Unscheduled Outages
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {/* Fleet Health Donut Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#06b6d4" /> Fleet Status Distribution
          </h3>
          <FleetHealthDonut distribution={fleetDist} />
        </div>

        {/* Cost Savings by Facility */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="#10b981" /> Net Savings by Facility
          </h3>
          {reports.length > 0 ? (
            <CostBarChart reports={reports} />
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
              No cost avoidance reports yet. Generate telemetry alerts to populate.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Cost Avoidance Breakdown Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="#10b981" /> Prevented Production Losses & Financial Breakdown
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Asset & Facility</th>
                <th style={{ padding: '12px 16px' }}>Predicted Failure Mode</th>
                <th style={{ padding: '12px 16px' }}>Downtime Hours Avoided</th>
                <th style={{ padding: '12px 16px' }}>Production Loss Rate ($/hr)</th>
                <th style={{ padding: '12px 16px' }}>Preventive Repair Cost</th>
                <th style={{ padding: '12px 16px' }}>Net Cost Savings ($)</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 600 }}>
                    {r.tag_name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{r.facility_name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-amber">{r.predicted_failure_mode}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#60a5fa', fontWeight: 700 }}>
                    {r.estimated_downtime_hours_avoided} hrs
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    ${r.production_loss_rate_usd_per_hr?.toLocaleString()}/hr
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    ${r.estimated_repair_cost_usd?.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>
                    +${r.net_savings_usd?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280' }}>
                    No cost avoidance reports yet. Use the Telemetry Simulator to trigger predictive alerts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
