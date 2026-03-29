"use client";

import { useState, type ReactNode } from "react";
import { useForm, type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CreditCard, CheckCircle2, Scale, Users } from "lucide-react";
import Link from "next/link";

interface InputFieldProps {
  id: "email" | "password";
  label: string;
  type: "email" | "password";
  placeholder: string;
  icon: ReactNode;
  autoFocus?: boolean;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

function InputField({ id, label, type, placeholder, icon, autoFocus = false, registration, error }: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(autoFocus);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <span className="pointer-events-none flex h-5 w-5 items-center justify-center text-gray-400">{icon}</span>
        <div
          className={`flex-1 rounded-lg border bg-white transition-colors ${
            isFocused ? "border-blue-600 shadow-[0_0_0_1px_#2563eb]" : "border-gray-300"
          }`}
        >
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required
          {...registration}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            registration.onBlur(e);
          }}
          className="block w-full rounded-lg border-none bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-error">{error.message}</p>}
    </div>
  );
}

function TestAccounts({ onSelect }: { onSelect: (role: "ADMIN" | "MANAGER" | "EMPLOYEE") => void }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 text-center">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-gray-500">QUICK TEST ACCOUNTS</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onSelect("ADMIN")}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => onSelect("MANAGER")}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Manager
        </button>
        <button
          type="button"
          onClick={() => onSelect("EMPLOYEE")}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Employee
        </button>
      </div>
    </div>
  );
}

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

  return (
    <div className="flex min-h-screen w-full bg-white text-gray-900">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px] opacity-50" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <CreditCard className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ReimburseFlow</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Expense Management</p>
            </div>
          </div>

          <div className="mt-20 max-w-lg">
            <h2 className="text-5xl font-extrabold leading-[1.15] tracking-tight">
              Bring your <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">reimbursements</span> <br />
              under control.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              One workspace for employees, managers, and admins—with intelligent workflows that match how your company actually approves spend.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Multi-step approvals</h3>
                  <p className="mt-1 text-sm text-slate-400">Customizable routing with a crystal-clear audit trail.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">FX-aware & Structured</h3>
                  <p className="mt-1 text-sm text-slate-400">Automatic currency conversion and smart categorization.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Role-based queues</h3>
                  <p className="mt-1 text-sm text-slate-400">Dedicated, clutter-free views for managers and finance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">© 2026 ReimburseFlow</div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-gray-600">
              New to the product?{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Create a company account
              </Link>
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl border border-red-200/90 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</div>
            )}

            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoFocus
              registration={form.register("email")}
              error={form.formState.errors.email}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>
                </svg>
              )}
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              registration={form.register("password")}
              error={form.formState.errors.password}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            />

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#forgot" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <TestAccounts
            onSelect={(role) => {
              if (role === "ADMIN") {
                form.setValue("email", "admin@acme.com");
              }
              if (role === "MANAGER") {
                form.setValue("email", "manager@acme.com");
              }
              if (role === "EMPLOYEE") {
                form.setValue("email", "employee@acme.com");
              }
              form.setValue("password", "password123");
            }}
          />
        </div>
      </div>
    </div>
  );
}
