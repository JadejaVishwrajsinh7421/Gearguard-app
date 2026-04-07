import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Cog } from 'lucide-react';
import { getEquipments, createEquipment, updateEquipment, deleteEquipment, getTeams } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const emptyForm = {
  name:'', serial_number:'', category:'', department:'', assigned_employee:'',
  purchase_date:'', warranty_expiry:'', location:'', team_id:'', status:'active', notes:''
};

const CATEGORIES = ['Compressor','Machine Tool','Electrical','HVAC','Press','Material Handling','Generator','Conveyor','Robot','Other'];
const STATUSES = ['active','maintenance','scrapped'];

export default function Equipments() {
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [eqRes, tmRes] = await Promise.all([
        getEquipments({ search, status: filterStatus }),
        getTeams(),
      ]);
      setItems(eqRes.data.data);
      setTeams(tmRes.data.data);
    } catch { addToast('Failed to load equipment', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name||'', serial_number: item.serial_number||'', category: item.category||'',
      department: item.department||'', assigned_employee: item.assigned_employee||'',
      purchase_date: item.purchase_date ? item.purchase_date.slice(0,10) : '',
      warranty_expiry: item.warranty_expiry ? item.warranty_expiry.slice(0,10) : '',
      location: item.location||'', team_id: item.team_id||'', status: item.status||'active',
      notes: item.notes||''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateEquipment(editItem.id, form);
        addToast('Equipment updated successfully');
      } else {
        await createEquipment(form);
        addToast('Equipment added successfully');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteEquipment(deleteId);
      addToast('Equipment deleted');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Equipment</h1>
          <p className="text-muted">{items.length} total equipment tracked</p>
        </div>
        <button id="add-equipment-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Equipment
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={14} className="icon" />
          <input placeholder="Search by name or serial..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width:'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          {loading ? <div className="spinner" /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Serial No.</th><th>Category</th>
                  <th>Department</th><th>Location</th><th>Team</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="empty-state">
                      <Cog size={36} />
                      <h3>No equipment found</h3>
                      <p>Add equipment to get started</p>
                    </div>
                  </td></tr>
                ) : items.map((item, i) => (
                  <tr key={item.id}>
                    <td className="text-muted text-sm">{i+1}</td>
                    <td style={{ fontWeight:500 }}>{item.name}</td>
                    <td className="text-muted text-sm">{item.serial_number||'—'}</td>
                    <td className="text-muted">{item.category||'—'}</td>
                    <td className="text-muted">{item.department||'—'}</td>
                    <td className="text-muted">{item.location||'—'}</td>
                    <td className="text-muted">{item.team_name||'—'}</td>
                    <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteId(item.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Equipment' : 'Add Equipment'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2" style={{ marginBottom:14 }}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={f('name')} required placeholder="Equipment name" />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input className="form-input" value={form.serial_number} onChange={f('serial_number')} placeholder="SN-XXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={f('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department} onChange={f('department')} placeholder="Manufacturing, Admin..." />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Employee</label>
              <input className="form-input" value={form.assigned_employee} onChange={f('assigned_employee')} placeholder="Employee name" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={f('location')} placeholder="Plant A - Bay 1" />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input className="form-input" type="date" value={form.purchase_date} onChange={f('purchase_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty Expiry</label>
              <input className="form-input" type="date" value={form.warranty_expiry} onChange={f('warranty_expiry')} />
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select className="form-select" value={form.team_id} onChange={f('team_id')}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={f('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:20 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={f('notes')} placeholder="Optional notes..." />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add Equipment'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Equipment" size="sm">
        <p style={{ color:'var(--text-secondary)', marginBottom:4 }}>Are you sure? This action cannot be undone.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
