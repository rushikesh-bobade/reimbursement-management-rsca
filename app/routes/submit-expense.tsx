import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import styles from './submit-expense.module.css';
import { ExpenseSubmissionForm } from '../blocks/submit-expense/expense-submission-form';
import { OcrReceiptScanner } from '../blocks/submit-expense/ocr-receipt-scanner';
import { FormActions } from '../blocks/submit-expense/form-actions';
import { useStore } from '~/hooks/use-store';
import { convertToBase } from '~/hooks/use-currency';
import { ProtectedRoute } from '~/components/protected-route/protected-route';

export interface ExpenseFormData {
  amount: string;
  currency: string;
  category: string;
  description: string;
  date: string;
  receipt?: FileList;
}

function SubmitExpenseContent() {
  const store = useStore();
  const navigate = useNavigate();
  const currentUser = store.getCurrentUser();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const methods = useForm<ExpenseFormData>({
    defaultValues: {
      amount: '',
      currency: 'USD',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState: { isSubmitting, isValid } } = methods;

  const onSubmit = async (data: ExpenseFormData) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const amount = parseFloat(data.amount);
      const amountInBase = convertToBase(amount, data.currency);
      store.addExpense({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        amount,
        currency: data.currency,
        amountInBaseCurrency: amountInBase,
        category: data.category as any,
        description: data.description,
        date: data.date,
      });
      setSuccessMessage('Expense submitted successfully!');
      reset();
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setErrorMessage('Failed to submit expense. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit Expense</h1>
        <p className={styles.subtitle}>Fill in the details below to submit a new reimbursement claim.</p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.card}>
            <OcrReceiptScanner />
            <ExpenseSubmissionForm />
            <FormActions
              isSubmitting={isSubmitting}
              isValid={isValid}
              successMessage={successMessage}
              errorMessage={errorMessage}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default function SubmitExpense() {
  return (
    <ProtectedRoute>
      <SubmitExpenseContent />
    </ProtectedRoute>
  );
}
