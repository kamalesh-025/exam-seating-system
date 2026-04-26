// src/pages/UploadStudents.jsx
import { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function UploadStudents() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const valid = f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv');
    if (!valid) { toast.error('Please upload .xlsx, .xls or .csv file'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/students/upload', formData);
      setResult(res.data);
      setUploadedFileName(file.name);
      toast.success(`Uploaded ${res.data.uploaded} students!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload Students</h1>
        <p style={styles.subtitle}>Import student exam data via Excel or CSV file</p>
      </div>

      {/* Format guide */}
      <div style={styles.formatCard}>
        <h3 style={styles.formatTitle}>📋 Required Excel Format</h3>
        <div style={styles.table}>
          <div style={styles.tableHead}>
            {['Register Number', 'Student Name', 'Department', 'Year', 'Course Code', 'Exam Date (YYYY-MM-DD)'].map(h => (
              <div key={h} style={styles.th}>{h}</div>
            ))}
          </div>
          <div style={styles.tableRow}>
            {['2341001', 'Kamalesh R', 'AIML', '2', 'CS23412', '2024-11-15'].map(v => (
              <div key={v} style={styles.td}>{v}</div>
            ))}
          </div>
        </div>
        <p style={styles.note}>⚠️ Row 1 must be the header row. Data starts from Row 2.</p>
      </div>

      {/* Drop Zone */}
      <div
        style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <div style={styles.dropIcon}>📂</div>
        {file ? (
          <>
            <div style={styles.fileName}>📄 {file.name}</div>
            <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); setUploadedFileName(null); setResult(null); fileRef.current.value = null; }} 
              style={{marginTop: '12px', padding: '6px 12px', color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}
            >
              Remove File
            </button>
          </>
        ) : (
          <>
            <div style={styles.dropText}>Drag & drop your file here</div>
            <div style={styles.dropSub}>or click to browse — supports .xlsx, .xls, .csv</div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1, flex: 1 }}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? '⏳ Uploading...' : '🚀 Upload Students'}
        </button>
 
        <button
          style={{ ...styles.btn, background: '#ef4444', flex: 0.4 }}
          onClick={async () => {
            if (window.confirm("ARE YOU SURE? This will delete ALL students, seating arrangements, and attendance logs forever!")) {
              try {
                await api.delete('/students/all');
                toast.success('All data cleared!');
                setResult(null);
                setUploadedFileName(null);
              } catch (e) {
                toast.error('Failed to clear data');
              }
            }
          }}
        >
          🗑️ Clear All Data
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>Upload Summary</h3>
          <div style={styles.resultGrid}>
            <div style={{ ...styles.resultItem, background: '#dcfce7', color: '#166534' }}>
              <div style={styles.resultNum}>{result.uploaded}</div>
              <div style={styles.resultLabel}>Successfully Uploaded</div>
            </div>
            <div style={{ ...styles.resultItem, background: '#fef9c3', color: '#92400e' }}>
              <div style={styles.resultNum}>{result.duplicates}</div>
              <div style={styles.resultLabel}>Duplicates Skipped</div>
            </div>
            <div style={{ ...styles.resultItem, background: '#fee2e2', color: '#991b1b' }}>
              <div style={styles.resultNum}>{result.errors?.length || 0}</div>
              <div style={styles.resultLabel}>Errors</div>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div style={styles.errors}>
              {result.errors.map((e, i) => <div key={i} style={styles.errorItem}>⚠️ {e}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Uploaded File Name at Bottom */}
      {uploadedFileName && (
        <div style={styles.uploadedFileBottom}>
          Last Uploaded File: <strong>{uploadedFileName}</strong>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", maxWidth: '800px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  formatCard: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formatTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#374151' },
  table: { border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '13px' },
  tableHead: { display: 'flex', background: '#1e293b' },
  th: { flex: 1, padding: '10px 12px', color: '#e2e8f0', fontWeight: '600' },
  tableRow: { display: 'flex', background: '#f8fafc' },
  td: { flex: 1, padding: '10px 12px', color: '#374151', borderTop: '1px solid #e2e8f0' },
  note: { margin: '12px 0 0', fontSize: '12px', color: '#64748b' },
  dropZone: {
    border: '2.5px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#f8fafc',
    marginBottom: '20px',
  },
  dropZoneActive: { borderColor: '#3b82f6', background: '#eff6ff' },
  dropIcon: { fontSize: '48px', marginBottom: '12px' },
  fileName: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  fileSize: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  dropText: { fontSize: '16px', fontWeight: '600', color: '#374151' },
  dropSub: { fontSize: '13px', color: '#94a3b8', marginTop: '8px' },
  btn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  resultCard: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  resultTitle: { margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  resultItem: { borderRadius: '12px', padding: '20px', textAlign: 'center' },
  resultNum: { fontSize: '36px', fontWeight: '800', lineHeight: 1 },
  resultLabel: { fontSize: '13px', marginTop: '6px', fontWeight: '500' },
  errors: { marginTop: '16px', background: '#fff1f2', borderRadius: '10px', padding: '12px 16px' },
  errorItem: { fontSize: '13px', color: '#991b1b', padding: '4px 0' },
  uploadedFileBottom: { marginTop: '24px', padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '14px' },
};