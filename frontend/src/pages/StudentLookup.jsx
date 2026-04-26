// src/pages/StudentLookup.jsx
// This is the PUBLIC page - no auth needed. Can be embedded in IMS portal.
import { useState } from 'react';
import api from '../api/axios';

export default function StudentLookup() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!regNo.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/student/lookup/${regNo.trim()}`);
      setResult(res.data);
    } catch {
      setError('No seating arrangement found for this register number. Please contact the exam cell.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoBox}>RIT</div>
          <div>
            <div style={styles.logoTitle}>ExamSeat Lookup</div>
            <div style={styles.logoSub}>Rajalakshmi Institute of Technology</div>
          </div>
        </div>

        <h1 style={styles.title}>Find Your Exam Seat</h1>
        <p style={styles.subtitle}>Enter your register number to instantly view your exam hall and seat</p>

        <div style={styles.searchBox}>
          <input
            style={styles.input}
            placeholder="Enter Register Number (e.g. 2341001)"
            value={regNo}
            onChange={e => setRegNo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.btn} onClick={handleSearch} disabled={loading}>
            {loading ? '🔍' : '→'}
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div style={styles.result}>
            <div style={styles.resultHeader}>
              <div style={styles.checkIcon}>✅</div>
              <div>
                <div style={styles.studentName}>{result.studentName}</div>
                <div style={styles.studentReg}>{result.registerNumber} | {result.department}</div>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>🏛️</div>
                <div style={styles.infoLabel}>Block</div>
                <div style={styles.infoValue}>Block {result.block}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>🏢</div>
                <div style={styles.infoLabel}>Floor</div>
                <div style={styles.infoValue}>{result.floor === 0 ? 'Ground' : `Floor ${result.floor}`}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>🚪</div>
                <div style={styles.infoLabel}>Room</div>
                <div style={styles.infoValue}>{result.room}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>🪑</div>
                <div style={styles.infoLabel}>Seat No.</div>
                <div style={styles.infoValue}>{result.seatNumber}</div>
              </div>
            </div>

            <div style={styles.examInfo}>
              <span>📚 {result.courseCode}</span>
              <span>📅 {result.examDate}</span>
            </div>
          </div>
        )}

        <p style={styles.footer}>
          <a href="/login" style={styles.adminLink}>Admin Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' },
  logoBox: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: '800', fontSize: '13px',
  },
  logoTitle: { fontWeight: '700', fontSize: '15px', color: '#0f172a' },
  logoSub: { fontSize: '12px', color: '#64748b' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' },
  subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: 1.5 },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: {
    flex: 1, padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
  },
  btn: {
    width: '52px', height: '52px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '20px',
    cursor: 'pointer', fontWeight: '700',
  },
  error: {
    background: '#fff1f2', color: '#991b1b',
    padding: '14px 18px', borderRadius: '12px',
    fontSize: '13px', marginBottom: '16px',
    border: '1px solid #fca5a5',
  },
  result: {
    background: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  resultHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  checkIcon: { fontSize: '32px' },
  studentName: { fontSize: '18px', fontWeight: '800', color: '#0f172a' },
  studentReg: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' },
  infoItem: { background: 'white', borderRadius: '12px', padding: '16px 12px', textAlign: 'center' },
  infoIcon: { fontSize: '22px', marginBottom: '6px' },
  infoLabel: { fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoValue: { fontSize: '16px', fontWeight: '800', color: '#0f172a' },
  examInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', padding: '12px 0 0', borderTop: '1px solid #bbf7d0' },
  footer: { textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '24px', marginBottom: 0 },
  adminLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600' },
};