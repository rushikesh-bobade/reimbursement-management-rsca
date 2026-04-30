import { UserPlus } from 'lucide-react';
import classnames from 'classnames';
import style from './users-page-header.module.css';

export interface UsersPageHeaderProps {
  className?: string;
  onCreateUser: () => void;
}

export function UsersPageHeader({ className, onCreateUser }: UsersPageHeaderProps) {
  return (
    <div className={classnames(style.header, className)}>
      <div className={style.left}>
        <h1 className={style.title}>User Management</h1>
        <p className={style.subtitle}>Manage employees, managers and admin accounts.</p>
      </div>
      <button className="btn btn--primary" onClick={onCreateUser}>
        <UserPlus size={16} />
        Create New User
      </button>
    </div>
  );
}
