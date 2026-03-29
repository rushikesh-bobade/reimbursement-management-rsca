// In-memory data store for demo mode
// This replaces Prisma queries since we don't have a live PostgreSQL connection

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type ExpenseStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
export type ExpenseCategory = "TRAVEL" | "MEALS" | "OFFICE_SUPPLIES" | "EQUIPMENT" | "SOFTWARE" | "OTHER";

export interface Company {
  id: string;
  name: string;
  baseCurrency: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  avatarUrl?: string;
  companyId: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  currentLevel: number;
  submitterId: string;
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  level: number;
  roleName: string;
  roleType: Role;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApprovalQueueItem {
  id: string;
  expenseId: string;
  level: number;
  approverId?: string;
  status: ExpenseStatus;
  comment?: string;
  actionAt?: string;
}

// --- Seed Data ---

export const company: Company = {
  id: "comp_1",
  name: "Acme Corp",
  baseCurrency: "USD",
};

export const users: User[] = [
  {
    id: "user_1",
    email: "alice@acme.com",
    name: "Alice Johnson",
    role: "EMPLOYEE",
    department: "Engineering",
    avatarUrl: "",
    companyId: "comp_1",
  },
  {
    id: "user_2",
    email: "bob@acme.com",
    name: "Bob Martinez",
    role: "MANAGER",
    department: "Engineering",
    avatarUrl: "",
    companyId: "comp_1",
  },
  {
    id: "user_3",
    email: "carol@acme.com",
    name: "Carol Williams",
    role: "ADMIN",
    department: "Finance",
    avatarUrl: "",
    companyId: "comp_1",
  },
];

let expenseIdCounter = 6;

export let expenses: Expense[] = [
  {
    id: "exp_1",
    amount: 245.50,
    currency: "USD",
    category: "TRAVEL",
    description: "Flight to NYC for client meeting",
    date: "2026-03-25",
    status: "APPROVED",
    currentLevel: 2,
    submitterId: "user_1",
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "exp_2",
    amount: 89.99,
    currency: "EUR",
    category: "MEALS",
    description: "Team lunch with stakeholders",
    date: "2026-03-26",
    status: "PENDING",
    currentLevel: 1,
    submitterId: "user_1",
    createdAt: "2026-03-26T14:30:00Z",
  },
  {
    id: "exp_3",
    amount: 1200.00,
    currency: "USD",
    category: "EQUIPMENT",
    description: "New monitor for home office setup",
    date: "2026-03-27",
    status: "IN_REVIEW",
    currentLevel: 1,
    submitterId: "user_1",
    createdAt: "2026-03-27T09:15:00Z",
  },
  {
    id: "exp_4",
    amount: 55.00,
    currency: "GBP",
    category: "OFFICE_SUPPLIES",
    description: "Printer paper and ink cartridges",
    date: "2026-03-28",
    status: "REJECTED",
    currentLevel: 1,
    submitterId: "user_1",
    createdAt: "2026-03-28T11:00:00Z",
  },
  {
    id: "exp_5",
    amount: 15000,
    currency: "INR",
    category: "SOFTWARE",
    description: "Annual Figma Pro subscription",
    date: "2026-03-29",
    status: "PENDING",
    currentLevel: 1,
    submitterId: "user_1",
    createdAt: "2026-03-29T08:00:00Z",
  },
];

export let approvalRules: ApprovalRule[] = [
  {
    id: "rule_1",
    companyId: "comp_1",
    level: 1,
    roleName: "Manager",
    roleType: "MANAGER",
  },
  {
    id: "rule_2",
    companyId: "comp_1",
    level: 2,
    roleName: "Finance",
    roleType: "ADMIN",
  },
];

export let approvalQueue: ApprovalQueueItem[] = [
  { id: "aq_1", expenseId: "exp_1", level: 1, approverId: "user_2", status: "APPROVED", actionAt: "2026-03-25T12:00:00Z" },
  { id: "aq_2", expenseId: "exp_1", level: 2, approverId: "user_3", status: "APPROVED", actionAt: "2026-03-25T14:00:00Z" },
  { id: "aq_3", expenseId: "exp_2", level: 1, status: "PENDING" },
  { id: "aq_4", expenseId: "exp_3", level: 1, status: "PENDING" },
  { id: "aq_5", expenseId: "exp_4", level: 1, approverId: "user_2", status: "REJECTED", comment: "Not a valid business expense", actionAt: "2026-03-28T15:00:00Z" },
  { id: "aq_6", expenseId: "exp_5", level: 1, status: "PENDING" },
];

// --- Mutations ---

export function addExpense(data: {
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string;
  receiptUrl?: string;
  submitterId: string;
}): Expense {
  const newExpense: Expense = {
    id: `exp_${++expenseIdCounter}`,
    ...data,
    status: "PENDING",
    currentLevel: 1,
    createdAt: new Date().toISOString(),
  };
  expenses = [newExpense, ...expenses];

  // Create initial approval queue entry
  approvalQueue.push({
    id: `aq_${Date.now()}`,
    expenseId: newExpense.id,
    level: 1,
    status: "PENDING",
  });

  return newExpense;
}

export function approveExpense(expenseId: string, approverId: string, comment?: string): boolean {
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) return false;

  const currentQueueItem = approvalQueue.find(
    (q) => q.expenseId === expenseId && q.level === expense.currentLevel && q.status === "PENDING"
  );
  if (!currentQueueItem) return false;

  // Mark current level as approved
  currentQueueItem.status = "APPROVED";
  currentQueueItem.approverId = approverId;
  currentQueueItem.comment = comment;
  currentQueueItem.actionAt = new Date().toISOString();

  // Check if there's a next level
  const maxLevel = Math.max(...approvalRules.map((r) => r.level));
  if (expense.currentLevel < maxLevel) {
    // Move to next level
    expense.currentLevel += 1;
    expense.status = "IN_REVIEW";

    // Create next queue item
    approvalQueue.push({
      id: `aq_${Date.now()}`,
      expenseId: expense.id,
      level: expense.currentLevel,
      status: "PENDING",
    });
  } else {
    // Final approval
    expense.status = "APPROVED";
  }

  return true;
}

export function rejectExpense(expenseId: string, approverId: string, comment?: string): boolean {
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) return false;

  const currentQueueItem = approvalQueue.find(
    (q) => q.expenseId === expenseId && q.level === expense.currentLevel && q.status === "PENDING"
  );
  if (!currentQueueItem) return false;

  currentQueueItem.status = "REJECTED";
  currentQueueItem.approverId = approverId;
  currentQueueItem.comment = comment;
  currentQueueItem.actionAt = new Date().toISOString();
  expense.status = "REJECTED";

  return true;
}

export function addApprovalRule(data: {
  roleName: string;
  roleType: Role;
  minAmount?: number;
  maxAmount?: number;
}): ApprovalRule {
  const maxLevel = approvalRules.length > 0 ? Math.max(...approvalRules.map((r) => r.level)) : 0;
  const newRule: ApprovalRule = {
    id: `rule_${Date.now()}`,
    companyId: "comp_1",
    level: maxLevel + 1,
    ...data,
  };
  approvalRules = [...approvalRules, newRule];
  return newRule;
}

export function removeApprovalRule(ruleId: string): boolean {
  const index = approvalRules.findIndex((r) => r.id === ruleId);
  if (index === -1) return false;

  approvalRules = approvalRules.filter((r) => r.id !== ruleId);
  // Re-order levels
  approvalRules = approvalRules
    .sort((a, b) => a.level - b.level)
    .map((r, i) => ({ ...r, level: i + 1 }));

  return true;
}

export function getExpensesForUser(userId: string): Expense[] {
  return expenses.filter((e) => e.submitterId === userId);
}

export function getPendingExpenses(): Expense[] {
  return expenses.filter((e) => e.status === "PENDING" || e.status === "IN_REVIEW");
}

export function getAllExpenses(): Expense[] {
  return [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getExpenseWithApprovals(expenseId: string) {
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) return null;

  const queue = approvalQueue
    .filter((q) => q.expenseId === expenseId)
    .sort((a, b) => a.level - b.level);

  const submitter = users.find((u) => u.id === expense.submitterId);

  return { expense, queue, submitter };
}
