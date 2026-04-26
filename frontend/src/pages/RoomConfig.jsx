// src/pages/RoomConfig.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function RoomConfig() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
      setLoading(false);
    } catch (e) {
      setError('Failed to load rooms. Check if backend is running.');
      setLoading(false);
    }
  };

  const toggleRoom = async (id) => {
    try {
      await api.put(`/rooms/${id}/toggle`);
      setRooms(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r));
      toast.success('Room status updated');
    } catch (e) {
      toast.error('Failed to update room');
    }
  };

  const blocks = ['A', 'B', 'C'];
  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter(r => r.block?.blockName === filter);

  if (loading) return (
    <div style={styles.centered}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <p>Loading rooms...</p>
    </div>
  );

  if (error) return (
    <div style={styles.centered}>
      <div style={{ fontSize: '40px' }}>❌</div>
      <p style={{ color: '#ef4444' }}>{error}</p>
      <button style={styles.retryBtn} onClick={fetchRooms}>Retry</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Room Configuration</h1>
          <p style={styles.subtitle}>Enable or disable rooms before generating seating arrangements</p>
        </div>
        <div style={styles.summary}>
          <span style={styles.availableBadge}>✅ {rooms.filter(r => r.available).length} Available</span>
          <span style={styles.disabledBadge}>🔒 {rooms.filter(r => !r.available).length} Disabled</span>
        </div>
      </div>

      <div style={styles.filters}>
        {['ALL', ...blocks].map(b => (
          <button
            key={b}
            style={filter === b ? { ...styles.filterBtn, ...styles.filterActive } : styles.filterBtn}
            onClick={() => setFilter(b)}
          >
            {b === 'ALL' ? 'All Blocks' : `Block ${b}`}
          </button>
        ))}
      </div>

      {blocks.filter(b => filter === 'ALL' || filter === b).map(blockName => {
        const blockRooms = filteredRooms.filter(r => r.block?.blockName === blockName);
        if (!blockRooms.length) return null;

        const floors = [...new Set(blockRooms.map(r => r.floorNumber))].sort((a, b) => a - b);

        return (
          <div key={blockName} style={styles.blockSection}>
            <h2 style={styles.blockTitle}>
              Block {blockName}
              <span style={styles.blockCount}>
                {blockRooms.filter(r => r.available).length}/{blockRooms.length} available
              </span>
            </h2>

            {floors.map(floor => (
              <div key={floor} style={styles.floorSection}>
                <div style={styles.floorLabel}>
                  Floor {floor} {floor === 0 ? '(Ground)' : ''}
                </div>
                <div style={styles.roomGrid}>
                  {blockRooms.filter(r => r.floorNumber === floor).map(room => (
                    <div
                      key={room.id}
                      style={room.available
                        ? { ...styles.roomCard, ...styles.roomAvailable }
                        : { ...styles.roomCard, ...styles.roomDisabled }
                      }
                      onClick={() => toggleRoom(room.id)}
                    >
                      <div style={styles.roomNumber}>{room.roomNumber}</div>
                      <div style={styles.roomCap}>30 seats</div>
                      <div style={styles.roomStatus}>
                        {room.available ? '✅ Active' : '🔒 Disabled'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  centered: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '60vh', gap: '16px',
  },
  retryBtn: {
    padding: '10px 24px', background: '#3b82f6',
    color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px',
    flexWrap: 'wrap', gap: '16px',
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  summary: { display: 'flex', gap: '10px' },
  availableBadge: {
    padding: '8px 16px', background: '#dcfce7',
    color: '#166534', borderRadius: '100px',
    fontSize: '13px', fontWeight: '600',
  },
  disabledBadge: {
    padding: '8px 16px', background: '#fee2e2',
    color: '#991b1b', borderRadius: '100px',
    fontSize: '13px', fontWeight: '600',
  },
  filters: { display: 'flex', gap: '8px', marginBottom: '24px' },
  filterBtn: {
    padding: '8px 20px', borderRadius: '100px',
    border: '1.5px solid #e2e8f0', background: 'white',
    cursor: 'pointer', fontSize: '13px',
    fontWeight: '600', color: '#374151',
  },
  filterActive: {
    background: '#0f172a', color: 'white',
    borderColor: '#0f172a',
  },
  blockSection: {
    marginBottom: '24px', background: 'white',
    borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  blockTitle: {
    fontSize: '18px', fontWeight: '800',
    color: '#0f172a', marginBottom: '20px',
    marginTop: 0, display: 'flex',
    alignItems: 'center', gap: '12px',
  },
  blockCount: {
    fontSize: '13px', fontWeight: '500',
    color: '#64748b', background: '#f1f5f9',
    padding: '4px 12px', borderRadius: '100px',
  },
  floorSection: { marginBottom: '20px' },
  floorLabel: {
    fontSize: '13px', fontWeight: '600',
    color: '#64748b', marginBottom: '10px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  roomGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  roomCard: {
    width: '110px', borderRadius: '12px',
    padding: '14px 12px', textAlign: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  roomAvailable: { background: '#f0fdf4', borderColor: '#86efac' },
  roomDisabled: { background: '#fff1f2', borderColor: '#fca5a5', opacity: 0.6 },
  roomNumber: { fontSize: '15px', fontWeight: '800', color: '#0f172a' },
  roomCap: { fontSize: '11px', color: '#64748b', margin: '4px 0' },
  roomStatus: { fontSize: '11px', fontWeight: '600' },
};