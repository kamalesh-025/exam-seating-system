import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdUploadFile, MdEventSeat,
  MdMeetingRoom, MdQrCodeScanner, MdLogout
} from 'react-icons/md';
 
const navItems = [
  { to: '/', icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { to: '/upload', icon: <MdUploadFile size={20} />, label: 'Upload Students' },
  { to: '/rooms', icon: <MdMeetingRoom size={20} />, label: 'Room Config' },
  { to: '/generate', icon: <MdEventSeat size={20} />, label: 'Generate Seating' },
  { to: '/attendance', icon: <MdQrCodeScanner size={20} />, label: 'QR Attendance' },
];
 
export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
 
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>RIT</div>
          <div>
            <div style={styles.logoTitle}>ExamSeat</div>
            <div style={styles.logoSub}>Exam Cell Portal</div>
          </div>
        </div>
 
        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
 
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <MdLogout size={20} />
          <span>Logout</span>
        </button>
      </aside>
 
      {/* Main Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
 
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f0f2f5',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '1px',
  },
  logoTitle: { color: 'white', fontWeight: '700', fontSize: '16px' },
  logoSub: { color: '#94a3b8', fontSize: '11px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'rgba(59,130,246,0.15)',
    color: '#3b82f6',
    borderLeft: '3px solid #3b82f6',
  },
  main: { flex: 1, overflowY: 'auto', padding: '32px' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#ef4444',
    background: 'rgba(239,68,68,0.08)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    marginTop: '16px',
  }
};