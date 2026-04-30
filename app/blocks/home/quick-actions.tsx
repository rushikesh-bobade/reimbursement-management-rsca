import { Link } from 'react-router';
import { PlusCircle, Clock, Users, Settings } from 'lucide-react';
import classnames from 'classnames';
import style from './quick-actions.module.css';
import { useStore } from '~/hooks/use-store';

export interface QuickActionsProps {
  className?: string;
}

interface ActionConfig {
  to: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  roles: string[];
}

const ALL_ACTIONS: ActionConfig[] = [
  {
    to: '/submit-expense',
    icon: PlusCircle,
    iconBg: '#eef2ff',
    iconColor: 'var(--color-primary)',
    title: 'Submit New Expense',
    desc: 'File a new reimbursement claim',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    to: '/approvals',
    icon: Clock,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    title: 'View Pending Approvals',
    desc: 'Review expenses awaiting your decision',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    to: '/admin/users',
    icon: Users,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    title: 'Manage Users',
    desc: 'Add, edit, or remove team members',
    roles: ['ADMIN'],
  },
  {
    to: '/admin/rules',
    icon: Settings,
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    title: 'Configure Rules',
    desc: 'Set up approval workflows and conditions',
    roles: ['ADMIN'],
  },
];

export function QuickActions({ className }: QuickActionsProps) {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const actions = ALL_ACTIONS.filter((a) => a.roles.includes(currentUser.role));

  return (
    <section className={classnames(style.section, className)}>
      <div className={style.inner}>
        <h2 className={style.title}>Quick Actions</h2>
        <div className={style.actions}>
          {actions.map(({ to, icon: Icon, iconBg, iconColor, title, desc }) => (
            <Link key={to} to={to} className={style.actionCard}>
              <div className={style.actionIcon} style={{ backgroundColor: iconBg }}>
                <Icon size={20} color={iconColor} />
              </div>
              <div className={style.actionText}>
                <span className={style.actionTitle}>{title}</span>
                <span className={style.actionDesc}>{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
