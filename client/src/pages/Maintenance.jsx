import { useEffect, useState } from 'react';
import { Plus, ArrowRight, Trash2, Wrench, Clock, User, Cpu } from 'lucide-react';
import { getKanbanData, createRequest, updateStage, deleteRequest, getEquipments, getUsers } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const STAGES = [
  { key: 'new',         label: 'New',         color: 'var(--blue)' },
  { key: 'in_progress', label: 'In Progress',  color: 'var(--yellow)' },
  { key: 'repaired',    label: 'Repaired',     color: 'var(--green)' },
  { key: 'scrapped',    label: 'Scrapped',     color: 'var(--red)' },
];

const NEXT_STAGE = { new:'in_progress', in_progress:'repaired', repaired:'scrapped' };
const TYPES = ['corrective','preventive'];
const PRIORITIES = ['low','medium','high','critical'];

const emptyForm = { type:'corrective', subject:'', description:'', equipment_id:'', scheduled_date:'', estimated_duration:'', priority:'medium', assigned_to:'' };

export default function Maintenance() {
  const [kanban, setKanban] = useState({ new:[], in_progress:[], repaired:[], scrapped:[] });
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [kbRes, eqRes, usRes] = await Promise.all([
        getKanbanData(), getEquipments(), getUsers()
      ]);
      setKanban(kbRes.data.data);
      setEquipments(eqRes.data.data);
      setUsers(usRes.data.data);
    } catch { addToast('Failed to load maintenance data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createRequest(form);
      addToast('Maintenance request created');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create request', 'error');
    } finally { setSaving(false); }
  };

  const advanceStage = async (id, currentStage) => {
    const next = NEXT_STAGE[currentStage];
    if (!next) return;
    try {
      await updateStage(id, next);
      addToast(`Moved to ${next.replace('_',' ')}`);
      load();
    } catch { addToast('Failed to update stage', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteId);
      addToast('Request deleted');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p className="text-muted">Kanban board — drag cards by advancing stage</p>
        </div>
        <button id="add-request-btn" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={15} /> New Request
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="kanban-board">
          {STAGES.map(({ key, label, color }) => {
            const cards = kanban[key] || [];
            return (
              <div className="kanban-col" key={key}>
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:color, display:'inline-block' }} />
                    {label}
                  </span>
                  <span className="kanban-col-count">{cards.length}</span>
                </div>
                <div className="kanban-cards">
                  {cards.length === 0 ? (
                    <div style={{ padding:'20px 0', textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>No requests</div>
                  ) : cards.map(card => (
                    <div className="kanban-card" key={card.id}>
                      <div className="kanban-card-title">{card.subject}</div>
                      <div className="kanban-card-meta">
                        {card.equipment_name && (
                          <span className="kanban-card-info"><Cpu size={11} />{card.equipment_name}</span>
                        )}
                        {card.assigned_name && (
                          <span className="kanban-card-info"><User size={11} />{card.assigned_name}</span>
                        )}
                        {card.scheduled_date && (
                          <span className="kanban-card-info"><Clock size={11} />{card.scheduled_date.slice(0,10)}</span>
                        )}
                      </div>
                      <div className="kanban-card-footer">
                        <div style={{ display:'flex', gap:5 }}>
                          <span className={`badge badge-${card.type}`}>{card.type}</span>
                          <span className={`badge badge-${card.priority}`}>{card.priority}</span>
                        </div>
                        <div style={{ display:'flex', gap:4 }}>
                          {NEXT_STAGE[key] && (
                            <button className="btn btn-ghost btn-sm btn-icon" title={`Move to ${NEXT_STAGE[key]}`} onClick={() => advanceStage(card.id, key)}>
                              <ArrowRight size={12} />
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteId(card.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Maintenance Request" size="lg">
        <form onSubmit={handleCreate}>
          <div className="form-grid form-grid-2" style={{ marginBottom:14 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Subject *</label>
              <input className="form-input" value={form.subject} onChange={f('subject')} required placeholder="Brief description of the issue" />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={form.type} onChange={f('type')}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={f('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment</label>
              <select className="form-select" value={form.equipment_id} onChange={f('equipment_id')}>
                <option value="">Select equipment</option>
                {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assigned_to} onChange={f('assigned_to')}>
                <option value="">Select technician</option>
                {users.filter(u => u.role !== 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date</label>
              <input className="form-input" type="date" value={form.scheduled_date} onChange={f('scheduled_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Duration (hrs)</label>
              <input className="form-input" type="number" min="1" value={form.estimated_duration} onChange={f('estimated_duration')} placeholder="e.g. 4" />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={f('description')} placeholder="Detailed description..." />
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Request'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Request" size="sm">
        <p style={{ color:'var(--text-secondary)' }}>Are you sure you want to delete this request?</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
