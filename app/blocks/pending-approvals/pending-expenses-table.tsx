import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Check, X } from 'lucide-react';
import classnames from 'classnames';
import style from './pending-expenses-table.module.css';
import type { Expense } from '~/data/types';
import { formatCurrency } from '~/hooks/use-currency';
import { BASE_CURRENCY } from '~/data/mock-data';

export interface PendingExpensesTableProps {
  className?: string;
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onApprove: (expense: Expense) => void;
  onReject: (expense: Expense) => void;
  showAll?: boolean;
}

type SortKey = 'employeeName' | 'amountInBaseCurrency' | 'date' | 'status';

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'badge badge--pending',
    IN_REVIEW: 'badge badge--pending',
    APPROVED: 'badge badge--approved',
    REJECTED: 'badge badge--rejected',
  };
  const labelMap: Record<string, string> = {
    PENDING: 'Pending',
    IN_REVIEW: 'In Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return <span className={map[status] ?? 'badge'}>{labelMap[status] ?? status}</span>;
}

export function PendingExpensesTable({ className, expenses, onView, onApprove, onReject, showAll }: PendingExpensesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const sorted = [...expenses].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = showAll ? sorted : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={style.sortIcon}>
      {sortKey === col
        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        : <ChevronDown size={12} opacity={0.3} />}
    </span>
  );

  return (
    <div className={classnames(style.tableWrapper, className)}>
      {paginated.length === 0 ? (
        <p className={style.empty}>No expenses match the current filters.</p>
      ) : (
        <table className={style.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('employeeName')}>Employee <SortIcon col="employeeName" /></th>
              <th>Description</th>
              <th>Category</th>
              <th onClick={() => handleSort('amountInBaseCurrency')}>Amount ({BASE_CURRENCY}) <SortIcon col="amountInBaseCurrency" /></th>
              <th onClick={() => handleSort('date')}>Date <SortIcon col="date" /></th>
              <th onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
              <th>Step</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.employeeName}</td>
                <td><span className={style.desc} title={expense.description}>{expense.description}</span></td>
                <td>{expense.category}</td>
                <td><span className={style.amount}>{formatCurrency(expense.amountInBaseCurrency)}</span></td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td><StatusBadge status={expense.status} /></td>
                <td>Step {expense.currentStep}</td>
                <td>
                  <div className={style.actionCell}>
                    <button className="btn btn--secondary btn--sm" onClick={() => onView(expense)} title="View details">
                      <Eye size={13} />
                    </button>
                    {(expense.status === 'PENDING' || expense.status === 'IN_REVIEW') && (
                      <>
                        <button className="btn btn--success btn--sm" onClick={() => onApprove(expense)} title="Approve">
                          <Check size={13} />
                        </button>
                        <button className="btn btn--danger btn--sm" onClick={() => onReject(expense)} title="Reject">
                          <X size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!showAll && totalPages > 1 && (
        <div className={style.pagination}>
          <span>Page {page} of {totalPages} &bull; {expenses.length} total</span>
          <div className={style.paginationBtns}>
            <button className="btn btn--secondary btn--sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="btn btn--secondary btn--sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
