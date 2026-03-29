"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/lib/schemas";
import type { AppUser } from "@/app/page";
import { cn } from "@/lib/utils";
import { fieldInput, surfaceCard, surfaceInset } from "@/lib/ui";
import {
  ArrowRight, Plus, Trash2, Shield, Building2, Users, CheckCircle,
  AlertCircle, Loader2, GripVertical,
} from "lucide-react";

interface Props {
  currentUser: AppUser;
  users: AppUser[];
  onRefresh: () => void;
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

export function AdminSettings({ users, onRefresh }: Props) {
  const [rules, setRules] = useState<ApprovalRuleRow[]>([]);
  const [companyName, setCompanyName] = useState("—");
  const [baseCurrency, setBaseCurrency] = useState("—");
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New rule form state
  const [newRule, setNewRule] = useState({ ruleName: "", ruleType: "PERCENTAGE", approverRole: "MANAGER", specificRoleName: "", percentageRequired: "0.60" });

  // New user form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "EMPLOYEE" },
  });

  useEffect(() => {
    async function fetchRules() {
      try {
        const [rulesRes, companyRes] = await Promise.all([
          fetch("/api/approval-rules"),
          fetch("/api/company"),
        ]);

        const rulesData = await rulesRes.json();
        const companyData = await companyRes.json();

        if (rulesData.rules) setRules(rulesData.rules);
        if (companyData?.company?.name) setCompanyName(companyData.company.name);
        if (companyData?.company?.baseCurrency) setBaseCurrency(companyData.company.baseCurrency);
      } catch { /* silently fail */ }
    }
    fetchRules();
  }, [message]);

  const handleAddRule = async () => {
    setRuleLoading(true);
    try {
      const nextStep = rules.length > 0 ? Math.max(...rules.map((r) => r.stepOrder)) + 1 : 1;
      const res = await fetch("/api/approval-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOrder: nextStep,
          ruleName: newRule.ruleName,
          ruleType: newRule.ruleType,
          approverRole: newRule.approverRole,
          specificRoleName: newRule.specificRoleName || undefined,
          percentageRequired: newRule.percentageRequired ? parseFloat(newRule.percentageRequired) : undefined,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Approval step added!" });
        setNewRule({ ruleName: "", ruleType: "PERCENTAGE", approverRole: "MANAGER", specificRoleName: "", percentageRequired: "0.60" });
        setShowAddRule(false);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to add rule" });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setRuleLoading(false); setTimeout(() => setMessage(null), 4000); }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/approval-rules?id=${id}`, { method: "DELETE" });
      if (res.ok) setMessage({ type: "success", text: "Step removed" });
    } catch { setMessage({ type: "error", text: "Failed to delete" }); }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddUser = async (data: CreateUserInput) => {
    setUserLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `User ${data.name} created!` });
        reset();
        setShowAddUser(false);
        onRefresh();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to create user" });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    finally { setUserLoading(false); setTimeout(() => setMessage(null), 4000); }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 animate-fade-in">
      {message && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium animate-fade-in",
          message.type === "success"
            ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-800"
            : "border-error/20 bg-error-container text-error"
        )}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Company Settings */}
      <div className={`${surfaceCard} p-6 sm:p-7`}>
        <div className="mb-2 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed ring-1 ring-primary/10">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">Company</h3>
            <p className="text-sm text-on-surface-variant">{companyName} · Base currency {baseCurrency}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className={`${surfaceCard} p-6 sm:p-7`}>
        <div className="mb-6 flex flex-col gap-4 border-b border-surface-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed ring-1 ring-primary/10">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">Users</h3>
              <p className="text-sm text-on-surface-variant">
                {users.length} team member{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddUser(!showAddUser)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              showAddUser
                ? "bg-surface-container text-on-surface-variant ring-1 ring-surface-border/80"
                : "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md shadow-primary/20 hover:shadow-lg"
            )}
          >
            <Plus size={16} /> {showAddUser ? "Cancel" : "Add user"}
          </button>
        </div>

        {/* User list */}
        <div className="mb-4 space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-xl border border-surface-border/60 bg-surface-low/50 px-4 py-3 transition-colors hover:bg-surface-low"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary-container/70 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{user.name}</p>
                <p className="text-[11px] text-on-surface-variant">{user.email} • {user.department}</p>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                user.role === "MANAGER" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              )}>{user.role}</span>
            </div>
          ))}
        </div>

        {/* Add user form */}
        {showAddUser && (
          <form
            onSubmit={handleSubmit(handleAddUser)}
            className={`${surfaceInset} animate-scale-in space-y-4 p-5`}
          >
            <h4 className="text-sm font-semibold text-on-surface">Add new user</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">Name *</label>
                <input {...register("name")} placeholder="Full name" className={fieldInput} />
                {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Email *</label>
                <input {...register("email")} type="email" placeholder="email@company.com" className={fieldInput} />
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Role *</label>
                <select {...register("role")} className={cn(fieldInput, "cursor-pointer appearance-none pr-10")}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Department</label>
                <input {...register("department")} placeholder="Engineering, Finance..." className={fieldInput} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setShowAddUser(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface ring-1 ring-surface-border/90 transition-colors hover:bg-surface-container">Cancel</button>
              <button type="submit" disabled={userLoading} className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-on-primary shadow-md shadow-primary/15 transition-all hover:shadow-lg disabled:opacity-50">
                {userLoading ? <><Loader2 size={14} className="animate-spin inline mr-1" /> Creating...</> : "Create User"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Approval Workflow */}
      <div className={`${surfaceCard} p-6 sm:p-7`}>
        <div className="mb-6 flex flex-col gap-4 border-b border-surface-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed ring-1 ring-primary/10">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">Approval workflow</h3>
              <p className="text-sm text-on-surface-variant">Sequential steps and conditional rules</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddRule(!showAddRule)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              showAddRule
                ? "bg-surface-container text-on-surface-variant ring-1 ring-surface-border/80"
                : "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md shadow-primary/20 hover:shadow-lg"
            )}
          >
            <Plus size={16} /> {showAddRule ? "Cancel" : "Add step"}
          </button>
        </div>

        {/* Visual flow */}
        <div className={`${surfaceInset} mb-6 flex flex-wrap items-center gap-3 p-4`}>
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg">
            <span className="text-sm">📝</span>
            <span className="text-xs font-medium text-on-surface-variant">Employee Submits</span>
          </div>
          <ArrowRight size={14} className="text-on-surface-variant/40" />
          {rules.sort((a, b) => a.stepOrder - b.stepOrder).map((rule, i) => (
            <div key={rule.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary-fixed/40 rounded-xl border border-primary/10 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold flex items-center justify-center">{rule.stepOrder}</div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{rule.ruleName}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">
                    {rule.ruleType === "PERCENTAGE" ? `${(rule.percentageRequired || 0) * 100}% of ${rule.approverRole}s` :
                     rule.ruleType === "SPECIFIC_ROLE" ? `${rule.specificRoleName} approves` :
                     `${(rule.percentageRequired || 0) * 100}% OR ${rule.specificRoleName}`}
                  </p>
                </div>
                <button type="button" onClick={() => handleDeleteRule(rule.id)} className="ml-2 rounded-md p-1 text-on-surface-variant/40 transition-colors hover:bg-error-container/50 hover:text-error"><Trash2 size={12} /></button>
              </div>
              {i < rules.length - 1 && <ArrowRight size={14} className="text-on-surface-variant/40" />}
            </div>
          ))}
          <ArrowRight size={14} className="text-on-surface-variant/40" />
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
            <span className="text-sm">✅</span>
            <span className="text-xs font-medium text-emerald-700">Approved</span>
          </div>
        </div>

        {/* Step list */}
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="group flex items-center gap-4 rounded-xl border border-surface-border/50 bg-surface-low/50 px-4 py-3 transition-colors hover:bg-surface-container/60">
              <GripVertical size={16} className="text-on-surface-variant/30" />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary-container/80 text-on-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{rule.stepOrder}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{rule.ruleName}</p>
                <p className="text-[11px] text-on-surface-variant">
                  Type: {rule.ruleType} • Role: {rule.approverRole}
                  {rule.percentageRequired ? ` • Threshold: ${rule.percentageRequired * 100}%` : ""}
                  {rule.specificRoleName ? ` • Specific: ${rule.specificRoleName}` : ""}
                </p>
              </div>
              <button type="button" onClick={() => handleDeleteRule(rule.id)} className="rounded-lg p-2 text-on-surface-variant opacity-0 transition-all hover:bg-error-container/30 hover:text-error group-hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Add rule form */}
        {showAddRule && (
          <div className={`${surfaceInset} mt-4 animate-scale-in space-y-4 p-5`}>
            <h4 className="text-sm font-semibold text-on-surface">Add approval step</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">Step name *</label>
                <input value={newRule.ruleName} onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })} placeholder="e.g., Director review" className={fieldInput} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-on-surface-variant">Rule type *</label>
                <select value={newRule.ruleType} onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value })} className={cn(fieldInput, "cursor-pointer appearance-none pr-10")}>
                  <option value="PERCENTAGE">Percentage (e.g. 60% must approve)</option>
                  <option value="SPECIFIC_ROLE">Specific Role (e.g. CFO)</option>
                  <option value="HYBRID">Hybrid (OR logic)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Approver Role *</label>
                <select value={newRule.approverRole} onChange={(e) => setNewRule({ ...newRule, approverRole: e.target.value })} className={cn(fieldInput, "cursor-pointer appearance-none pr-10")}>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin / Finance</option>
                </select>
              </div>
              {(newRule.ruleType === "PERCENTAGE" || newRule.ruleType === "HYBRID") && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Percentage (0-1) *</label>
                  <input type="number" step="0.01" min="0" max="1" value={newRule.percentageRequired} onChange={(e) => setNewRule({ ...newRule, percentageRequired: e.target.value })} className={cn(fieldInput, "tabular-nums")} />
                </div>
              )}
              {(newRule.ruleType === "SPECIFIC_ROLE" || newRule.ruleType === "HYBRID") && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant mb-1.5">Specific Role / Name *</label>
                  <input value={newRule.specificRoleName} onChange={(e) => setNewRule({ ...newRule, specificRoleName: e.target.value })} placeholder="e.g., CFO, Finance" className={fieldInput} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setShowAddRule(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface ring-1 ring-surface-border/90 transition-colors hover:bg-surface-container">Cancel</button>
              <button type="button" onClick={handleAddRule} disabled={ruleLoading || !newRule.ruleName.trim()} className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-on-primary shadow-md shadow-primary/15 transition-all hover:shadow-lg disabled:opacity-50">
                {ruleLoading ? <><Loader2 size={14} className="animate-spin inline mr-1" /> Adding...</> : "Add Step"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
