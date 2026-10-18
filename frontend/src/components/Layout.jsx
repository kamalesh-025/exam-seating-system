import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdUploadFile, MdEventSeat,
  MdMeetingRoom, MdQrCodeScanner, MdLogout, MdMenu
} from 'react-icons/md';

const navItems = [
  { to: '/', icon: <MdDashboard size={19} />, label: 'Dashboard' },
  { to: '/upload', icon: <MdUploadFile size={19} />, label: 'Upload Students' },
  { to: '/rooms', icon: <MdMeetingRoom size={19} />, label: 'Room Config' },
  { to: '/generate', icon: <MdEventSeat size={19} />, label: 'Generate Seating' },
  { to: '/attendance', icon: <MdQrCodeScanner size={19} />, label: 'QR Attendance' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('nav-collapsed') === '1'; } catch { return false; }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem('nav-collapsed', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className={`shell${collapsed ? ' collapsed' : ''}`}>
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="brand">
          <img className="brand-logo" src="/rit_logo.png" alt="Rajalakshmi Institute of Technology" />
          <button
            className="rail-toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <MdMenu size={18} />
          </button>
        </div>
        <div className="brand-text">
          <div className="brand-title">ExamSeat</div>
          <div className="brand-sub">Exam Cell Portal</div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
              title={item.label}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout" onClick={handleLogout} title="Logout">
          <MdLogout size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <div
        className={`sidebar-scrim${menuOpen ? ' open' : ''}`}
        onClick={closeMenu}
      />

      <main className="main">
        <div className="topbar">
          <button
            className="icon-btn"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <MdMenu size={22} />
          </button>
          <span className="topbar-title">ExamSeat</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
