"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { EmployeeDashboard } from "@/components/employee/EmployeeDashboard";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";
import { AdminSettings } from "@/components/admin/AdminSettings";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type NavPage = "dashboard" | "submit" | "expenses" | "approvals" | "team" | "settings" | "profile";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<NavPage>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current authenticated user
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchMe();
  }, [refreshKey]);

  // Fetch all users list after auth
  useEffect(() => {
    if (!currentUser) return;
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users) {
          setUsers(data.users.map((u: AppUser) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department || "",
          })));
        }
      } catch (e) {
        console.error("Failed to fetch users:", e);
      }
    }
    fetchUsers();
  }, [currentUser, refreshKey]);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const getPageTitle = () => {
    const titles: Record<NavPage, string> = {
      dashboard: "Dashboard",
      submit: "Submit Expense",
      expenses: "My Expenses",
      approvals: "Approval Queue",
      team: "Team Expenses",
      settings: "Admin Settings",
      profile: "Profile",
    };
    return titles[currentPage] || "Dashboard";
  };

  const getPageSubtitle = () => {
    const copy: Record<NavPage, string> = {
      dashboard: "Track spending, approvals, and reimbursements in one place.",
      submit: "Add a line item with amount, category, and optional receipt.",
      expenses: "Review everything you’ve submitted with status at a glance.",
      approvals: "Triage pending items and keep the workflow moving.",
      team: "Company-wide expense history with filters by status.",
      settings: "Users, company defaults, and approval workflow steps.",
      profile: "Your identity and org details as stored in ReimburseFlow.",
    };
    return copy[currentPage] || copy.dashboard;
  };

  const renderContent = () => {
    if (loadingUser || !currentUser) {
      return (
        <div className="flex min-h-[48vh] w-full flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="h-11 w-11 animate-spin rounded-full border-2 border-surface-container border-t-primary" />
            <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/5" />
          </div>
          <div className="text-center">
            <p className="font-medium text-on-surface">Signing you in</p>
            <p className="mt-1 text-sm text-on-surface-variant">Verifying your session…</p>
          </div>
        </div>
      );
    }

    if (currentUser.role === "ADMIN" && currentPage === "settings") {
      return <AdminSettings currentUser={currentUser} users={users} onRefresh={triggerRefresh} />;
    }
    if ((currentUser.role === "MANAGER" || currentUser.role === "ADMIN") && (currentPage === "approvals" || currentPage === "team")) {
      return <ManagerDashboard page={currentPage} currentUser={currentUser} onRefresh={triggerRefresh} />;
    }
    return <EmployeeDashboard page={currentPage} currentUser={currentUser} onRefresh={triggerRefresh} />;
  };

  return (
    <div className="flex h-screen min-h-0 overflow-hidden">
      <Sidebar
        currentRole={currentUser?.role || "EMPLOYEE"}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          currentUser={currentUser || undefined}
        />
        <main className="ui-page-canvas min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
