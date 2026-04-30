import type { User, Expense, ApprovalRule } from './types';

export const COMPANY_NAME = 'TechCorp International';
export const BASE_CURRENCY = 'USD';

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.65,
  CHF: 1.12,
  CNY: 0.14,
  INR: 0.012,
  MXN: 0.058,
  BRL: 0.19,
  SGD: 0.74,
};

export const EXPENSE_CATEGORIES: string[] = [
  'Travel',
  'Meals',
  'Accommodation',
  'Office Supplies',
  'Software',
  'Hardware',
  'Training',
  'Other',
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@techcorp.com', role: 'ADMIN' },
  { id: 'u2', name: 'Bob Martinez', email: 'bob@techcorp.com', role: 'MANAGER', managerId: 'u1', managerName: 'Alice Johnson' },
  { id: 'u3', name: 'Carol White', email: 'carol@techcorp.com', role: 'MANAGER', managerId: 'u1', managerName: 'Alice Johnson' },
  { id: 'u4', name: 'David Lee', email: 'david@techcorp.com', role: 'EMPLOYEE', managerId: 'u2', managerName: 'Bob Martinez' },
  { id: 'u5', name: 'Eva Brown', email: 'eva@techcorp.com', role: 'EMPLOYEE', managerId: 'u2', managerName: 'Bob Martinez' },
  { id: 'u6', name: 'Frank Wilson', email: 'frank@techcorp.com', role: 'EMPLOYEE', managerId: 'u3', managerName: 'Carol White' },
  { id: 'u7', name: 'Grace Kim', email: 'grace@techcorp.com', role: 'EMPLOYEE', managerId: 'u3', managerName: 'Carol White' },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    employeeId: 'u4',
    employeeName: 'David Lee',
    amount: 850,
    currency: 'EUR',
    amountInBaseCurrency: 918,
    category: 'Travel',
    description: 'Flight to Berlin for Q3 conference',
    date: '2024-07-10',
    submittedAt: '2024-07-11T09:23:00Z',
    status: 'PENDING',
    currentStep: 1,
    approvalHistory: [
      { id: 'ah1', step: 1, approverId: 'u2', approverName: 'Bob Martinez', action: 'PENDING', timestamp: '2024-07-11T09:23:00Z' },
    ],
  },
  {
    id: 'e2',
    employeeId: 'u5',
    employeeName: 'Eva Brown',
    amount: 120,
    currency: 'USD',
    amountInBaseCurrency: 120,
    category: 'Meals',
    description: 'Team dinner with client from Acme Corp',
    date: '2024-07-08',
    submittedAt: '2024-07-09T14:10:00Z',
    status: 'APPROVED',
    currentStep: 2,
    approvalHistory: [
      { id: 'ah2', step: 1, approverId: 'u2', approverName: 'Bob Martinez', action: 'APPROVED', comment: 'Approved – valid business expense', timestamp: '2024-07-09T16:00:00Z' },
      { id: 'ah3', step: 2, approverId: 'u1', approverName: 'Alice Johnson', action: 'APPROVED', comment: 'All good', timestamp: '2024-07-10T10:15:00Z' },
    ],
  },
  {
    id: 'e3',
    employeeId: 'u6',
    employeeName: 'Frank Wilson',
    amount: 2200,
    currency: 'GBP',
    amountInBaseCurrency: 2794,
    category: 'Hardware',
    description: 'MacBook Pro for development work',
    date: '2024-07-05',
    submittedAt: '2024-07-05T11:00:00Z',
    status: 'IN_REVIEW',
    currentStep: 2,
    approvalHistory: [
      { id: 'ah4', step: 1, approverId: 'u3', approverName: 'Carol White', action: 'APPROVED', comment: 'Necessary equipment', timestamp: '2024-07-06T09:00:00Z' },
      { id: 'ah5', step: 2, approverId: 'u1', approverName: 'Alice Johnson', action: 'PENDING', timestamp: '2024-07-06T09:00:00Z' },
    ],
  },
  {
    id: 'e4',
    employeeId: 'u7',
    employeeName: 'Grace Kim',
    amount: 350,
    currency: 'CAD',
    amountInBaseCurrency: 259,
    category: 'Training',
    description: 'Online React Advanced course subscription',
    date: '2024-07-03',
    submittedAt: '2024-07-03T08:30:00Z',
    status: 'REJECTED',
    currentStep: 1,
    approvalHistory: [
      { id: 'ah6', step: 1, approverId: 'u3', approverName: 'Carol White', action: 'REJECTED', comment: 'Budget exceeded for training this quarter', timestamp: '2024-07-04T10:00:00Z' },
    ],
  },
  {
    id: 'e5',
    employeeId: 'u4',
    employeeName: 'David Lee',
    amount: 55,
    currency: 'USD',
    amountInBaseCurrency: 55,
    category: 'Office Supplies',
    description: 'Ergonomic keyboard and mouse pad',
    date: '2024-07-12',
    submittedAt: '2024-07-12T15:45:00Z',
    status: 'PENDING',
    currentStep: 1,
    approvalHistory: [
      { id: 'ah7', step: 1, approverId: 'u2', approverName: 'Bob Martinez', action: 'PENDING', timestamp: '2024-07-12T15:45:00Z' },
    ],
  },
  {
    id: 'e6',
    employeeId: 'u5',
    employeeName: 'Eva Brown',
    amount: 1800,
    currency: 'EUR',
    amountInBaseCurrency: 1944,
    category: 'Accommodation',
    description: 'Hotel stay for 3 nights – Paris summit',
    date: '2024-06-28',
    submittedAt: '2024-06-29T07:00:00Z',
    status: 'APPROVED',
    currentStep: 2,
    approvalHistory: [
      { id: 'ah8', step: 1, approverId: 'u2', approverName: 'Bob Martinez', action: 'APPROVED', comment: 'Verified hotel booking', timestamp: '2024-06-29T11:00:00Z' },
      { id: 'ah9', step: 2, approverId: 'u1', approverName: 'Alice Johnson', action: 'APPROVED', comment: 'Fine', timestamp: '2024-06-30T09:00:00Z' },
    ],
  },
];

export const MOCK_APPROVAL_RULES: ApprovalRule[] = [
  {
    id: 'r1',
    step: 1,
    name: 'Direct Manager Approval',
    approverRole: 'MANAGER',
    conditionType: 'ROLE',
    description: 'Every expense must be approved by the employee\'s direct manager.',
  },
  {
    id: 'r2',
    step: 2,
    name: 'Admin Final Approval',
    approverRole: 'ADMIN',
    conditionType: 'PERCENTAGE',
    percentageThreshold: 500,
    description: 'Expenses over $500 require additional approval from an Admin.',
  },
  {
    id: 'r3',
    step: 3,
    name: 'Executive Hybrid Review',
    approverRole: 'ADMIN',
    conditionType: 'HYBRID',
    percentageThreshold: 2000,
    requiredRole: 'ADMIN',
    description: 'Expenses over $2,000 require both percentage-based and role-specific executive approval.',
  },
];

export const CURRENT_USER: User = MOCK_USERS[0];
