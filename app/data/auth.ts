/**
 * Demo credential store for the login page.
 * In a real app, authentication would be handled server-side.
 */
import type { User } from './types';
import { MOCK_USERS } from './mock-data';

export interface DemoCredential {
  email: string;
  password: string;
  userId: string;
  role: string;
  label: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { email: 'alice@techcorp.com',  password: 'admin123',    userId: 'u1', role: 'Admin',    label: 'Alice Johnson' },
  { email: 'bob@techcorp.com',    password: 'manager123',  userId: 'u2', role: 'Manager',  label: 'Bob Martinez'  },
  { email: 'carol@techcorp.com',  password: 'manager123',  userId: 'u3', role: 'Manager',  label: 'Carol White'   },
  { email: 'david@techcorp.com',  password: 'employee123', userId: 'u4', role: 'Employee', label: 'David Lee'     },
];

/** Validates email + password and returns the matching user or null. */
export function authenticate(email: string, password: string): User | null {
  const cred = DEMO_CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
  );
  if (!cred) return null;
  return MOCK_USERS.find((u) => u.id === cred.userId) ?? null;
}
