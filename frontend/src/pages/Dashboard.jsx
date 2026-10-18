// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  MdMeetingRoom, MdEventSeat, MdUploadFile,
  MdQrCodeScanner, MdArrowForward
} from 'react-icons/md';

const DEPARTMENTS = ['CSE', 'ECE', 'AIDS', 'AIML', 'MECH', 'BIOTECH', 'CSBS', 'CCE', 'VLSI'];

const QUICK_ACTIONS = [
  { label: 'Upload Students', desc: 'Import the exam list from Excel or CSV', href: '/upload', icon: <MdUploadFile size={20} /> },
  { label: 'Configure Rooms', desc: 'Enable or disable halls before an exam', href: '/rooms', icon: <MdMeetingRoom size={20} /> },
  { label: 'Generate Seating', desc: 'Allocate seats and export the PDF', href: '/generate', icon: <MdEventSeat size={20} /> },
  { label: 'QR Attendance', desc: 'Scan ID cards to mark attendance', href: '/attendance', icon: <MdQrCodeScanner size={20} /> },
];

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms')
      .then(r => { setRooms(r.data); setLoading(false); })
      .catch(e => { console.error('Failed to fetch rooms', e); setLoading(false); });
  }, []);

  const available = rooms.filter(r => r.available).length;
  const totalCapacity = rooms.filter(r => r.available)
    .reduce((sum, r) => sum + (r.capacity || 30), 0);

  const blockSummary = ['A', 'B', 'C'].map(b => ({
    block: b,
    total: rooms.filter(r => r.block?.blockName === b).length,
    available: rooms.filter(r => r.block?.blockName === b && r.available).length,
  }));

  const stats = [
    { label: 'Total rooms', value: rooms.length },
    { label: 'Available rooms', value: available },
    { label: 'Seating capacity', value: totalCapacity },
    { label: 'Departments', value: DEPARTMENTS.length },
  ];

  return (
    <div className="page">
      <div className="page-head rise">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Rajalakshmi Institute of Technology · Exam Cell ·{' '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-4 mb-24">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat rise" style={{ '--d': `${60 + i * 50}ms` }}>
            <div className="stat-value">{loading ? '…' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 mb-24 rise" style={{ '--d': '280ms' }}>
        <div className="card">
          <h2 className="card-title">Rooms by block</h2>
          {blockSummary.map(b => (
            <div key={b.block} className="block-row">
              <div className="block-name">Block {b.block}</div>
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: `${b.total ? (b.available / b.total) * 100 : 0}%` }}
                />
              </div>
              <div className="block-count">{b.available}/{b.total}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="card-title">Departments</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DEPARTMENTS.map(d => (
              <span key={d} className="badge">{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card rise" style={{ '--d': '340ms' }}>
        <h2 className="card-title">Quick actions</h2>
        <div className="quick-list">
          {QUICK_ACTIONS.map(action => (
            <Link key={action.label} to={action.href} className="quick">
              <span className="quick-icon">{action.icon}</span>
              <span style={{ flex: 1 }}>
                <span className="quick-label">{action.label}</span>
                <span className="quick-desc">{action.desc}</span>
              </span>
              <MdArrowForward size={18} color="var(--muted-soft)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
