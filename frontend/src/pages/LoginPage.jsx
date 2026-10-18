// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// A drawn seating chart: the subject's own artefact, filling in as the page loads.
const CHART = Array.from({ length: 60 }, (_, i) => {
  const col = i % 12;
  const row = Math.floor(i / 12);
  return (col * 3 + row * 5) % 7 === 0 || (col % 5 === 2 && row % 2 === 0);
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid username or password');
      } else if (!error.response) {
        toast.error('Cannot reach the login service. Check that the backend is running and configured for this deployment.');
      } else {
        toast.error(`Login service error (${error.response.status}). Check your deployment configuration.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admit-field">
      <div className="admit-ground">
        <div>
          <img
            className="brand-logo"
            src="/rit_logo.png"
            alt="Rajalakshmi Institute of Technology · Exam Cell"
          />

          <h1 className="admit-headline">Every seat, assigned.</h1>
          <p className="admit-lead">
            The exam cell portal for generating hall seating and scanning
            attendance, so no student sits in the wrong hall.
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

        <div className="admit-facts">
          <div>
            <div className="fact-num">1,800+</div>
            <div className="fact-label">Students seated</div>
          </div>
          <div>
            <div className="fact-num">9</div>
            <div className="fact-label">Departments</div>
          </div>
          <div>
            <div className="fact-num">3</div>
            <div className="fact-label">Blocks</div>
          </div>
        </div>
      </div>

      <div className="admit-stage">
        <div className="admit">
          <div className="admit-body">
            <h2>Admin sign in</h2>
            <p className="note">Use your exam cell credentials to continue.</p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  placeholder="Enter username"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="admit-foot">
              Default credentials: <strong>admin</strong> / <strong>admin123</strong>
            </p>
            <p className="admit-foot">
              Are you a student? <Link to="/lookup" className="link">Check your seat</Link>
            </p>
          </div>

          <div className="perf" />
          <div className="admit-stub">
            <img className="mono" src="/rit_logo.png" alt="RIT" />
            <span className="tag">Exam cell · admit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
