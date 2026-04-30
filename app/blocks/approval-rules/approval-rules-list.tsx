import { Pencil, Trash2, Shield, DollarSign, Layers } from 'lucide-react';
import classnames from 'classnames';
import style from './approval-rules-list.module.css';
import type { ApprovalRule } from '~/data/types';

export interface ApprovalRulesListProps {
  className?: string;
  rules: ApprovalRule[];
  onEdit: (rule: ApprovalRule) => void;
  onDelete: (rule: ApprovalRule) => void;
}

const CONDITION_ICONS = {
  ROLE: Shield,
  PERCENTAGE: DollarSign,
  HYBRID: Layers,
};

const CONDITION_LABELS = {
  ROLE: 'Role-Based',
  PERCENTAGE: 'Percentage-Based',
  HYBRID: 'Hybrid',
};

export function ApprovalRulesList({ className, rules, onEdit, onDelete }: ApprovalRulesListProps) {
  if (rules.length === 0) {
    return <p className={style.empty}>No approval rules configured. Create your first rule to set up the approval workflow.</p>;
  }

  return (
    <div className={classnames(style.list, className)}>
      {rules.map((rule, index) => {
        const CondIcon = CONDITION_ICONS[rule.conditionType];
        return (
          <>
            <div key={rule.id} className={style.card}>
              <div className={style.stepBadge}>{rule.step}</div>
              <div className={style.content}>
                <p className={style.ruleName}>{rule.name}</p>
                <p className={style.ruleDesc}>{rule.description}</p>
                <div className={style.tags}>
                  <span className={classnames(style.tag, style.tagRole)}>
                    Approver: {rule.approverRole}
                  </span>
                  <span className={classnames(style.tag, style.tagCondition)}>
                    <CondIcon size={10} />
                    {CONDITION_LABELS[rule.conditionType]}
                  </span>
                  {rule.percentageThreshold !== undefined && (
                    <span className={classnames(style.tag, style.tagThreshold)}>
                      Threshold: ${rule.percentageThreshold}
                    </span>
                  )}
                  {rule.requiredRole && (
                    <span className={classnames(style.tag, style.tagRole)}>
                      Required Role: {rule.requiredRole}
                    </span>
                  )}
                </div>
              </div>
              <div className={style.actions}>
                <button className="btn btn--secondary btn--sm" onClick={() => onEdit(rule)} title="Edit">
                  <Pencil size={13} />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => onDelete(rule)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {index < rules.length - 1 && (
              <div key={`conn-${rule.id}`} className={style.connector}>
                <div className={style.connectorLine} />
              </div>
            )}
          </>
        );
      })}
    </div>
  );
}
