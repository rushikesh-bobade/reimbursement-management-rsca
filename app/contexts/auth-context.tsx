import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '~/data/types';
import { store } from '~/data/store';

const SESSION_KEY = 'rms_current_user';

function readSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

interface AuthContextValue {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(readSession);

  const login = (user: User) => {
    writeSession(user);
    store.setCurrentUserId(user.id);
    setCurrentUser(user);
  };

  const logout = () => {
    writeSession(null);
    setCurrentUser(null);
  };

  // Keep store in sync when auth user changes
  useEffect(() => {
    if (currentUser) {
      store.setCurrentUserId(currentUser.id);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: currentUser !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
