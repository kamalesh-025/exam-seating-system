// src/pages/AttendanceScanner.jsx
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AttendanceScanner() {
  const [regNo, setRegNo] = useState('');
  const [answerSheet, setAnswerSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanLog, setScanLog] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  const lastScannedRef = useRef({ code: '', time: 0 });

  const startCamera = async () => {
    const html5Qrcode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5Qrcode;

    try {
      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const now = Date.now();
          // Prevent double-scanning same code within 5 seconds
          if (decodedText === lastScannedRef.current.code && now - lastScannedRef.current.time < 5000) {
            return;
          }
          lastScannedRef.current = { code: decodedText, time: now };
          
          setRegNo(decodedText);
          handleScan(decodedText); // Automatically mark attendance
        },
        () => {} // Suppress noise
      );
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Camera access denied or not available');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Failed to stop camera:', err);
      }
    }
    setCameraActive(false);
  };

  useEffect(() => {
    // Fetch initial history
    api.get('/attendance/history')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setScanLog(res.data);
        }
      })
      .catch(e => console.error('Failed to fetch attendance history', e));

    // Auto-start camera after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startCamera();
    }, 500);

    return () => { 
      clearTimeout(timer);
      stopCamera(); 
    };
  }, []);

  const handleScan = async (scannedRegNo) => {
    const targetRegNo = typeof scannedRegNo === 'string' ? scannedRegNo : regNo;
    if (!targetRegNo.trim()) { 
      if (!scannedRegNo) toast.error('Enter or scan register number'); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await api.post('/attendance/scan', {
        registerNumber: targetRegNo.trim(),
        answerSheetNumber: answerSheet || 'N/A',
      });
      setLastScanned(res.data);
      setScanLog(prev => [{ ...res.data, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
      setRegNo('');
      setAnswerSheet('');
      toast.success(`✅ ${res.data.studentName} marked present`);
    } catch (e) {
      const errorMsg = e.response?.data?.error || 'Scan failed';
      toast.error(errorMsg);
      // Reset ref time on error so they can try again immediately if it was a real error
      if (errorMsg.includes('already marked')) {
        // Keep the cooldown
      } else {
        lastScannedRef.current.time = 0;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>QR Attendance Scanner</h1>
        <p style={styles.subtitle}>Scan student ID card QR code to mark exam attendance</p>
      </div>

      <div style={styles.grid}>
        {/* Scanner Panel */}
        <div style={styles.scanCard}>

          {/* Camera QR Box */}
          <div id="qr-reader" style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px',
            display: cameraActive ? 'block' : 'none',
          }} />

          <div style={styles.cameraRow}>
            {cameraActive ? (
              <div style={styles.scanStatus}>🟢 Scanner Active - Point at QR Code</div>
            ) : (
              <button style={styles.cameraBtn} onClick={startCamera}>
                📷 Start QR Scanner
              </button>
            )}
          </div>

          <div style={styles.divider}>— or enter manually —</div>

          <input
            style={styles.input}
            placeholder="Register Number"
            value={regNo}
            onChange={e => setRegNo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            autoFocus
          />
          <input
            style={styles.input}
            placeholder="Answer Sheet Number (optional)"
            value={answerSheet}
            onChange={e => setAnswerSheet(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
          />

          <button
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : '✅ Mark Present'}
          </button>

          {lastScanned && (
            <div style={styles.successCard}>
              <div style={styles.successIcon}>✅</div>
              <div style={styles.successName}>{lastScanned.studentName}</div>
              <div style={styles.successInfo}>{lastScanned.registerNumber}</div>
              <div style={styles.successInfo}>
                Room: <strong>{lastScanned.room}</strong> | Seat: <strong>{lastScanned.seatNumber}</strong>
              </div>
              {lastScanned.answerSheet && lastScanned.answerSheet !== 'N/A' && (
                <div style={styles.successInfo}>Answer Sheet: <strong>{lastScanned.answerSheet}</strong></div>
              )}
            </div>
          )}
        </div>

        {/* Scan Log */}
        <div style={styles.logCard}>
          <h3 style={styles.logTitle}>
            Live Attendance Log
            <span style={styles.logCount}>{scanLog.length} scanned</span>
          </h3>
          {scanLog.length === 0 ? (
            <div style={styles.emptyLog}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👁️</div>
              <div>No scans yet. Start scanning to see live attendance.</div>
            </div>
          ) : (
            scanLog.map((s, i) => (
              <div key={i} style={styles.logItem}>
                <div style={styles.logDot} />
                <div style={{ flex: 1 }}>
                  <div style={styles.logName}>{s.studentName}</div>
                  <div style={styles.logDetail}>
                    {s.registerNumber} — Room {s.room}, Seat {s.seatNumber}
                  </div>
                </div>
                <div style={styles.logTime}>{s.time}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* How it works */}
      <div style={styles.instructions}>
        <h3 style={styles.instrTitle}>How It Works</h3>
        <div style={styles.instrGrid}>
          {[
            { step: '1', text: 'Click "Start QR Scanner" button' },
            { step: '2', text: 'Point camera at student ID card QR code' },
            { step: '3', text: 'System detects QR and auto-marks attendance' },
            { step: '4', text: 'Check the Live Log for instant confirmation' },
            { step: '5', text: 'Ready for next student instantly!' },
          ].map(i => (
            <div key={i.step} style={styles.instrItem}>
              <div style={styles.stepBadge}>{i.step}</div>
              <div style={styles.stepText}>{i.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  scanCard: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cameraRow: { marginBottom: '16px' },
  cameraBtn: {
    width: '100%', padding: '14px',
    background: '#1e293b',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer',
  },
  scanStatus: {
    padding: '12px',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '10px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '700',
    border: '1px solid #86efac',
  },
  divider: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '16px 0' },
  input: {
    display: 'block', width: '100%',
    padding: '14px 16px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '15px', marginBottom: '12px',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer',
  },
  successCard: {
    marginTop: '24px', background: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '14px', padding: '20px', textAlign: 'center',
  },
  successIcon: { fontSize: '32px', marginBottom: '8px' },
  successName: { fontSize: '18px', fontWeight: '700', color: '#166534' },
  successInfo: { fontSize: '13px', color: '#15803d', marginTop: '6px' },
  logCard: {
    background: 'white', borderRadius: '16px',
    padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflowY: 'auto', maxHeight: '500px',
  },
  logTitle: {
    fontSize: '16px', fontWeight: '700', color: '#0f172a',
    marginBottom: '20px', marginTop: 0,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logCount: {
    background: '#dbeafe', color: '#1e40af',
    padding: '4px 12px', borderRadius: '100px',
    fontSize: '12px', fontWeight: '700',
  },
  emptyLog: { color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '40px 0', lineHeight: 1.6 },
  logItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  logDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 },
  logName: { fontSize: '14px', fontWeight: '600', color: '#0f172a' },
  logDetail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  logTime: { fontSize: '11px', color: '#94a3b8', flexShrink: 0 },
  instructions: { background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  instrTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', marginTop: 0 },
  instrGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  instrItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  stepBadge: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0,
  },
  stepText: { fontSize: '14px', color: '#374151' },
};