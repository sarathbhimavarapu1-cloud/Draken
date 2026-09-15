import React, { createContext, useContext } from 'react';

// AuthContext is kept as a stub — Firebase auth has been replaced by PinGate.
// ChatPage no longer uses this, but it's here to prevent import errors in legacy files.

interface AuthContextType {
  user: null;
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
  return (
    <AuthContext.Provider value={{
      user: null,
      loading: false,
      logout: async () => {},
      isConfigured: false,
      isDemo: false,
      enterDemoMode: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};
