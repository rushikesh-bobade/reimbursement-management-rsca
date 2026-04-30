import { NavLink, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Users,
  Settings,
  DollarSign,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Separator from '@radix-ui/react-separator';
import classnames from 'classnames';
import { useState } from 'react';
import style from './navigation-bar.module.css';
import { useAuthContext } from '~/contexts/auth-context';
import { COMPANY_NAME } from '~/data/mock-data';

export interface NavigationBarProps {
  className?: string;
}

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { to: '/submit-expense', label: 'Submit Expense', icon: Receipt, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { to: '/approvals', label: 'Pending Approvals', icon: Clock, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
  { to: '/admin/rules', label: 'Approval Rules', icon: Settings, roles: ['ADMIN'] },
] as const;

const ROLE_COLORS: Record<string, string> = {
  ADMIN: style.roleAdmin,
  MANAGER: style.roleManager,
  EMPLOYEE: style.roleEmployee,
};

export function NavigationBar({ className }: NavigationBarProps) {
  const { currentUser, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(currentUser.role as never));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <nav className={classnames(style.nav, className)}>
        {/* Brand */}
        <NavLink to="/" className={style.brand}>
          <div className={style.brandIconWrap}>
            <DollarSign size={18} />
          </div>
          <span className={style.brandName}>{COMPANY_NAME}</span>
        </NavLink>

        {/* Desktop links */}
        <div className={style.links}>
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => classnames(style.link, { [style.active]: isActive })}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop right section */}
        <div className={style.right}>
          <Separator.Root orientation="vertical" className={style.separator} />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className={style.userTrigger} aria-label="User menu">
                <div className={style.avatar}>{initials}</div>
                <div className={style.userText}>
                  <span className={style.userName}>{currentUser.name}</span>
                  <span className={classnames(style.userRole, ROLE_COLORS[currentUser.role])}>
                    {currentUser.role.toLowerCase()}
                  </span>
                </div>
                <ChevronDown size={14} className={style.chevron} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className={style.dropdownContent} align="end" sideOffset={8}>
                <div className={style.dropdownHeader}>
                  <div className={style.dropdownAvatar}>{initials}</div>
                  <div>
                    <p className={style.dropdownName}>{currentUser.name}</p>
                    <p className={style.dropdownEmail}>{currentUser.email}</p>
                  </div>
                </div>

                <DropdownMenu.Separator className={style.dropdownSeparator} />

                <DropdownMenu.Item className={style.dropdownItem} onSelect={() => navigate('/')}>
                  <User size={14} />
                  My Profile
                </DropdownMenu.Item>

                {currentUser.role === 'ADMIN' && (
                  <DropdownMenu.Item className={style.dropdownItem} onSelect={() => navigate('/admin/users')}>
                    <Shield size={14} />
                    Admin Panel
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Separator className={style.dropdownSeparator} />

                <DropdownMenu.Item className={classnames(style.dropdownItem, style.dropdownItemDanger)} onSelect={handleLogout}>
                  <LogOut size={14} />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Mobile hamburger */}
          <button
            className={style.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={style.mobileDrawer}>
          <div className={style.mobileUser}>
            <div className={style.mobileAvatar}>{initials}</div>
            <div>
              <p className={style.mobileUserName}>{currentUser.name}</p>
              <p className={style.mobileUserEmail}>{currentUser.email}</p>
            </div>
          </div>

          <div className={style.mobileDivider} />

          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => classnames(style.mobileLink, { [style.mobileLinkActive]: isActive })}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}

          <div className={style.mobileDivider} />

          <button className={style.mobileLogout} onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
