import { useState, useEffect } from 'react';
import type { User } from '~/data/types';

const SESSION_KEY = 'rms_current_user';

/** Reads the current session from sessionStorage (persists across client nav). */
function readSession(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** Persists the session to sessionStorage. */
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

/**
 * Simple client-side auth hook.
 * login() sets the session; logout() clears it.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => readSession());

  const login = (user: User) => {
    writeSession(user);
    setCurrentUser(user);
  };

  const logout = () => {
    writeSession(null);
    setCurrentUser(null);
  };

  return { currentUser, login, logout, isAuthenticated: currentUser !== null };
}

export { SESSION_KEY };
