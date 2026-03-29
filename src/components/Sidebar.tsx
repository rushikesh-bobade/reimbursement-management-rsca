"use client";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/store";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  ClipboardCheck,
  Users,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";

type NavPage = "dashboard" | "submit" | "expenses" | "approvals" | "team" | "settings" | "profile";

interface SidebarProps {
  currentRole: Role;
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
  { id: "submit", label: "Submit Expense", icon: <PlusCircle size={20} />, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
  { id: "expenses", label: "My Expenses", icon: <Receipt size={20} />, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
  { id: "approvals", label: "Approval Queue", icon: <ClipboardCheck size={20} />, roles: ["MANAGER", "ADMIN"] },
  { id: "team", label: "Team Expenses", icon: <Users size={20} />, roles: ["MANAGER", "ADMIN"] },
  { id: "settings", label: "Workflow Settings", icon: <Settings size={20} />, roles: ["ADMIN"] },
  { id: "profile", label: "Profile", icon: <UserCircle size={20} />, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
];

export function Sidebar({ currentRole, currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-white/[0.06] bg-sidebar text-white transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[264px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex min-h-[5.25rem] shrink-0 items-center gap-3 border-b border-white/10 py-5",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/25 ring-1 ring-white/10">
          <Wallet size={20} className="text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <h1 className="font-display truncate text-base font-semibold tracking-tight">ReimburseFlow</h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
              Expense management
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 pb-4 pt-2">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Workspace
          </p>
        )}
        {visibleItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-active text-white shadow-md shadow-black/20 ring-1 ring-white/10"
                  : "text-white/55 hover:bg-sidebar-hover hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
              )}
              <span
                className={cn(
                  "shrink-0",
                  isActive ? "text-white" : "text-white/50 group-hover:text-white"
                )}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1 animate-fade-in truncate text-left">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.08] px-3 py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/45 transition-colors hover:bg-sidebar-hover hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
