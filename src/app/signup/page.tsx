"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { Building2, User, Mail, Lock, DollarSign, Loader2, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inputClass =
  "block w-full rounded-xl border border-surface-border/90 bg-surface-low py-2.5 pl-10 pr-4 text-on-surface shadow-inner shadow-on-surface/[0.02] placeholder:text-on-surface-variant/55 focus:border-primary/45 focus:bg-surface-lowest focus:outline-none focus:ring-2 focus:ring-primary/12 sm:text-sm";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      baseCurrency: "USD",
    },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    try {
      setError(null);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Signup failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const points = [
    "Company-wide policies and approval chains",
    "Invite managers and employees as you grow",
    "Export-friendly history for finance close",
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="relative hidden min-h-screen w-[44%] min-w-[420px] flex-col justify-between overflow-hidden lg:flex">
        <div className="ui-auth-pattern absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-primary to-[#0b1220]" />
        <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Building2 className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-white">ReimburseFlow</p>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/55">New company</p>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white xl:text-[2rem]">
              Set up your workspace in minutes
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Register your organization, pick a base currency, and start inviting people—no separate “tenant” setup.
            </p>
            <ul className="mt-10 space-y-4">
              {points.map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-white/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/40">Secure sign-up · Encrypted session cookies</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
                <Building2 className="h-5 w-5 text-on-primary" strokeWidth={2} />
              </div>
              <span className="font-display text-lg font-semibold text-on-surface">ReimburseFlow</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">Create account</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:text-primary-dark hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-8 rounded-2xl border border-surface-border/90 bg-surface-lowest p-6 shadow-[0_12px_40px_rgba(19,27,46,0.07)] sm:p-8">
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-xl border border-red-200/90 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</div>
              )}

              <div>
                <label htmlFor="su-name" className="block text-sm font-medium text-on-surface">
                  Full name
                </label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                  <input id="su-name" {...form.register("name")} type="text" className={inputClass} />
                </div>
                {form.formState.errors.name && (
                  <p className="mt-2 text-sm text-error">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="su-email" className="block text-sm font-medium text-on-surface">
                  Email
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                  <input id="su-email" {...form.register("email")} type="email" autoComplete="email" className={inputClass} />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-2 text-sm text-error">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="su-password" className="block text-sm font-medium text-on-surface">
                  Password
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                  <input
                    id="su-password"
                    {...form.register("password")}
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="mt-2 text-sm text-error">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="border-t border-surface-border pt-5">
                <h3 className="mb-4 text-sm font-semibold text-on-surface">Company</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="su-company" className="block text-sm font-medium text-on-surface">
                      Company name
                    </label>
                    <div className="relative mt-2">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                      <input id="su-company" {...form.register("companyName")} type="text" className={inputClass} />
                    </div>
                    {form.formState.errors.companyName && (
                      <p className="mt-2 text-sm text-error">{form.formState.errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="su-currency" className="block text-sm font-medium text-on-surface">
                      Base currency
                    </label>
                    <div className="relative mt-2">
                      <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/80" />
                      <select id="su-currency" {...form.register("baseCurrency")} className={cn(inputClass, "cursor-pointer appearance-none pr-10")}>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="INR">INR — Indian Rupee</option>
                      </select>
                    </div>
                  </div>
                </div>
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
                    Create workspace <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
