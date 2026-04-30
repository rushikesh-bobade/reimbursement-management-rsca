import { Link } from 'react-router';
import classnames from 'classnames';
import style from './recent-expenses-summary.module.css';
import { useStore } from '~/hooks/use-store';
import { formatCurrency } from '~/hooks/use-currency';
import { BASE_CURRENCY } from '~/data/mock-data';

export interface RecentExpensesSummaryProps {
  className?: string;
}

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

export function RecentExpensesSummary({ className }: RecentExpensesSummaryProps) {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const allExpenses = store.getExpenses();

  const expenses = currentUser.role === 'EMPLOYEE'
    ? allExpenses.filter((e) => e.employeeId === currentUser.id)
    : allExpenses;

  const recent = expenses
    .slice()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8);

  return (
    <section className={classnames(style.section, className)}>
      <div className={style.inner}>
        <div className={style.header}>
          <h2 className={style.title}>Recent Expenses</h2>
          <Link to="/approvals" className={style.viewAll}>View all &rarr;</Link>
        </div>
        <div className={style.tableWrapper}>
          {recent.length === 0 ? (
            <p className={style.empty}>No expenses found. Submit your first expense to get started.</p>
          ) : (
            <table className={style.table}>
              <thead>
                <tr>
                  {currentUser.role !== 'EMPLOYEE' && <th>Employee</th>}
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount ({BASE_CURRENCY})</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Step</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((expense) => (
                  <tr key={expense.id}>
                    {currentUser.role !== 'EMPLOYEE' && <td>{expense.employeeName}</td>}
                    <td>
                      <span className={style.desc} title={expense.description}>{expense.description}</span>
                    </td>
                    <td>{expense.category}</td>
                    <td>
                      <span className={style.amount}>{formatCurrency(expense.amountInBaseCurrency)}</span>
                    </td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td><StatusBadge status={expense.status} /></td>
                    <td><span className={style.step}>Step {expense.currentStep}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
