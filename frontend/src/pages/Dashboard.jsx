// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

const DEPT_COLORS = {
  CSE: '#3b82f6', ECE: '#10b981', AIDS: '#f59e0b',
  AIML: '#8b5cf6', MECH: '#ef4444', BIOTECH: '#06b6d4',
  CSBS: '#f97316', CCE: '#84cc16', VLSI: '#ec4899'
};

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms')
      .then(r => { setRooms(r.data); setLoading(false); })
      .catch(e => { console.error('Failed to fetch rooms', e); setLoading(false); });
  }, []);

  const available = rooms.filter(r => r.available).length;
  const totalCapacity = available * 30;

  const blockSummary = ['A', 'B', 'C'].map(b => ({
    block: b,
    total: rooms.filter(r => r.block?.blockName === b).length,
    available: rooms.filter(r => r.block?.blockName === b && r.available).length,
  }));

  const depts = ['CSE', 'ECE', 'AIDS', 'AIML', 'MECH', 'BIOTECH', 'CSBS', 'CCE', 'VLSI'];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Rajalakshmi Institute of Technology — Exam Cell</p>
        </div>
        <div style={styles.dateBadge}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Rooms', value: rooms.length, icon: '🏛️', color: '#3b82f6' },
          { label: 'Available Rooms', value: available, icon: '✅', color: '#10b981' },
          { label: 'Total Capacity', value: totalCapacity, icon: '👥', color: '#8b5cf6' },
          { label: 'Departments', value: 9, icon: '🎓', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={{ ...styles.statNum, color: stat.color }}>{loading ? '...' : stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.row}>
        {/* Block Summary */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Block-wise Room Status</h2>
          {blockSummary.map(b => (
            <div key={b.block} style={styles.blockRow}>
              <div style={styles.blockLabel}>Block {b.block}</div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${b.total ? (b.available / b.total) * 100 : 0}%`
                }} />
              </div>
              <div style={styles.blockCount}>{b.available}/{b.total}</div>
            </div>
          ))}
        </div>

        {/* Departments */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Departments (9)</h2>
          <div style={styles.deptGrid}>
            {depts.map(d => (
              <div key={d} style={{
                ...styles.deptBadge,
                background: DEPT_COLORS[d] + '20',
                border: `1.5px solid ${DEPT_COLORS[d]}40`,
                color: DEPT_COLORS[d],
              }}>
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          {[
            { label: 'Upload Students', desc: 'Import CSV/Excel with student data', href: '/upload', icon: '📤', color: '#3b82f6' },
            { label: 'Configure Rooms', desc: 'Enable/disable rooms before exam', href: '/rooms', icon: '🏫', color: '#10b981' },
            { label: 'Generate Seating', desc: 'Auto-allocate seats and download PDF', href: '/generate', icon: '🪑', color: '#8b5cf6' },
            { label: 'QR Attendance', desc: 'Scan ID cards for exam attendance', href: '/attendance', icon: '📱', color: '#f59e0b' },
          ].map(action => (
            <a key={action.label} href={action.href} style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, background: action.color + '15', color: action.color }}>
                {action.icon}
              </div>
              <div style={styles.actionLabel}>{action.label}</div>
              <div style={styles.actionDesc}>{action.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  dateBadge: {
    background: 'white',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '28px', marginBottom: '12px' },
  statNum: { fontSize: '36px', fontWeight: '800', lineHeight: 1 },
  statLabel: { color: '#64748b', fontSize: '13px', marginTop: '6px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '0',
  },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', marginTop: 0 },
  blockRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  blockLabel: { width: '60px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  progressBar: { flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '100px', transition: 'width 0.5s' },
  blockCount: { fontSize: '13px', color: '#64748b', width: '40px', textAlign: 'right' },
  deptGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  deptBadge: { padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  actionCard: {
    background: '#f8fafc',
    borderRadius: '14px',
    padding: '20px',
    textDecoration: 'none',
    border: '1.5px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  actionIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '12px' },
  actionLabel: { fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  actionDesc: { fontSize: '12px', color: '#64748b', lineHeight: 1.4 },
};