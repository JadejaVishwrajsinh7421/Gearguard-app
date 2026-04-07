import { useEffect, useState } from 'react';
import { Cog, Wrench, CheckCircle, AlertTriangle, BarChart3, ClipboardList, Zap, RefreshCw } from 'lucide-react';
import { getEquipmentStats, getRequestStats, getRequests } from '../api';
import { useToast } from '../context/ToastContext';

const statConfigs = [
  { key: 'total',       label: 'Total Equipment',   icon: Cog,           color: '#58a6ff', bg: 'rgba(88,166,255,0.12)' },
  { key: 'active',      label: 'Active',            icon: CheckCircle,   color: '#3fb950', bg: 'rgba(63,185,80,0.12)' },
  { key: 'in_maintenance', label: 'In Maintenance', icon: Wrench,        color: '#d29922', bg: 'rgba(210,153,34,0.12)' },
  { key: 'scrapped',    label: 'Scrapped',          icon: AlertTriangle, color: '#f85149', bg: 'rgba(248,81,73,0.12)' },
  { key: 'total_req',   label: 'Total Requests',    icon: ClipboardList, color: '#bc8cff', bg: 'rgba(188,140,255,0.12)' },
  { key: 'critical',    label: 'Critical',          icon: Zap,           color: '#f0a500', bg: 'rgba(240,165,0,0.12)' },
];

function priorityLabel(p) {
  const map = { low:'low', medium:'medium', high:'high', critical:'critical' };
  return map[p] || p;
}

export default function Dashboard() {
  const [eqStats, setEqStats] = useState({});
  const [reqStats, setReqStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [eq, req, recentRes] = await Promise.all([
        getEquipmentStats(),
        getRequestStats(),
        getRequests(),
      ]);
      setEqStats(eq.data.data);
      setReqStats(req.data.data);
      setRecent(recentRes.data.data.slice(0, 8));
    } catch {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const combined = {
    ...eqStats,
    total_req: reqStats.total,
    critical: reqStats.critical,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back — here's your maintenance overview</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="stats-grid">
            {statConfigs.map(({ key, label, icon: Icon, color, bg }) => (
              <div className="stat-card" key={key}>
                <div className="stat-icon" style={{ background: bg, color }}>
                  <Icon size={18} />
                </div>
                <div className="stat-value">{combined[key] ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Maintenance Stage Summary */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Requests by Stage</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'New', val: reqStats.new_requests, cls:'badge-new' },
                  { label:'In Progress', val: reqStats.in_progress, cls:'badge-in_progress' },
                  { label:'Repaired', val: reqStats.repaired, cls:'badge-repaired' },
                  { label:'Scrapped', val: reqStats.scrapped, cls:'badge-scrapped' },
                ].map(({ label, val, cls }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className={`badge ${cls}`}>{label}</span>
                    <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{val ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Requests by Type</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Corrective', val: reqStats.corrective, cls:'badge-corrective' },
                  { label:'Preventive', val: reqStats.preventive, cls:'badge-preventive' },
                ].map(({ label, val, cls }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className={`badge ${cls}`}>{label}</span>
                    <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{val ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Maintenance Requests</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Equipment</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Stage</th>
                    <th>Assigned To</th>
                    <th>Scheduled</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No requests found</td></tr>
                  ) : recent.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight:500, maxWidth:200 }} className="truncate">{r.subject}</td>
                      <td className="text-muted">{r.equipment_name || '—'}</td>
                      <td><span className={`badge badge-${r.type}`}>{r.type}</span></td>
                      <td><span className={`badge badge-${r.priority}`}>{r.priority}</span></td>
                      <td><span className={`badge badge-${r.stage}`}>{r.stage.replace('_', ' ')}</span></td>
                      <td className="text-muted">{r.assigned_name || '—'}</td>
                      <td className="text-muted">{r.scheduled_date ? r.scheduled_date.slice(0,10) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
