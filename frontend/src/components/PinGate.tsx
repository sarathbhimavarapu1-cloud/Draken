import { useState } from 'react';

interface PinGateProps {
  onUnlock: (password: string) => boolean;
}

export default function PinGate({ onUnlock }: PinGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onUnlock(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className={`auth-card pin-card ${shaking ? 'shake' : ''}`}>
        {/* Logo */}
        <div className="auth-logo">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="plg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="14" fill="url(#plg)" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
              fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
          </svg>
          <span className="auth-logo-text">Draken</span>
        </div>

        {/* Lock icon */}
        <div className="pin-lock-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="auth-title">Personal Access</h1>
        <p className="auth-subtitle">Enter your password to open Draken</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              id="pin-input"
              type="password"
              className={`form-input pin-input ${error ? 'input-error' : ''}`}
              placeholder="Enter password…"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              Incorrect password. Try again.
            </div>
          )}

          <button
            id="pin-submit-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!password}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Enter Draken
          </button>
        </form>

        <p className="pin-footer-note">🔒 Personal — not a public service</p>
      </div>
    </div>
  );
}
