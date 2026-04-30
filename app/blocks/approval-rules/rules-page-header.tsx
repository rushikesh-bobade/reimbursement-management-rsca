import { Plus } from 'lucide-react';
import classnames from 'classnames';
import style from './rules-page-header.module.css';

export interface RulesPageHeaderProps {
  className?: string;
  onCreateRule: () => void;
}

export function RulesPageHeader({ className, onCreateRule }: RulesPageHeaderProps) {
  return (
    <div className={classnames(style.header, className)}>
      <div className={style.left}>
        <h1 className={style.title}>Approval Rules</h1>
        <p className={style.subtitle}>Configure multi-level sequential approval workflows with conditional logic.</p>
      </div>
      <button className="btn btn--primary" onClick={onCreateRule}>
        <Plus size={16} />
        Create New Rule
      </button>
    </div>
  );
}
