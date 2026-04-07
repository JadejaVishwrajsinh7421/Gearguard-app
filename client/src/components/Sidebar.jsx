import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  CalendarDays,
  Users,
  UsersRound,
  Shield,
  Cog,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/equipment',   label: 'Equipment',   icon: Cog },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/calendar',    label: 'Calendar',    icon: CalendarDays },
  { to: '/teams',       label: 'Teams',       icon: UsersRound },
  { to: '/users',       label: 'Users',       icon: Users },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={20} strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">GearGuard</span>
          <span className="sidebar-tagline">Maintenance Tracker</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Navigation</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">R</div>
          <div>
            <div className="sidebar-user-name">Rahul Sharma</div>
            <div className="sidebar-user-role">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
