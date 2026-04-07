import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users as UsersIcon } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, getTeams } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const ROLES = ['admin','manager','technician'];
const emptyForm = { name:'', email:'', role:'technician', team_id:'' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([getUsers(), getTeams()]);
      setUsers(uRes.data.data);
      setTeams(tRes.data.data);
    } catch { addToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name:u.name, email:u.email, role:u.role, team_id:u.team_id||'' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        addToast('User updated');
      } else {
        await createUser(form);
        addToast('User added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      addToast('User deleted');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="text-muted">{users.length} team members</p>
        </div>
        <button id="add-user-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>User</th><th>Email</th><th>Role</th><th>Team</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <UsersIcon size={36} />
                      <h3>No users yet</h3>
                      <p>Add team members to get started</p>
                    </div>
                  </td></tr>
                ) : users.map((u, i) => (
                  <tr key={u.id}>
                    <td className="text-muted text-sm">{i+1}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%', background:'var(--accent-glow)',
                          border:'1px solid var(--accent)', display:'flex', alignItems:'center',
                          justifyContent:'center', color:'var(--accent)', fontWeight:700, fontSize:12, flexShrink:0
                        }}>
                          {initials(u.name)}
                        </div>
                        <span style={{ fontWeight:500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td className="text-muted">{u.team_name||'—'}</td>
                    <td className="text-muted text-sm">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(u.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add User'} size="md">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2" style={{ marginBottom:14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={f('name')} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={f('email')} required placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={f('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select className="form-select" value={form.team_id} onChange={f('team_id')}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editUser ? 'Update User' : 'Add User'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
        <p style={{ color:'var(--text-secondary)' }}>Are you sure you want to delete this user?</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
