import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ArrowRight } from 'lucide-react';
import classnames from 'classnames';
import style from './rule-configuration-form.module.css';
import type { ApprovalRule, UserRole, ApprovalConditionType } from '~/data/types';

export interface RuleFormData {
  name: string;
  step: number;
  approverRole: UserRole;
  conditionType: ApprovalConditionType;
  percentageThreshold?: number;
  requiredRole?: UserRole;
  description: string;
}

export interface RuleConfigurationFormProps {
  isOpen: boolean;
  editingRule?: ApprovalRule | null;
  existingRules: ApprovalRule[];
  onClose: () => void;
  onSave: (data: RuleFormData) => void;
}

export function RuleConfigurationForm({ isOpen, editingRule, existingRules, onClose, onSave }: RuleConfigurationFormProps) {
  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<RuleFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      step: 1,
      approverRole: 'MANAGER',
      conditionType: 'ROLE',
      description: '',
    },
  });

  const conditionType = watch('conditionType');
  const stepVal = watch('step');
  const approverRole = watch('approverRole');

  useEffect(() => {
    if (editingRule) {
      reset({
        name: editingRule.name,
        step: editingRule.step,
        approverRole: editingRule.approverRole,
        conditionType: editingRule.conditionType,
        percentageThreshold: editingRule.percentageThreshold,
        requiredRole: editingRule.requiredRole,
        description: editingRule.description,
      });
    } else {
      const nextStep = Math.max(...existingRules.map((r) => r.step), 0) + 1;
      reset({ name: '', step: nextStep, approverRole: 'MANAGER', conditionType: 'ROLE', description: '' });
    }
  }, [editingRule, isOpen, reset, existingRules]);

  if (!isOpen) return null;

  const allSteps = [
    ...existingRules.filter((r) => r.id !== editingRule?.id).map((r) => ({ step: r.step, role: r.approverRole })),
    { step: Number(stepVal), role: approverRole },
  ].sort((a, b) => a.step - b.step);

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h2 className={style.title}>{editingRule ? 'Edit Rule' : 'Create New Rule'}</h2>
          <button className={classnames('btn', style.closeBtn)} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSave)}>
          <div className={style.body}>
            {/* Workflow Preview */}
            <div className={style.preview}>
              <p className={style.previewTitle}>Workflow Preview</p>
              <div className={style.previewFlow}>
                <div className={style.previewStep}>
                  <div className={style.previewStepCircle}>E</div>
                  <span className={style.previewStepLabel}>Employee</span>
                </div>
                {allSteps.map((s, i) => (
                  <>
                    <ArrowRight key={`arr-${i}`} size={16} className={style.previewArrow} />
                    <div key={`step-${i}`} className={style.previewStep}>
                      <div className={style.previewStepCircle}>{s.step}</div>
                      <span className={style.previewStepLabel}>{s.role.slice(0, 4)}</span>
                    </div>
                  </>
                ))}
                <ArrowRight size={16} className={style.previewArrow} />
                <div className={style.previewStep}>
                  <div className={style.previewStepCircle} style={{ background: '#dcfce7', color: '#16a34a' }}>✓</div>
                  <span className={style.previewStepLabel}>Done</span>
                </div>
              </div>
            </div>

            <div className={style.row}>
              <div className="form-group">
                <label className="form-label">Rule Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Manager Approval"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Step Order *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  {...register('step', { required: 'Step is required', min: { value: 1, message: 'Min 1' }, valueAsNumber: true })}
                />
                {errors.step && <p className="form-error">{errors.step.message}</p>}
              </div>
            </div>

            <div className={style.row}>
              <div className="form-group">
                <label className="form-label">Approver Role *</label>
                <select className="form-input" {...register('approverRole', { required: true })}>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition Type *</label>
                <select className="form-input" {...register('conditionType', { required: true })}>
                  <option value="ROLE">Role-Based</option>
                  <option value="PERCENTAGE">Percentage-Based</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            {(conditionType === 'PERCENTAGE' || conditionType === 'HYBRID') && (
              <div className="form-group">
                <label className="form-label">Amount Threshold (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="form-input"
                  placeholder="e.g. 500"
                  {...register('percentageThreshold', {
                    required: 'Threshold is required for this condition',
                    min: { value: 0, message: 'Must be 0 or more' },
                    valueAsNumber: true,
                  })}
                />
                {errors.percentageThreshold && <p className="form-error">{errors.percentageThreshold.message}</p>}
              </div>
            )}

            {conditionType === 'HYBRID' && (
              <div className="form-group">
                <label className="form-label">Required Role</label>
                <select className="form-input" {...register('requiredRole')}>
                  <option value="">None</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input"
                style={{ minHeight: 70, resize: 'vertical' }}
                placeholder="Describe when and why this rule applies..."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>
          </div>

          <div className={style.footer}>
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={!isValid}>
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
