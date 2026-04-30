/**
 * Simple in-memory store for demo purposes (replaces a real database).
 * All mutations trigger re-renders via event listeners.
 */
import type { Expense, User, ApprovalRule } from './types';
import { MOCK_USERS, MOCK_EXPENSES, MOCK_APPROVAL_RULES, MOCK_USERS as SEED_USERS } from './mock-data';

type StoreListener = () => void;

class Store {
  private users: User[] = [...MOCK_USERS];
  private expenses: Expense[] = [...MOCK_EXPENSES];
  private approvalRules: ApprovalRule[] = [...MOCK_APPROVAL_RULES];
  private currentUserId: string = 'u1';
  private listeners: Set<StoreListener> = new Set();

  subscribe(listener: StoreListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ---- Current User ----
  getCurrentUser(): User {
    return this.users.find((u) => u.id === this.currentUserId) ?? this.users[0];
  }

  setCurrentUserId(id: string) {
    this.currentUserId = id;
    this.notify();
  }

  // ---- Users ----
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: `u${Date.now()}` };
    const manager = this.users.find((u) => u.id === newUser.managerId);
    if (manager) newUser.managerName = manager.name;
    this.users = [...this.users, newUser];
    this.notify();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): void {
    this.users = this.users.map((u) => {
      if (u.id !== id) return u;
      const updated = { ...u, ...updates };
      if (updates.managerId) {
        const manager = this.users.find((m) => m.id === updates.managerId);
        updated.managerName = manager?.name;
      }
      return updated;
    });
    this.notify();
  }

  deleteUser(id: string): void {
    this.users = this.users.filter((u) => u.id !== id);
    this.notify();
  }

  // ---- Expenses ----
  getExpenses(): Expense[] {
    return [...this.expenses];
  }

  getExpensesByUser(userId: string): Expense[] {
    return this.expenses.filter((e) => e.employeeId === userId);
  }

  getPendingForApprover(approverId: string): Expense[] {
    const approver = this.users.find((u) => u.id === approverId);
    if (!approver) return [];

    return this.expenses.filter((e) => {
      if (e.status === 'APPROVED' || e.status === 'REJECTED') return false;
      const currentStepHistory = e.approvalHistory.find(
        (h) => h.step === e.currentStep && h.action === 'PENDING'
      );
      if (!currentStepHistory) return false;
      // Admin sees everything pending, Manager sees their reports
      if (approver.role === 'ADMIN') return true;
      if (approver.role === 'MANAGER') {
        const employee = this.users.find((u) => u.id === e.employeeId);
        return employee?.managerId === approverId;
      }
      return false;
    });
  }

  addExpense(expense: Omit<Expense, 'id' | 'submittedAt' | 'status' | 'currentStep' | 'approvalHistory'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: `e${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      currentStep: 1,
      approvalHistory: [
        {
          id: `ah${Date.now()}`,
          step: 1,
          approverId: '',
          approverName: 'Pending Review',
          action: 'PENDING',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.expenses = [newExpense, ...this.expenses];
    this.notify();
    return newExpense;
  }

  approveExpense(expenseId: string, approverId: string, comment?: string): void {
    this.expenses = this.expenses.map((e) => {
      if (e.id !== expenseId) return e;
      const approver = this.users.find((u) => u.id === approverId);
      const updatedHistory = e.approvalHistory.map((h) =>
        h.step === e.currentStep && h.action === 'PENDING'
          ? { ...h, action: 'APPROVED' as const, comment, approverId, approverName: approver?.name ?? 'Unknown', timestamp: new Date().toISOString() }
          : h
      );
      const rules = this.approvalRules.sort((a, b) => a.step - b.step);
      const nextRule = rules.find((r) => r.step > e.currentStep);
      if (nextRule && e.amountInBaseCurrency >= (nextRule.percentageThreshold ?? 0)) {
        return {
          ...e,
          status: 'IN_REVIEW' as const,
          currentStep: nextRule.step,
          approvalHistory: [
            ...updatedHistory,
            { id: `ah${Date.now()}`, step: nextRule.step, approverId: '', approverName: 'Pending Review', action: 'PENDING' as const, timestamp: new Date().toISOString() },
          ],
        };
      }
      return { ...e, status: 'APPROVED' as const, approvalHistory: updatedHistory };
    });
    this.notify();
  }

  rejectExpense(expenseId: string, approverId: string, comment?: string): void {
    this.expenses = this.expenses.map((e) => {
      if (e.id !== expenseId) return e;
      const approver = this.users.find((u) => u.id === approverId);
      const updatedHistory = e.approvalHistory.map((h) =>
        h.step === e.currentStep && h.action === 'PENDING'
          ? { ...h, action: 'REJECTED' as const, comment, approverId, approverName: approver?.name ?? 'Unknown', timestamp: new Date().toISOString() }
          : h
      );
      return { ...e, status: 'REJECTED' as const, approvalHistory: updatedHistory };
    });
    this.notify();
  }

  // ---- Approval Rules ----
  getApprovalRules(): ApprovalRule[] {
    return [...this.approvalRules].sort((a, b) => a.step - b.step);
  }

  addApprovalRule(rule: Omit<ApprovalRule, 'id'>): ApprovalRule {
    const newRule: ApprovalRule = { ...rule, id: `r${Date.now()}` };
    this.approvalRules = [...this.approvalRules, newRule];
    this.notify();
    return newRule;
  }

  updateApprovalRule(id: string, updates: Partial<ApprovalRule>): void {
    this.approvalRules = this.approvalRules.map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.notify();
  }

  deleteApprovalRule(id: string): void {
    this.approvalRules = this.approvalRules.filter((r) => r.id !== id);
    this.notify();
  }
}

export const store = new Store();
