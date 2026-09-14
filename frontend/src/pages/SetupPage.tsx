import React from 'react';
import { useAuth } from '../context/AuthContext';


// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="setup-step">
      <div className="setup-step-num">{n}</div>
      <div className="setup-step-body">
        <h3 className="setup-step-title">{title}</h3>
        <div className="setup-step-content">{children}</div>
      </div>
    </div>
  );
}

// ── Code snippet ─────────────────────────────────────────────────────────────
function Code({ children }: { children: string }) {
  return (
    <pre className="setup-code"><code>{children}</code></pre>
  );
}

// ── SetupPage ─────────────────────────────────────────────────────────────────
export default function SetupPage() {
  const { enterDemoMode } = useAuth();

  return (
    <div className="setup-page">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <div className="setup-logo">
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="slg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <rect width="48" height="48" rx="14" fill="url(#slg)" />
              <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
                fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
            </svg>
          </div>
          <h1 className="setup-title">Welcome to Draken</h1>
          <p className="setup-subtitle">
            Firebase setup is required to enable authentication. Follow the steps below,
            or try the app in <strong>demo mode</strong> right now — no setup needed.
          </p>
          <button className="btn btn-primary btn-lg" onClick={enterDemoMode} id="try-demo-btn">
            <span>⚡</span> Try Demo Mode
          </button>
          <p className="setup-demo-note">Demo mode works without Firebase — chats are not saved between sessions.</p>
        </div>

        {/* Divider */}
        <div className="setup-divider">
          <span>or set up Firebase for full auth</span>
        </div>

        {/* Steps */}
        <div className="setup-steps">
          <Step n={1} title="Create a Firebase Project">
            <p>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="setup-link">console.firebase.google.com</a> and click <strong>Add project</strong>. Give it any name (e.g. <em>draken</em>).</p>
          </Step>

          <Step n={2} title="Enable Authentication">
            <p>In your project, go to <strong>Authentication → Sign-in method</strong> and enable:</p>
            <ul className="setup-list">
              <li>✉️ &nbsp;<strong>Email/Password</strong></li>
              <li>🔵 &nbsp;<strong>Google</strong></li>
            </ul>
          </Step>

          <Step n={3} title="Get Your Web App Config">
            <p>Go to <strong>Project Settings → Your apps → Add app → Web</strong>. Copy the config object.</p>
          </Step>

          <Step n={4} title="Paste Config into firebase.ts">
            <p>Open <code className="inline-code">frontend/src/firebase.ts</code> and replace the placeholder values:</p>
            <Code>{`const firebaseConfig = {
  apiKey: "AIza...",          // ← paste your values
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...",
};`}</Code>
          </Step>

          <Step n={5} title="Restart the Dev Server">
            <Code>{`cd frontend\nnpm run dev`}</Code>
            <p>The app will automatically detect your config and show the login screen.</p>
          </Step>
        </div>
      </div>
    </div>
  );
}
