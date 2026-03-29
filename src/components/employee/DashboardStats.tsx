"use client";

import { useEffect, useState } from "react";
import type { AppUser } from "@/app/page";
import { surfaceCard } from "@/lib/ui";
import { TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  currentUser: AppUser;
  refreshKey: number;
}

export function DashboardStats({ currentUser, refreshKey }: Props) {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/expenses?submitterId=${currentUser.id}`);
        const data = await res.json();
        if (data.expenses) {
          const expenses = data.expenses;
          setStats({
            total: expenses.length,
            pending: expenses.filter((e: { status: string }) => e.status === "PENDING" || e.status === "IN_REVIEW").length,
            approved: expenses.filter((e: { status: string }) => e.status === "APPROVED").length,
            rejected: expenses.filter((e: { status: string }) => e.status === "REJECTED").length,
          });
        }
      } catch {
        // silently fail
      }
    }
    if (currentUser?.id) fetchStats();
  }, [currentUser?.id, refreshKey]);

  const cards = [
    { label: "Total Submitted", value: stats.total, icon: <TrendingUp size={20} />, iconBg: "bg-primary-fixed", iconColor: "text-primary" },
    { label: "Pending Review", value: stats.pending, icon: <Clock size={20} />, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { label: "Approved", value: stats.approved, icon: <CheckCircle2 size={20} />, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { label: "Rejected", value: stats.rejected, icon: <XCircle size={20} />, iconBg: "bg-red-100", iconColor: "text-red-600" },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {cards.map((stat, i) => (
        <div
          key={stat.label}
          className={`animate-fade-in stagger-${i + 1} ${surfaceCard} group p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(19,27,46,0.08)]`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                {stat.label}
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-on-surface">
                {stat.value}
              </p>
            </div>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-on-surface/[0.04] ${stat.iconBg} ${stat.iconColor}`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
