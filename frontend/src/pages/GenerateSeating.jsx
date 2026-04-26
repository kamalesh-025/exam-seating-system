// src/pages/GenerateSeating.jsx
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

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
      toast.success('Seating generated successfully!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await api.get(`/seating/pdf/${examDate}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Seating_Arrangement_${examDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Generate Seating</h1>
        <p style={styles.subtitle}>Auto-allocate seats with department mixing and anti-malpractice constraints</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🗓️ Select Exam Date</h3>
        <input
          type="date"
          style={styles.dateInput}
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
        />

        <div style={styles.features}>
          {[
            '✅ Department mixing to prevent malpractice',
            '✅ Max 30 students per room enforced',
            '✅ Only enabled rooms are used',
            '✅ Duplicate student detection',
            '✅ Even distribution across blocks A, B, C',
          ].map(f => <div key={f} style={styles.feature}>{f}</div>)}
        </div>

        <button
          style={{ ...styles.genBtn, opacity: loading ? 0.7 : 1 }}
          onClick={generate}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : '🪑 Generate Seating Arrangement'}
        </button>
      </div>

      {result && (
        <div style={styles.resultCard}>
          <h3 style={styles.cardTitle}>✅ Generation Complete — {result.examDate}</h3>
          <div style={styles.resultGrid}>
            {[
              { label: 'Total Students', value: result.totalStudents, icon: '👥', color: '#3b82f6' },
              { label: 'Rooms Used', value: result.totalRoomsUsed, icon: '🏛️', color: '#8b5cf6' },
              { label: 'Seats Assigned', value: result.arrangements, icon: '🪑', color: '#10b981' },
            ].map(r => (
              <div key={r.label} style={{ ...styles.resultItem, borderColor: r.color + '40' }}>
                <div style={styles.resultIcon}>{r.icon}</div>
                <div style={{ ...styles.resultNum, color: r.color }}>{r.value}</div>
                <div style={styles.resultLabel}>{r.label}</div>
              </div>
            ))}
          </div>
          <button style={styles.pdfBtn} onClick={downloadPdf}>
            📥 Download PDF Seating Report
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", maxWidth: '700px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  card: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
  dateInput: { padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '15px', marginBottom: '24px', width: '240px' },
  features: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' },
  feature: { fontSize: '14px', color: '#374151', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' },
  genBtn: { padding: '15px 32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  resultCard: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' },
  resultItem: { background: '#f8fafc', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '2px solid #e2e8f0' },
  resultIcon: { fontSize: '28px', marginBottom: '8px' },
  resultNum: { fontSize: '36px', fontWeight: '800' },
  resultLabel: { fontSize: '13px', color: '#64748b', marginTop: '6px' },
  pdfBtn: { padding: '14px 28px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};