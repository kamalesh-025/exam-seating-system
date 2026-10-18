// src/pages/RoomConfig.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function RoomConfig() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch {
      setError('Failed to load rooms. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = async (id) => {
    try {
      await api.put(`/rooms/${id}/toggle`);
      setRooms(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r));
    } catch {
      toast.error('Failed to update room');
    }
  };

  const blocks = ['A', 'B', 'C'];
  const filteredRooms = filter === 'ALL' ? rooms : rooms.filter(r => r.block?.blockName === filter);

  if (loading) return (
    <div className="centered">
      <MdRefresh size={40} />
      <p>Loading rooms…</p>
    </div>
  );

  if (error) return (
    <div className="centered">
      <p className="muted">{error}</p>
      <button className="btn btn-primary btn-sm" onClick={fetchRooms}>Retry</button>
    </div>
  );

  return (
    <div className="page rise">
      <div className="page-head">
        <div>
          <h1 className="page-title">Room configuration</h1>
          <p className="page-sub">Enable or disable rooms before generating seating arrangements.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-ok">{rooms.filter(r => r.available).length} available</span>
          <span className="badge badge-danger">{rooms.filter(r => !r.available).length} disabled</span>
        </div>
      </div>

      <div className="filter-bar">
        {['ALL', ...blocks].map(b => (
          <button
            key={b}
            className={`chip${filter === b ? ' active' : ''}`}
            onClick={() => setFilter(b)}
          >
            {b === 'ALL' ? 'All blocks' : `Block ${b}`}
          </button>
        ))}
      </div>

      {blocks.filter(b => filter === 'ALL' || filter === b).map((blockName, bi) => {
        const blockRooms = filteredRooms.filter(r => r.block?.blockName === blockName);
        if (!blockRooms.length) return null;

        const floors = [...new Set(blockRooms.map(r => r.floorNumber))].sort((a, b) => a - b);

        return (
          <div key={blockName} className="card room-block rise" style={{ '--d': `${bi * 70}ms` }}>
            <div className="room-block-head">
              <h2>Block {blockName}</h2>
              <span className="muted-sm">
                {blockRooms.filter(r => r.available).length}/{blockRooms.length} available
              </span>
            </div>

            {floors.map(floor => (
              <div key={floor}>
                <div className="floor-label">
                  Floor {floor}{floor === 0 ? ' · ground' : ''}
                </div>
                <div className="room-grid">
                  {blockRooms.filter(r => r.floorNumber === floor).map((room, ri) => (
                    <button
                      key={room.id}
                      className={`room rise ${room.available ? 'on' : 'off'}`}
                      style={{ '--d': `${ri * 30}ms` }}
                      onClick={() => toggleRoom(room.id)}
                    >
                      <div className="room-no">{room.roomNumber}</div>
                      <div className="room-cap">{room.capacity || 30} seats</div>
                      <div className="room-state" style={{ color: room.available ? 'var(--ok)' : 'var(--ink-faint)' }}>
                        {room.available ? 'Active' : 'Disabled'}
                      </div>
                    </button>
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
