import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import './Navbar.css';

const titles = {
  '/': { title: 'Dashboard', desc: 'Overview of your maintenance operations' },
  '/equipment': { title: 'Equipment', desc: 'Manage all registered equipment' },
  '/maintenance': { title: 'Maintenance', desc: 'Kanban board — track request stages' },
  '/calendar': { title: 'Calendar', desc: 'Scheduled maintenance timeline' },
  '/teams': { title: 'Teams', desc: 'Manage maintenance teams' },
  '/users': { title: 'Users', desc: 'Manage technicians and staff' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const info = titles[pathname] || titles['/'];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">{info.title}</h2>
        <p className="navbar-desc">{info.desc}</p>
      </div>
      <div className="navbar-right">
        <span className="navbar-date">
          {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
        </span>
      </div>
    </header>
  );
}
