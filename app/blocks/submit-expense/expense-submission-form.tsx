import { useFormContext } from 'react-hook-form';
import classnames from 'classnames';
import { ArrowRight } from 'lucide-react';
import style from './expense-submission-form.module.css';
import { CURRENCIES, EXPENSE_CATEGORIES } from '~/data/mock-data';
import { useCurrencyConversion, formatCurrency } from '~/hooks/use-currency';
import type { ExpenseFormData } from '~/routes/submit-expense';

export interface ExpenseSubmissionFormProps {
  className?: string;
}

export function ExpenseSubmissionForm({ className }: ExpenseSubmissionFormProps) {
  const { register, watch, formState: { errors } } = useFormContext<ExpenseFormData>();

  const amount = parseFloat(watch('amount') ?? '0');
  const currency = watch('currency') ?? 'USD';
  const { converted, baseCurrency } = useCurrencyConversion(amount, currency);

  return (
    <div className={classnames(style.form, className)}>
      <div className={style.row}>
        <div className="form-group">
          <label className="form-label">Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            placeholder="0.00"
            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
          />
          {errors.amount && <p className="form-error">{errors.amount.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Currency *</label>
          <select className="form-input" {...register('currency', { required: 'Currency is required' })}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </select>
          {errors.currency && <p className="form-error">{errors.currency.message}</p>}
        </div>
      </div>

      {amount > 0 && currency !== baseCurrency && (
        <div className={style.conversionBox}>
          <ArrowRight size={14} />
          <span>Converted amount:</span>
          <span className={style.conversionValue}>{formatCurrency(converted, baseCurrency)}</span>
        </div>
      )}

      <div className={style.row}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-input" {...register('category', { required: 'Category is required' })}>
            <option value="">Select category...</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Expense Date *</label>
          <input
            type="date"
            className="form-input"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className={classnames('form-input', style.textarea)}
          placeholder="Describe the purpose of this expense..."
          {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Receipt Upload (optional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="form-input"
          {...register('receipt')}
        />
      </div>
    </div>
  );
}
