"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, Wallet, Check } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setError(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const sellingPoints = [
    "Multi-step approvals with clear audit trail",
    "FX-aware amounts and structured categories",
    "Role-based queues for managers and finance",
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand panel */}
      <div className="relative hidden min-h-screen w-[44%] min-w-[420px] flex-col justify-between overflow-hidden lg:flex">
        <div className="ui-auth-pattern absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0b3d82] to-[#0b1220]" />
        <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-white">ReimburseFlow</p>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/55">Expense management</p>
            </div>
          </div>

          <div className="mt-20 max-w-md">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white xl:text-[2rem]">
              Bring reimbursements under control
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              One workspace for employees, managers, and admins—with workflows that match how your company actually approves spend.
            </p>
            <ul className="mt-10 space-y-4">
              {sellingPoints.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">© {new Date().getFullYear()} ReimburseFlow</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                <Wallet className="h-5 w-5 text-on-primary" strokeWidth={2} />
              </div>
              <span className="font-display text-lg font-semibold text-on-surface">ReimburseFlow</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">Sign in</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            New to the product?{" "}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:text-primary-dark hover:underline">
              Create a company account
            </Link>
          </p>

          <div className={`mt-8 rounded-2xl border border-surface-border/90 bg-surface-lowest p-6 shadow-[0_12px_40px_rgba(19,27,46,0.07)] sm:p-8`}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-xl border border-red-200/90 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-on-surface">
                  Email
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                  <input
                    id="login-email"
                    {...form.register("email")}
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-xl border border-surface-border/90 bg-surface-low py-2.5 pl-10 pr-4 text-on-surface shadow-inner shadow-on-surface/[0.02] placeholder:text-on-surface-variant/55 focus:border-primary/45 focus:bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary/12 sm:text-sm"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-2 text-sm text-error">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-on-surface">
                  Password
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                  <input
                    id="login-password"
                    {...form.register("password")}
                    type="password"
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-surface-border/90 bg-surface-low py-2.5 pl-10 pr-4 text-on-surface shadow-inner shadow-on-surface/[0.02] placeholder:text-on-surface-variant/55 focus:border-primary/45 focus:bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary/12 sm:text-sm"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="mt-2 text-sm text-error">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-on-surface">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-primary underline-offset-4 hover:text-primary-dark hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container py-3 text-sm font-semibold text-on-primary shadow-lg shadow-primary/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative pt-2">
                <div className="absolute inset-x-0 top-1/2 border-t border-surface-border" />
                <p className="relative mx-auto w-max bg-surface-lowest px-3 text-center text-xs font-medium uppercase tracking-wider text-on-surface-variant/80">
                  Quick test accounts
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("email", "admin@acme.com");
                    form.setValue("password", "password123");
                  }}
                  className="rounded-xl border border-surface-border/90 py-2.5 text-center text-xs font-semibold text-on-surface transition-colors hover:bg-surface-low"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("email", "manager@acme.com");
                    form.setValue("password", "password123");
                  }}
                  className="rounded-xl border border-surface-border/90 py-2.5 text-center text-xs font-semibold text-on-surface transition-colors hover:bg-surface-low"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("email", "employee@acme.com");
                    form.setValue("password", "password123");
                  }}
                  className="rounded-xl border border-surface-border/90 py-2.5 text-center text-xs font-semibold text-on-surface transition-colors hover:bg-surface-low"
                >
                  Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
