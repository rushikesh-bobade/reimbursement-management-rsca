import { useState } from 'react';
import styles from './pending-approvals.module.css';
import { FiltersAndSearch } from '../blocks/pending-approvals/filters-and-search';
import { PendingExpensesTable } from '../blocks/pending-approvals/pending-expenses-table';
import { ApprovalDetailModal } from '../blocks/pending-approvals/approval-detail-modal';
import { useStore } from '~/hooks/use-store';
import type { Expense } from '~/data/types';
import type { FiltersState } from '~/blocks/pending-approvals/filters-and-search';
import { ProtectedRoute } from '~/components/protected-route/protected-route';

function PendingApprovalsContent() {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const allExpenses = store.getExpenses();

  const [filters, setFilters] = useState<FiltersState>({ search: '', category: '', status: '' });
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const displayExpenses = currentUser.role === 'EMPLOYEE'
    ? allExpenses.filter((e) => e.employeeId === currentUser.id)
    : allExpenses;

  const filtered = displayExpenses.filter((e) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!e.employeeName.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false;
    }
    if (filters.category && e.category !== filters.category) return false;
    if (filters.status && e.status !== filters.status) return false;
    return true;
  });

  const doApprove = (expenseId: string, comment: string) => {
    store.approveExpense(expenseId, currentUser.id, comment);
  };

  const doReject = (expenseId: string, comment: string) => {
    store.rejectExpense(expenseId, currentUser.id, comment);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pending Approvals</h1>
        <p className={styles.subtitle}>
          {currentUser.role === 'EMPLOYEE'
            ? 'Track the status of your submitted expenses.'
            : 'Review and action expenses awaiting your approval.'}
        </p>
      </div>

      <FiltersAndSearch filters={filters} onFiltersChange={setFilters} />

      <PendingExpensesTable
        expenses={filtered}
        onView={(expense) => setSelectedExpense(expense)}
        onApprove={(expense) => setSelectedExpense(expense)}
        onReject={(expense) => setSelectedExpense(expense)}
      />

      <ApprovalDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onApprove={doApprove}
        onReject={doReject}
      />
    </div>
  );
}

export default function PendingApprovals() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <PendingApprovalsContent />
    </ProtectedRoute>
  );
}
