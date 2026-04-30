import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import classnames from 'classnames';
import style from './approval-detail-modal.module.css';
import type { Expense } from '~/data/types';
import { formatCurrency } from '~/hooks/use-currency';
import { BASE_CURRENCY } from '~/data/mock-data';

export interface ApprovalDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
  onApprove: (expenseId: string, comment: string) => void;
  onReject: (expenseId: string, comment: string) => void;
}

const ACTION_COLOR: Record<string, string> = {
  APPROVED: '#16a34a',
  REJECTED: '#dc2626',
  PENDING: '#f59e0b',
};

export function ApprovalDetailModal({ expense, onClose, onApprove, onReject }: ApprovalDetailModalProps) {
  const [comment, setComment] = useState('');

  if (!expense) return null;

  const canAct = expense.status === 'PENDING' || expense.status === 'IN_REVIEW';

  const handleApprove = () => {
    onApprove(expense.id, comment);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    onReject(expense.id, comment);
    setComment('');
    onClose();
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h2 className={style.title}>Expense Details</h2>
          <button className={classnames('btn', style.closeBtn)} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={style.body}>
          {/* Expense Info */}
          <div className={style.section}>
            <p className={style.sectionTitle}>Expense Information</p>
            <div className={style.grid}>
              <div className={style.field}>
                <span className={style.fieldLabel}>Employee</span>
                <span className={style.fieldValue}>{expense.employeeName}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Category</span>
                <span className={style.fieldValue}>{expense.category}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Amount (Original)</span>
                <span className={style.fieldValue}>{formatCurrency(expense.amount, expense.currency)}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Amount ({BASE_CURRENCY})</span>
                <span className={style.fieldValue}>{formatCurrency(expense.amountInBaseCurrency)}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Date</span>
                <span className={style.fieldValue}>{new Date(expense.date).toLocaleDateString()}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Submitted</span>
                <span className={style.fieldValue}>{new Date(expense.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Status</span>
                <span className={style.fieldValue}>{expense.status.replace('_', ' ')}</span>
              </div>
              <div className={style.field}>
                <span className={style.fieldLabel}>Current Step</span>
                <span className={style.fieldValue}>Step {expense.currentStep}</span>
              </div>
            </div>
            <div className={style.field}>
              <span className={style.fieldLabel}>Description</span>
              <span className={style.fieldValue}>{expense.description}</span>
            </div>
          </div>

          {/* Approval History */}
          <div className={style.section}>
            <p className={style.sectionTitle}>Approval History</p>
            {expense.approvalHistory.map((h) => (
              <div key={h.id} className={style.historyItem}>
                <div
                  className={style.historyDot}
                  style={{ backgroundColor: ACTION_COLOR[h.action] ?? '#94a3b8' }}
                />
                <div className={style.historyContent}>
                  <span className={style.historyMeta}>
                    <strong>Step {h.step}</strong> &mdash; {h.approverName} &mdash; {h.action} &mdash; {new Date(h.timestamp).toLocaleString()}
                  </span>
                  {h.comment && <p className={style.historyComment}>&ldquo;{h.comment}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          {canAct && (
            <div className={style.section}>
              <p className={style.sectionTitle}>Your Decision</p>
              <div className="form-group">
                <label className="form-label">Comment (optional)</label>
                <textarea
                  className={classnames('form-input', style.textarea)}
                  placeholder="Add a comment for your decision..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className={style.footer}>
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
          {canAct && (
            <>
              <button className="btn btn--danger" onClick={handleReject}>
                <XCircle size={15} /> Reject
              </button>
              <button className="btn btn--success" onClick={handleApprove}>
                <CheckCircle size={15} /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
