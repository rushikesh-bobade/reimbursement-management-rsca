"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type CountryCurrencyOption = {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
};

// --- Reusable Input Component ---
const InputField = ({
  id,
  label,
  type,
  placeholder,
  icon,
  disabled = false,
  ...props
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
  [key: string]: unknown;
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={id}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-lg border py-2.5 pl-3 pr-3 sm:text-sm transition-colors
            ${
              disabled
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            }`}
          required
          {...props}
        />
      </div>
    </div>
  );
};

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryCurrencyOption[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [manualCurrencyOverride, setManualCurrencyOverride] = useState<boolean>(false);

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

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch("/api/countries", { method: "GET" });
        const json = await res.json();
        if (!res.ok || !Array.isArray(json.countries)) {
          return;
        }
        setCountries(json.countries);
      } catch {
        setCountries([]);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (manualCurrencyOverride) return;
    if (countries.length === 0 || !selectedCountryCode) return;

    const matched = countries.find((country) => country.countryCode === selectedCountryCode);
    if (!matched) return;

    form.setValue("baseCurrency", matched.currencyCode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [countries, selectedCountryCode, manualCurrencyOverride, form]);

  return (
    <div className="flex min-h-screen w-full bg-white text-gray-900 font-sans">
      {/* LEFT PANEL (Modernized Branding) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        {/* Decorative Ambient Glows */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo area */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ReimburseFlow</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">New Company</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-16 max-w-lg">
            <h2 className="text-5xl font-extrabold leading-[1.15] tracking-tight">
              Set up your <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">workspace</span> <br />
              in minutes.
            </h2>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Register your organization, pick a base currency, and start inviting people—no separate "tenant" setup required.
            </p>

            {/* Glassmorphic Feature Cards */}
            <div className="mt-10 space-y-4">
              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Company-wide policies</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Configure global approval chains and rules.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Invite teams instantly</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Add managers and employees as you grow.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Export-friendly history</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Streamlined data exports for finance close.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          Secure sign-up · Encrypted session cookies
        </div>
      </div>

      {/* RIGHT PANEL (Registration Form) */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</div>
            )}

            <InputField
              id="su-name"
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}

            <InputField
              id="su-email"
              label="Email"
              type="email"
              placeholder="jane@company.com"
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              }
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}

            <InputField
              id="su-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              }
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}

            <div className="border-t border-gray-200 my-6"></div>

            <InputField
              id="su-company"
              label="Company name"
              type="text"
              placeholder="Acme Corp"
              icon={
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <path d="M9 22v-4h6v4"></path>
                  <path d="M8 6h.01"></path>
                  <path d="M16 6h.01"></path>
                  <path d="M12 6h.01"></path>
                  <path d="M12 10h.01"></path>
                  <path d="M12 14h.01"></path>
                  <path d="M16 10h.01"></path>
                  <path d="M16 14h.01"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M8 14h.01"></path>
                </svg>
              }
              {...form.register("companyName")}
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
            )}

            {/* Country Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="su-country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="text-gray-400">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </div>
              </div>
              <div className="relative mt-1.5">
                <select
                  id="su-country"
                  value={selectedCountryCode}
                  onChange={(event) => setSelectedCountryCode(event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-3 sm:text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={`${country.countryCode}-${country.currencyCode}`} value={country.countryCode}>
                      {country.countryName} ({country.currencyCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Base Currency Field */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Base currency</label>
                <div className="flex items-center">
                  <input
                    id="manual-edit"
                    type="checkbox"
                    checked={manualCurrencyOverride}
                    onChange={(e) => setManualCurrencyOverride(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="manual-edit" className="ml-2 block text-xs text-gray-500 cursor-pointer">
                    Edit manually
                  </label>
                </div>
              </div>

              {!manualCurrencyOverride && (
                <p className="text-xs text-gray-400 mb-2">Auto-selected from country</p>
              )}

              <div className={`relative ${manualCurrencyOverride ? "mt-1.5" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div></div>
                  <div className="text-gray-400">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  disabled={!manualCurrencyOverride}
                  {...form.register("baseCurrency")}
                  className={`block w-full rounded-lg border py-2.5 pl-3 pr-3 sm:text-sm transition-colors
                    ${
                      !manualCurrencyOverride
                        ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create workspace
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
