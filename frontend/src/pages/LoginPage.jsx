// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.badge}>Exam Cell Portal</div>
          <h1 style={styles.heroTitle}>Intelligent Exam<br />Seating System</h1>
          <p style={styles.heroSub}>
            Rajalakshmi Institute of Technology<br />
            Automated • Secure • Smart
          </p>
          <div style={styles.stats}>
            <div style={styles.statItem}><span style={styles.statNum}>1800+</span><span style={styles.statLabel}>Students</span></div>
            <div style={styles.statItem}><span style={styles.statNum}>9</span><span style={styles.statLabel}>Departments</span></div>
            <div style={styles.statItem}><span style={styles.statNum}>3</span><span style={styles.statLabel}>Blocks</span></div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🎓</div>
          <h2 style={styles.cardTitle}>Admin Login</h2>
          <p style={styles.cardSub}>Sign in to access the exam cell dashboard</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.lookupLink}>
            Are you a student?{' '}
            <a href="/lookup" style={styles.link}>Check your seat →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif" },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  leftContent: { maxWidth: '480px' },
  badge: {
    display: 'inline-block',
    background: 'rgba(59,130,246,0.2)',
    border: '1px solid rgba(59,130,246,0.4)',
    color: '#60a5fa',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '800',
    lineHeight: 1.15,
    margin: '0 0 20px',
    letterSpacing: '-1px',
  },
  heroSub: { color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '48px' },
  stats: { display: 'flex', gap: '40px' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statNum: { color: '#3b82f6', fontSize: '32px', fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: '13px' },
  right: {
    width: '480px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
  },
  cardIcon: { fontSize: '40px', marginBottom: '16px' },
  cardTitle: { fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' },
  cardSub: { color: '#64748b', fontSize: '14px', marginBottom: '36px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc',
  },
  btn: {
    padding: '15px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
  lookupLink: { textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600' },
};