import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import classnames from 'classnames';
import style from './form-actions.module.css';

export interface FormActionsProps {
  className?: string;
  isSubmitting: boolean;
  isValid: boolean;
  successMessage?: string;
  errorMessage?: string;
  onCancel?: () => void;
}

export function FormActions({ className, isSubmitting, isValid, successMessage, errorMessage, onCancel }: FormActionsProps) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/');
  };

  return (
    <div className={classnames(style.actions, className)}>
      {successMessage && (
        <div className={style.successMsg}>
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className={style.errorMsg}>
          <XCircle size={16} />
          {errorMessage}
        </div>
      )}
      <button type="button" className="btn btn--secondary" onClick={handleCancel}>
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn--primary"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Expense'}
      </button>
    </div>
  );
}
