import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isConfigured: boolean;
  isDemo: boolean;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  logout: async () => {},
  isConfigured: false,
  isDemo: false,
  enterDemoMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    if (isFirebaseConfigured && user) {
      await signOut(auth);
    }
    setIsDemo(false);
    setUser(null);
  };

  const enterDemoMode = () => setIsDemo(true);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      logout,
      isConfigured: isFirebaseConfigured,
      isDemo,
      enterDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
