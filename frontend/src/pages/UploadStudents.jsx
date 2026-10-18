// src/pages/UploadStudents.jsx
import { useState, useRef } from 'react';
import api from '../api/axios';
import { MdCloudUpload, MdInsertDriveFile, MdDeleteOutline } from 'react-icons/md';
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
    const valid = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!valid) { toast.error('Please upload a .xlsx, .xls or .csv file'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const resetFile = () => {
    setFile(null);
    setUploadedFileName(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = null;
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
      toast.success(`Uploaded ${res.data.uploaded} students`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('This deletes ALL students, seating arrangements and attendance records. Continue?')) return;
    try {
      await api.delete('/students/all');
      toast.success('All data cleared');
      resetFile();
    } catch {
      toast.error('Failed to clear data');
    }
  };

  return (
    <div className="page page-narrow rise">
      <div className="page-head">
        <div>
          <h1 className="page-title">Upload students</h1>
          <p className="page-sub">Import the exam list from an Excel or CSV file.</p>
        </div>
      </div>

      <div className="card mb-24">
        <h3 className="card-title">Required file format</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Register no.</th>
                <th>Student name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Course code</th>
                <th>Exam date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2341001</td>
                <td>Kamalesh R</td>
                <td>AIML</td>
                <td>2</td>
                <td>CS23412</td>
                <td>2024-11-15</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="page-sub" style={{ marginTop: 14 }}>
          Row 1 must be the header row. Data starts on row 2. Dates use YYYY-MM-DD.
        </p>
      </div>

      <div
        className={`dropzone rise${dragging ? ' drag' : ''}`}
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
        <div className="dz-icon"><MdCloudUpload size={44} /></div>

        {file ? (
          <>
            <div className="dz-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MdInsertDriveFile size={18} /> {file.name}
            </div>
            <div className="dz-sub">{(file.size / 1024).toFixed(1)} KB</div>
            <button
              className="btn btn-danger btn-sm"
              style={{ marginTop: 14 }}
              onClick={(e) => { e.stopPropagation(); resetFile(); }}
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <div className="dz-title">Drag &amp; drop your file here</div>
            <div className="dz-sub">or click to browse (.xlsx, .xls or .csv)</div>
          </>
        )}
      </div>

      <div className="rise" style={{ display: 'flex', gap: 12, marginTop: 18, '--d': '160ms' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading…' : 'Upload students'}
        </button>
        <button className="btn btn-danger" onClick={clearAll}>
          <MdDeleteOutline size={18} /> Clear all data
        </button>
      </div>

      {result && (
        <div className="card mt-24">
          <h3 className="card-title">Upload summary</h3>
          <div className="result-tiles">
            <div className="tile tile-ok">
              <div className="tile-num">{result.uploaded}</div>
              <div className="tile-label">Uploaded</div>
            </div>
            <div className="tile tile-warn">
              <div className="tile-num">{result.duplicates}</div>
              <div className="tile-label">Duplicates skipped</div>
            </div>
            <div className="tile tile-danger">
              <div className="tile-num">{result.errors?.length || 0}</div>
              <div className="tile-label">Errors</div>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="error-list">
              {result.errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}

          {uploadedFileName && (
            <p className="muted-sm" style={{ marginTop: 16 }}>
              Last uploaded file: <strong>{uploadedFileName}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
