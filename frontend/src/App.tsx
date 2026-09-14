import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import SetupPage from './pages/SetupPage';

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#lg)" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
            fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
        </svg>
        <span className="loading-logo-text">Draken</span>
      </div>
      <div className="loading-dots">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}

// ── App Router ────────────────────────────────────────────────────────────────
function App() {
  const { user, loading, isConfigured, isDemo } = useAuth();

  // Show setup guide when Firebase keys are still placeholders
  if (!isConfigured && !isDemo) return <SetupPage />;

  // Firebase configured — show spinner while auth state resolves
  if (isConfigured && loading) return <LoadingScreen />;

  // Not signed in and not in demo mode → login
  if (!user && !isDemo) return <LoginPage />;

  // Authenticated (real or demo) → main chat
  return <ChatPage />;
}

export default App;
