import { DashboardHeroSection } from '../blocks/home/dashboard-hero-section';
import { QuickActions } from '../blocks/home/quick-actions';
import { RecentExpensesSummary } from '../blocks/home/recent-expenses-summary';
import { ProtectedRoute } from '~/components/protected-route/protected-route';
import styles from './home.module.css';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className={styles.root}>
        <DashboardHeroSection className={styles.dashboardHeroSection} />
        <QuickActions className={styles.quickActions} />
        <RecentExpensesSummary className={styles.recentExpensesSummary} />
      </div>
    </ProtectedRoute>
  );
}
