import { useEffect, useState } from 'react';
import { Plus, Trash2, UsersRound } from 'lucide-react';
import { getTeams, createTeam, deleteTeam } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTeams();
      setTeams(res.data.data);
    } catch { addToast('Failed to load teams', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTeam({ name });
      addToast('Team created');
      setModalOpen(false);
      setName('');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create team', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteTeam(deleteId);
      addToast('Team deleted');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p className="text-muted">{teams.length} maintenance teams</p>
        </div>
        <button id="add-team-btn" className="btn btn-primary" onClick={() => { setName(''); setModalOpen(true); }}>
          <Plus size={15} /> Add Team
        </button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {teams.length === 0 ? (
            <div className="empty-state card" style={{ gridColumn:'1/-1' }}>
              <UsersRound size={40} />
              <h3>No teams yet</h3>
              <p>Create your first team to get started</p>
            </div>
          ) : teams.map((team, i) => (
            <div className="card" key={team.id} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:12, background:'var(--accent-glow)',
                  border:'1px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--accent)', fontWeight:700, fontSize:18,
                }}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{team.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>Team #{i+1}</div>
                </div>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(team.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, fontSize:12, color:'var(--text-muted)' }}>
                Created {new Date(team.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Team" size="sm">
        <form onSubmit={handleCreate}>
          <div className="form-group" style={{ marginBottom:20 }}>
            <label className="form-label">Team Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mechanical Team" autoFocus />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Team'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Team" size="sm">
        <p style={{ color:'var(--text-secondary)' }}>Are you sure? Users in this team will be unassigned.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
