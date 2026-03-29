"use client";

import { useEffect, useState } from "react";
import type { AppUser } from "@/app/page";
import { cn } from "@/lib/utils";
import { surfaceCard } from "@/lib/ui";
import { Eye, MoreHorizontal, Receipt } from "lucide-react";

interface Props {
  currentUser: AppUser;
  showAll?: boolean;
  refreshKey?: number;
}

type FilterStatus = "ALL" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";

interface ExpenseRow {
  id: string;
  amount: number;
  originalCurrency: string;
  convertedAmount?: number;
  baseCurrency?: string;
  category: string;
  description: string;
  date: string;
  status: string;
  currentStepOrder: number;
  submitter?: { name: string; department: string };
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPROVED": return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "REJECTED": return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
    case "IN_REVIEW": return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
    default: return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  }
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = { TRAVEL: "✈️", MEALS: "🍽️", OFFICE_SUPPLIES: "📎", EQUIPMENT: "💻", SOFTWARE: "📦", COMMUNICATION: "📱", OTHER: "📋" };
  return icons[cat] || "📋";
}

export function ExpenseTable({ currentUser, showAll = false, refreshKey = 0 }: Props) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      try {
        const params = showAll ? "" : `submitterId=${currentUser.id}`;
        const res = await fetch(`/api/expenses?${params}`);
        const data = await res.json();
        if (data.expenses) setExpenses(data.expenses);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    if (currentUser?.id) fetchExpenses();
  }, [currentUser?.id, showAll, refreshKey]);

  const filteredExpenses = filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter);
  const displayExpenses = showAll ? filteredExpenses : filteredExpenses.slice(0, 5);

  const filters: { value: FilterStatus; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className={`${surfaceCard} w-full overflow-hidden`}>
      <div className="flex flex-col gap-3 border-b border-surface-border/70 px-6 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">
            {showAll ? "All expenses" : "Recent expenses"}
          </h3>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            {displayExpenses.length} expense{displayExpenses.length !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>

      {showAll && (
        <div className="flex flex-wrap gap-1.5 border-b border-surface-border/50 bg-surface-low/50 px-6 py-3">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                filter === f.value
                  ? "bg-primary text-on-primary shadow-sm shadow-primary/15"
                  : "bg-surface-lowest text-on-surface-variant ring-1 ring-surface-border/80 hover:bg-surface-container"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="app-table w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-surface-border/70 bg-surface-container/40">
              <th className="whitespace-nowrap px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
              <th className="whitespace-nowrap px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Category</th>
              <th className="whitespace-nowrap px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Amount</th>
              <th className="whitespace-nowrap px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="w-[88px] whitespace-nowrap px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center align-middle">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-surface-container border-t-primary" />
                  <p className="mt-3 text-sm text-on-surface-variant">Loading expenses…</p>
                </td>
              </tr>
            ) : displayExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center align-middle">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-primary/70">
                    <Receipt className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 font-medium text-on-surface">No expenses yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-on-surface-variant">
                    Submit your first expense from the sidebar to see it listed here.
                  </p>
                </td>
              </tr>
            ) : (
              displayExpenses.map((expense) => {
                const statusStyle = getStatusColor(expense.status);
                return (
                  <tr
                    key={expense.id}
                    className="group border-b border-surface-border/40 transition-colors last:border-0 hover:bg-primary/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-on-surface">{formatDate(expense.date)}</td>
                    <td className="max-w-[min(280px,40vw)] px-6 py-3.5">
                      <p className="truncate text-sm font-medium text-on-surface">{expense.description}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-highest px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                        <span className="shrink-0">{getCategoryIcon(expense.category)}</span>
                        <span className="truncate">{expense.category.replace(/_/g, " ")}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right tabular-nums">
                      <span className="text-sm font-semibold text-on-surface">{formatCurrency(expense.amount, expense.originalCurrency)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={cn("inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyle.bg, statusStyle.text)}>
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusStyle.dot)} />
                        {expense.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button type="button" className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"><Eye size={14} /></button>
                        <button type="button" className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
