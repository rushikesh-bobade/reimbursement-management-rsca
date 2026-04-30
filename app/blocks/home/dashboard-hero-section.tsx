import classnames from 'classnames';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import style from './dashboard-hero-section.module.css';
import { useStore } from '~/hooks/use-store';

export interface DashboardHeroSectionProps {
  className?: string;
}

export function DashboardHeroSection({ className }: DashboardHeroSectionProps) {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const expenses = store.getExpenses();

  const userExpenses = currentUser.role === 'EMPLOYEE'
    ? expenses.filter((e) => e.employeeId === currentUser.id)
    : expenses;

  const metrics = [
    {
      label: 'Total Submitted',
      value: userExpenses.length,
      icon: FileText,
      bg: 'rgba(99,102,241,0.4)',
      color: '#a5b4fc',
    },
    {
      label: 'Pending',
      value: userExpenses.filter((e) => e.status === 'PENDING' || e.status === 'IN_REVIEW').length,
      icon: Clock,
      bg: 'rgba(245,158,11,0.3)',
      color: '#fcd34d',
    },
    {
      label: 'Approved',
      value: userExpenses.filter((e) => e.status === 'APPROVED').length,
      icon: CheckCircle,
      bg: 'rgba(22,163,74,0.3)',
      color: '#86efac',
    },
    {
      label: 'Rejected',
      value: userExpenses.filter((e) => e.status === 'REJECTED').length,
      icon: XCircle,
      bg: 'rgba(220,38,38,0.3)',
      color: '#fca5a5',
    },
  ];

  return (
    <section className={classnames(style.hero, className)}>
      <div className={style.inner}>
        <p className={style.greeting}>Welcome back,</p>
        <h1 className={style.title}>{currentUser.name}</h1>
        <p className={style.subtitle}>
          {currentUser.role.charAt(0) + currentUser.role.slice(1).toLowerCase()} &bull; {currentUser.email}
        </p>
        <div className={style.metrics}>
          {metrics.map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className={style.metricCard}>
              <div className={style.metricIcon} style={{ backgroundColor: bg }}>
                <Icon size={16} color={color} />
              </div>
              <span className={style.metricLabel}>{label}</span>
              <span className={style.metricValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
