// src/pages/StudentLookup.jsx
// Public page - no auth needed. Can be embedded in the IMS portal.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { MdSearch } from 'react-icons/md';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS = Array.from({ length: 30 }, (_, i) => {
  const col = i % 6;
  const row = Math.floor(i / 6) + 1;
  return `${LETTERS[col]}${row}`;
});

// The exam hall plan, filling in as the page loads.
const CHART = Array.from({ length: 48 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  return (col * 3 + row * 5) % 7 === 0 || (col % 4 === 1 && row % 2 === 0);
});

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
    <div className="lookup-field">
      <div className="lookup-grid">
        <div className="lookup-intro rise">
          <h1 className="admit-headline">Find your seat.</h1>
          <p className="admit-lead">
            Enter your register number to see your block, room and seat marked
            on the exam hall plan.
          </p>
          <div className="chart" aria-hidden="true">
            {CHART.map((on, i) => (
              <span
                key={i}
                className={`cell${on ? ' filled' : ''}`}
                style={{ '--d': `${i * 9}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="ticket rise" style={{ '--d': '120ms' }}>
          <div className="ticket-top">
            <img
              className="brand-logo"
              src="/rit_logo.png"
              alt="Rajalakshmi Institute of Technology"
            />
            <span className="ticket-no">{result ? 'Hall ticket' : 'Seat finder'}</span>
          </div>

          <div className="ticket-body">
            <div className="ticket-search">
              <input
                className="input"
                placeholder="Register number, e.g. 2341001"
                value={regNo}
                onChange={e => setRegNo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch} disabled={loading}>
                <MdSearch size={20} />
                <span>{loading ? 'Searching…' : 'Find seat'}</span>
              </button>
            </div>

          {error && <div className="alert alert-danger" style={{ marginTop: 18, marginBottom: 0 }}>{error}</div>}

          {result && (
            <>
              <div className="ticket-holder">
                <div>
                  <div className="muted-sm" style={{ marginBottom: 6 }}>Candidate</div>
                  <div className="holder-name">{result.studentName}</div>
                </div>
                <div className="holder-reg">
                  {result.registerNumber} · {result.department}
                </div>
              </div>

              <div className="ticket-fields">
                <div className="tfld">
                  <div className="k">Block</div>
                  <div className="v">{result.block}</div>
                </div>
                <div className="tfld">
                  <div className="k">Floor</div>
                  <div className="v">{result.floor === 0 ? 'G' : result.floor}</div>
                </div>
                <div className="tfld">
                  <div className="k">Room</div>
                  <div className="v">{result.room}</div>
                </div>
                <div className="tfld">
                  <div className="k">Seat</div>
                  <div className="v">{result.seatNumber}</div>
                </div>
              </div>

              <div className="seat-chart" aria-label={`Seat plan for room ${result.room}`}>
                {SEATS.map(s => (
                  <div key={s} className={`seat-cell${s === result.seatNumber ? ' mine' : ''}`}>
                    {s}
                  </div>
                ))}
              </div>
              <p className="chart-caption">
                Room {result.room} · your seat {result.seatNumber} is marked.
              </p>

              <div className="ticket-meta">
                <span>Course {result.courseCode}</span>
                <span>Exam {result.examDate}</span>
              </div>
            </>
          )}

            <p className="admit-foot">
              <Link to="/login" className="link">Admin login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
