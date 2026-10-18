// src/pages/GenerateSeating.jsx
import { useState } from 'react';
import api from '../api/axios';
import { MdCheck, MdDownload } from 'react-icons/md';
import toast from 'react-hot-toast';

const FEATURES = [
  'Department mixing to prevent malpractice',
  'Per-room capacity enforced',
  'Only enabled rooms are used',
  'Duplicate student detection',
  'Even distribution across blocks A, B and C',
];

export default function GenerateSeating() {
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!examDate) { toast.error('Please select an exam date'); return; }
    setLoading(true);
    try {
      const res = await api.post('/seating/generate', { examDate });
      setResult(res.data);
      toast.success('Seating generated');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get(`/seating/pdf/${examDate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Seating_Arrangement_${examDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="page page-narrow rise">
      <div className="page-head">
        <div>
          <h1 className="page-title">Generate seating</h1>
          <p className="page-sub">
            Auto-allocate seats with department mixing and anti-malpractice constraints.
          </p>
        </div>
      </div>

      <div className="card mb-24">
        <h3 className="card-title">Exam date</h3>
        <div className="field" style={{ maxWidth: 260 }}>
          <input
            type="date"
            className="input"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
          />
        </div>

        <div className="feature-list mt-24">
          {FEATURES.map((f, i) => (
            <div key={f} className="feature-item rise" style={{ '--d': `${120 + i * 45}ms` }}>
              <MdCheck size={17} color="var(--ok)" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate seating'}
        </button>
      </div>

      {result && (
        <div className="card">
          <h3 className="card-title">Seating generated · {result.examDate}</h3>
          <div className="grid grid-3 mb-24">
            <div className="stat">
              <div className="stat-value">{result.totalStudents}</div>
              <div className="stat-label">Total students</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.totalRoomsUsed}</div>
              <div className="stat-label">Rooms used</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.arrangements}</div>
              <div className="stat-label">Seats assigned</div>
            </div>
          </div>
          <button className="btn btn-dark" onClick={downloadPdf}>
            <MdDownload size={18} /> Download PDF report
          </button>
        </div>
      )}
    </div>
  );
}
