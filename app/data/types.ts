export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type ExpenseCategory =
  | 'Travel'
  | 'Meals'
  | 'Accommodation'
  | 'Office Supplies'
  | 'Software'
  | 'Hardware'
  | 'Training'
  | 'Other';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW';

export type ApprovalConditionType = 'PERCENTAGE' | 'ROLE' | 'HYBRID';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
  managerName?: string;
}

export interface ApprovalHistory {
  id: string;
  step: number;
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED' | 'PENDING';
  comment?: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  amountInBaseCurrency: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  submittedAt: string;
  status: ExpenseStatus;
  currentStep: number;
  receiptUrl?: string;
  approvalHistory: ApprovalHistory[];
}

export interface ApprovalRule {
  id: string;
  step: number;
  name: string;
  approverRole: UserRole;
  conditionType: ApprovalConditionType;
  percentageThreshold?: number;
  requiredRole?: UserRole;
  description: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}
