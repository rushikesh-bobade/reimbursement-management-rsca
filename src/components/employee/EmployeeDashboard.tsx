"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "./DashboardStats";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseTable } from "./ExpenseTable";
import type { AppUser, NavPage } from "@/app/page";
import { surfaceCard } from "@/lib/ui";
import { Sparkles } from "lucide-react";

interface Props {
  page: NavPage;
  currentUser: AppUser;
  onRefresh: () => void;
}

export function EmployeeDashboard({ page, currentUser, onRefresh }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseSubmitted = () => {
    setRefreshKey((k) => k + 1);
    onRefresh();
  };

  if (page === "submit") {
    return (
      <div className="mx-auto w-full max-w-3xl animate-fade-in">
        <ExpenseForm currentUser={currentUser} onSubmitted={handleExpenseSubmitted} />
      </div>
    );
  }

  if (page === "expenses") {
    return (
      <div className="w-full animate-fade-in">
        <ExpenseTable currentUser={currentUser} showAll refreshKey={refreshKey} />
      </div>
    );
  }

  if (page === "profile") {
    return (
      <div className="mx-auto w-full max-w-2xl animate-fade-in">
        <div className={`${surfaceCard} p-6 sm:p-8`}>
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-2xl font-bold text-on-primary shadow-lg shadow-primary/20 ring-1 ring-white/15">
              {currentUser.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-on-surface">{currentUser.name}</h3>
              <p className="mt-0.5 truncate text-sm text-on-surface-variant">{currentUser.email}</p>
              <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20">
                {currentUser.role}
              </span>
            </div>
          </div>
          <div className="divide-y divide-surface-border/80 rounded-xl border border-surface-border/60 bg-surface-low/40">
            <div className="flex items-center justify-between gap-6 px-4 py-3.5 sm:px-5">
              <span className="shrink-0 text-sm text-on-surface-variant">Department</span>
              <span className="min-w-0 text-right text-sm font-medium text-on-surface">{currentUser.department || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-6 px-4 py-3.5 sm:px-5">
              <span className="shrink-0 text-sm text-on-surface-variant">User ID</span>
              <span className="max-w-[min(100%,14rem)] truncate text-right font-mono text-xs font-medium text-on-surface">{currentUser.id}</span>
            </div>
            <div className="flex items-center justify-between gap-6 px-4 py-3.5 sm:px-5">
              <span className="shrink-0 text-sm text-on-surface-variant">Company</span>
              <span className="text-right text-sm font-medium text-on-surface">Acme Corp</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Dashboard
  const firstName = currentUser.name.split(" ")[0] ?? currentUser.name;
  return (
    <div className="flex w-full flex-col gap-8">
      <div
        className={`${surfaceCard} flex flex-col gap-4 border-primary/10 bg-gradient-to-br from-surface-lowest via-surface-lowest to-primary/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-on-surface sm:text-xl">
              Welcome back, {firstName}
            </p>
            <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Submit new expenses, watch approval status, and keep your team aligned—right from this dashboard.
            </p>
          </div>
        </div>
      </div>
      <DashboardStats currentUser={currentUser} refreshKey={refreshKey} />
      <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2 xl:items-stretch">
        <div className="min-w-0 animate-fade-in stagger-2">
          <ExpenseForm compact currentUser={currentUser} onSubmitted={handleExpenseSubmitted} />
        </div>
        <div className="min-w-0 animate-fade-in stagger-3">
          <ExpenseTable currentUser={currentUser} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
