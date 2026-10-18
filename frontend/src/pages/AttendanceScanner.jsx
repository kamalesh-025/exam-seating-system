// src/pages/AttendanceScanner.jsx
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import { MdQrCodeScanner, MdCheckCircle, MdUndo, MdDeleteSweep } from 'react-icons/md';
import toast from 'react-hot-toast';

const STEPS = [
  'Pick the exam date, then click "Start QR scanner" to open the camera.',
  'Point the camera at the student ID card QR code.',
  'Attendance is marked automatically and logged below.',
  'Marked someone by mistake? Use Undo on the row, or clear the whole day and retake.',
];

const todayStr = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export default function AttendanceScanner() {
  const [regNo, setRegNo] = useState('');
  const [answerSheet, setAnswerSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanLog, setScanLog] = useState([]);
  const [examDate, setExamDate] = useState(todayStr());
  const [examDates, setExamDates] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  const loadHistory = async (date) => {
    try {
      const res = await api.get('/attendance/history', { params: { date } });
      setScanLog(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch attendance history', e);
    }
  };

  const handleScan = async (scannedRegNo) => {
    const targetRegNo = (typeof scannedRegNo === 'string' ? scannedRegNo : regNo).trim();
    if (!targetRegNo) {
      toast.error('Enter or scan a register number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/attendance/scan', {
        registerNumber: targetRegNo,
        answerSheetNumber: answerSheet || 'N/A',
        examDate,
      });
      setLastScanned(res.data);
      setScanLog(prev => {
        const rest = prev.filter(x => x.id !== res.data.id);
        return [res.data, ...rest];
      });
      setRegNo('');
      setAnswerSheet('');
      toast.success(`${res.data.studentName} marked present`);
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Scan failed';
      toast.error(errorMsg);
      if (!errorMsg.includes('already marked')) {
        lastScannedRef.current.time = 0;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (entry) => {
    if (!entry.id) return;
    setBusy(true);
    try {
      await api.delete(`/attendance/${entry.id}`);
      setScanLog(prev => prev.filter(x => x.id !== entry.id));
      if (lastScanned?.id === entry.id) setLastScanned(null);
      toast.success(`Removed attendance for ${entry.studentName}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not undo attendance');
    } finally {
      setBusy(false);
    }
  };

  const clearDay = async () => {
    if (!scanLog.length) return;
    if (!window.confirm(
      `Clear all ${scanLog.length} attendance record(s) for ${examDate}? You can retake them afterwards.`
    )) return;
    setBusy(true);
    try {
      await api.delete(`/attendance/date/${examDate}`);
      setScanLog([]);
      setLastScanned(null);
      toast.success('Attendance cleared for this day');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not clear attendance');
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    if (scannerRef.current) return;
    setCameraActive(true);
    // Wait for the reader container to become visible before mounting the scanner.
    await new Promise(r => setTimeout(r, 120));

    const html5Qrcode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5Qrcode;

    try {
      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const now = Date.now();
          if (decodedText === lastScannedRef.current.code && now - lastScannedRef.current.time < 5000) {
            return;
          }
          lastScannedRef.current = { code: decodedText, time: now };
          setRegNo(decodedText);
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Camera unavailable. Check permissions or enter the number manually.');
      setCameraActive(false);
      scannerRef.current = null;
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch (err) {
        console.warn('Failed to stop camera:', err);
      }
    }
    setCameraActive(false);
  };

  // Load the list of exam dates and choose a sensible default (today, else newest).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/attendance/dates');
        const dates = Array.isArray(res.data) ? res.data : [];
        if (cancelled) return;
        setExamDates(dates);
        const t = todayStr();
        setExamDate(dates.includes(t) ? t : (dates[0] || t));
      } catch (e) {
        console.error('Failed to load exam dates', e);
      }
    })();
    return () => { cancelled = true; stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload the log whenever the selected exam date changes.
  useEffect(() => {
    loadHistory(examDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examDate]);

  const dateOptions = examDates.includes(examDate) ? examDates : [examDate, ...examDates];
  const noSeating = examDates.length > 0 && !examDates.includes(examDate);

  return (
    <div className="page rise">
      <div className="page-head">
        <div>
          <h1 className="page-title">QR attendance</h1>
          <p className="page-sub">Scan a student ID card QR code to mark exam attendance.</p>
        </div>
        <div className="att-controls">
          <label className="att-date">
            <span>Exam date</span>
            <select
              className="input"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
            >
              {dateOptions.map(d => (
                <option key={d} value={d}>
                  {d}{examDates.includes(d) ? '' : ' (no seating)'}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-danger btn-sm"
            onClick={clearDay}
            disabled={busy || !scanLog.length}
            title="Clear this day's attendance and retake"
          >
            <MdDeleteSweep size={18} /> Clear day
          </button>
        </div>
      </div>

      {noSeating && (
        <div className="alert alert-danger" style={{ marginTop: 0 }}>
          No seating arrangement has been generated for {examDate}. Generate seating first, then mark attendance.
        </div>
      )}

      <div className="grid grid-2 mb-24">
        <div className="card">
          <div id="qr-reader" style={{ display: cameraActive ? 'block' : 'none' }} />

          {!cameraActive && (
            <div className="qr-placeholder">
              <MdQrCodeScanner size={40} />
              <span>Camera is off</span>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            {cameraActive ? (
              <div className="badge badge-ok" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                Scanner active. Point at a QR code
              </div>
            ) : (
              <button className="btn btn-dark btn-block" onClick={startCamera}>
                <MdQrCodeScanner size={19} /> Start QR scanner
              </button>
            )}
          </div>

          <div className="divider">
            or enter manually
          </div>

          <input
            className="input"
            placeholder="Register number"
            value={regNo}
            onChange={e => setRegNo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
          />
          <input
            className="input"
            style={{ marginTop: 12 }}
            placeholder="Answer sheet number (optional)"
            value={answerSheet}
            onChange={e => setAnswerSheet(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
          />

          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 14 }}
            onClick={() => handleScan()}
            disabled={loading}
          >
            {loading ? 'Processing…' : 'Mark present'}
          </button>

          {lastScanned && (
            <div className="scan-success">
              <MdCheckCircle size={30} />
              <div className="name">{lastScanned.studentName}</div>
              <div className="meta">{lastScanned.registerNumber}</div>
              <div className="meta">
                Room {lastScanned.room} · Seat {lastScanned.seatNumber}
              </div>
              {lastScanned.answerSheet && lastScanned.answerSheet !== 'N/A' && (
                <div className="meta">Answer sheet {lastScanned.answerSheet}</div>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ maxHeight: 560, overflowY: 'auto' }}>
          <div className="card-title-row">
            <h3 className="card-title" style={{ margin: 0 }}>Attendance · {examDate}</h3>
            <span className="badge badge-accent">{scanLog.length} present</span>
          </div>

          {scanLog.length === 0 ? (
            <div className="empty">No attendance marked for this day yet. Scans will appear here.</div>
          ) : (
            scanLog.map((s, i) => (
              <div key={s.id ?? i} className="log-item rise" style={{ '--d': `${Math.min(i, 8) * 40}ms` }}>
                <div className="log-dot" />
                <div style={{ flex: 1 }}>
                  <div className="log-name">{s.studentName}</div>
                  <div className="log-detail">
                    {s.registerNumber} · Room {s.room}, Seat {s.seatNumber}
                    {s.answerSheet && s.answerSheet !== 'N/A' ? ` · Sheet ${s.answerSheet}` : ''}
                  </div>
                </div>
                <div className="log-time">{s.time}</div>
                <button
                  className="log-undo"
                  title="Undo this scan"
                  aria-label={`Undo attendance for ${s.studentName}`}
                  onClick={() => handleUndo(s)}
                  disabled={busy || !s.id}
                >
                  <MdUndo size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">How it works</h3>
        <div className="feature-list" style={{ marginBottom: 0 }}>
          {STEPS.map((text, i) => (
            <div key={i} className="feature-item rise" style={{ '--d': `${120 + i * 60}ms` }}>
              <span className="brand-mark" style={{ width: 26, height: 26, borderRadius: 7, fontSize: 12 }}>
                {i + 1}
              </span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
