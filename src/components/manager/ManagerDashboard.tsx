"use client";

import { useState, useEffect } from "react";
import type { AppUser, NavPage } from "@/app/page";
import { cn } from "@/lib/utils";
import { surfaceCard } from "@/lib/ui";
import { Check, X, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  page: NavPage;
  currentUser: AppUser;
  onRefresh: () => void;
}

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
  submitter?: { id: string; name: string; department: string; role: string };
  approvalQueue?: Array<{
    id: string;
    action: string;
    approvalRule: { stepOrder: number; ruleName: string; ruleType: string };
    approver?: { name: string };
  }>;
}

interface ApprovalRuleRow {
  id: string;
  stepOrder: number;
  ruleName: string;
  ruleType: string;
  approverRole: string;
  specificRoleName?: string;
  percentageRequired?: number;
}

type FilterStatus = "ALL" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
  } catch { return `${currency} ${amount.toFixed(2)}`; }
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

export function ManagerDashboard({ page, currentUser, onRefresh }: Props) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [rules, setRules] = useState<ApprovalRuleRow[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [expRes, ruleRes] = await Promise.all([
          fetch(page === "approvals" ? "/api/expenses?status=PENDING" : "/api/expenses"),
          fetch("/api/approval-rules"),
        ]);
        const expData = await expRes.json();
        const ruleData = await ruleRes.json();
        if (expData.expenses) {
          // For approval queue, show PENDING and IN_REVIEW
          const filtered = page === "approvals"
            ? expData.expenses.filter((e: ExpenseRow) => e.status === "PENDING" || e.status === "IN_REVIEW")
            : expData.expenses;
          setExpenses(filtered);
        }
        if (ruleData.rules) setRules(ruleData.rules);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, actionMessage]);

  const handleApproval = async (expenseId: string, action: "APPROVED" | "REJECTED", comment?: string) => {
    setActionLoading(expenseId);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUser.id },
        body: JSON.stringify({ expenseId, action, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: data.message });
        setRejectingId(null);
        setRejectComment("");
        onRefresh();
      } else {
        setActionMessage({ type: "error", text: data.error || "Action failed" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error" });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const filteredExpenses = filter === "ALL" ? expenses : expenses.filter((e) => e.status === filter);
  const maxLevel = rules.length > 0 ? Math.max(...rules.map((r) => r.stepOrder)) : 1;
  const displayBaseCurrency = expenses[0]?.baseCurrency || "USD";

  const filters: { value: FilterStatus; label: string; count: number }[] = [
    { value: "ALL", label: "All", count: expenses.length },
    { value: "PENDING", label: "Pending", count: expenses.filter((e) => e.status === "PENDING").length },
    { value: "IN_REVIEW", label: "In Review", count: expenses.filter((e) => e.status === "IN_REVIEW").length },
    { value: "APPROVED", label: "Approved", count: expenses.filter((e) => e.status === "APPROVED").length },
    { value: "REJECTED", label: "Rejected", count: expenses.filter((e) => e.status === "REJECTED").length },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Approval flow indicator */}
      <div className={`${surfaceCard} p-5 sm:p-6`}>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          Active approval workflow
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          {rules.sort((a, b) => a.stepOrder - b.stepOrder).map((rule, i) => (
            <div key={rule.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-primary-fixed/35 px-4 py-2 ring-1 ring-primary/10">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">{rule.stepOrder}</div>
                <div>
                  <span className="text-sm font-medium text-on-surface">{rule.ruleName}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase ml-1.5">
                    ({rule.ruleType === "PERCENTAGE" ? `${(rule.percentageRequired || 0) * 100}%` : rule.ruleType === "SPECIFIC_ROLE" ? rule.specificRoleName : `${(rule.percentageRequired || 0) * 100}% or ${rule.specificRoleName}`})
                  </span>
                </div>
              </div>
              {i < rules.length - 1 && <ArrowRight size={16} className="text-on-surface-variant/50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Action message */}
      {actionMessage && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium animate-fade-in",
          actionMessage.type === "success"
            ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-800"
            : "border-error/20 bg-error-container text-error"
        )}>
          {actionMessage.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {actionMessage.text}
        </div>
      )}

      {/* Main table */}
      <div className={`${surfaceCard} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-3 border-b border-surface-border/70 px-6 pt-5 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-on-surface">
              {page === "approvals" ? "Approval queue" : "All expenses"}
            </h3>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              {filteredExpenses.length} item{filteredExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
                {f.label} <span className={cn("ml-1 text-[10px]", filter === f.value ? "text-on-primary/70" : "text-on-surface-variant/50")}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="app-table w-full min-w-[1024px] text-left">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-container/40">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Employee</th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Category</th>
                <th className="whitespace-nowrap px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Original</th>
                <th className="whitespace-nowrap px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Converted ({displayBaseCurrency})</th>
                <th className="min-w-[140px] px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
                <th className="whitespace-nowrap px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Step</th>
                <th className="whitespace-nowrap px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="w-[168px] whitespace-nowrap px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center align-middle text-sm text-on-surface-variant">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-surface-container border-t-primary" />
                    <p className="mt-3">Loading…</p>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center align-middle text-sm text-on-surface-variant">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const statusStyle = getStatusColor(expense.status);
                  const isPending = expense.status === "PENDING" || expense.status === "IN_REVIEW";
                  return (
                    <tr
                      key={expense.id}
                      className="group border-b border-surface-border/40 transition-colors last:border-0 hover:bg-primary/[0.02]"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary-container/60 text-[10px] font-bold text-white">
                            {expense.submitter?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-on-surface">{expense.submitter?.name}</p>
                            <p className="truncate text-[11px] text-on-surface-variant">{expense.submitter?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm text-on-surface">{formatDate(expense.date)}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-highest px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                          <span className="shrink-0">{getCategoryIcon(expense.category)}</span>
                          <span className="truncate">{expense.category.replace(/_/g, " ")}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right text-sm font-semibold tabular-nums text-on-surface">{formatCurrency(expense.amount, expense.originalCurrency)}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right tabular-nums">
                        {expense.originalCurrency !== (expense.baseCurrency || "USD") && expense.convertedAmount ? (
                          <span className="text-sm font-medium text-primary">{formatCurrency(expense.convertedAmount, expense.baseCurrency || "USD")}</span>
                        ) : (
                          <span className="text-sm text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="max-w-[200px] px-6 py-3.5">
                        <p className="truncate text-sm text-on-surface">{expense.description}</p>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="text-xs font-bold text-primary bg-primary-fixed/30 px-2 py-1 rounded-full">
                          Step {expense.currentStepOrder}/{maxLevel}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={cn("inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyle.bg, statusStyle.text)}>
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusStyle.dot)} />
                          {expense.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {isPending ? (
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproval(expense.id, "APPROVED")}
                              disabled={actionLoading === expense.id}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {actionLoading === expense.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectingId(expense.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 ring-1 ring-red-200/80 transition-colors hover:bg-red-100"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/25 backdrop-blur-sm animate-fade-in">
          <div className={`${surfaceCard} w-full max-w-md scale-100 animate-scale-in p-6 sm:p-8`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-container text-error ring-1 ring-error/10">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-on-surface">Reject this expense?</h3>
                <p className="mt-0.5 text-sm text-on-surface-variant">Optional context helps the submitter correct the request.</p>
              </div>
            </div>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Reason for rejection..."
              className="mb-4 w-full resize-none rounded-xl border border-surface-border/90 bg-surface-low px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-error/15"
              rows={3}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setRejectingId(null); setRejectComment(""); }} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-on-surface ring-1 ring-surface-border/90 transition-colors hover:bg-surface-container">Cancel</button>
              <button
                type="button"
                onClick={() => handleApproval(rejectingId, "REJECTED", rejectComment)}
                disabled={actionLoading === rejectingId}
                className="flex-1 rounded-xl bg-error py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-error/90 disabled:opacity-50"
              >
                {actionLoading === rejectingId ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
