import { useState, useEffect } from 'react';
import ChatPage from './pages/ChatPage';
import PinGate from './components/PinGate';

// ── Password gate ──────────────────────────────────────────────────────────────
// Set VITE_APP_PASSWORD in your Vercel environment variables.
// Falls back to 'draken2024' for local dev — change it!
const APP_PASSWORD = (import.meta.env.VITE_APP_PASSWORD as string) || 'Darling17';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  // Persist unlock state across page refreshes (localStorage)
  useEffect(() => {
    if (localStorage.getItem('draken_unlocked') === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = (password: string): boolean => {
    if (password === APP_PASSWORD) {
      localStorage.setItem('draken_unlocked', 'true');
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const handleLock = () => {
    localStorage.removeItem('draken_unlocked');
    setUnlocked(false);
  };

  if (!unlocked) return <PinGate onUnlock={handleUnlock} />;
  return <ChatPage onLock={handleLock} />;
}

export default App;
