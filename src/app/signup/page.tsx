"use client";

import { useEffect, useMemo, useState } from "react";
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
          className={`block w-full rounded-lg border py-3 px-4 sm:text-sm transition-colors
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
  const SIGNUP_DRAFT_KEY = "signup_wizard_draft_v1";
  const totalSteps = 10;
  const stepMeta: Record<number, { title: string; description: string }> = {
    1: { title: "Welcome", description: "Quick overview before starting your setup." },
    2: { title: "Your Name", description: "Tell us who is creating this workspace." },
    3: { title: "Email Address", description: "Use your work email for sign in." },
    4: { title: "Password", description: "Create a secure password for your account." },
    5: { title: "Company", description: "Set the company or workspace name." },
    6: { title: "Country", description: "Choose your base operating country." },
    7: { title: "Currency Mode", description: "Pick automatic or manual currency mode." },
    8: { title: "Base Currency", description: "Confirm the primary currency for expenses." },
    9: { title: "Review", description: "Double-check your details before submission." },
    10: { title: "Finish", description: "Submit and create your workspace." },
  };
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);
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
      localStorage.removeItem(SIGNUP_DRAFT_KEY);
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
    const raw = localStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        name?: string;
        email?: string;
        password?: string;
        companyName?: string;
        baseCurrency?: string;
        selectedCountryCode?: string;
        manualCurrencyOverride?: boolean;
        currentStep?: number;
        maxStepReached?: number;
      };

      if (typeof parsed.name === "string") form.setValue("name", parsed.name);
      if (typeof parsed.email === "string") form.setValue("email", parsed.email);
      if (typeof parsed.password === "string") form.setValue("password", parsed.password);
      if (typeof parsed.companyName === "string") form.setValue("companyName", parsed.companyName);
      if (typeof parsed.baseCurrency === "string") form.setValue("baseCurrency", parsed.baseCurrency);
      if (typeof parsed.selectedCountryCode === "string") setSelectedCountryCode(parsed.selectedCountryCode);
      if (typeof parsed.manualCurrencyOverride === "boolean") setManualCurrencyOverride(parsed.manualCurrencyOverride);
      if (typeof parsed.maxStepReached === "number") {
        const boundedMax = Math.min(Math.max(parsed.maxStepReached, 1), totalSteps);
        setMaxStepReached(boundedMax);
      }
      if (typeof parsed.currentStep === "number") {
        const boundedStep = Math.min(Math.max(parsed.currentStep, 1), totalSteps);
        setCurrentStep(boundedStep);
      }
    } catch {
      localStorage.removeItem(SIGNUP_DRAFT_KEY);
    }
  }, [form, totalSteps]);

  useEffect(() => {
    const saveDraft = () => {
      const values = form.getValues();
      const draft = {
        ...values,
        selectedCountryCode,
        manualCurrencyOverride,
        currentStep,
        maxStepReached,
      };
      localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
    };

    saveDraft();
    const subscription = form.watch(() => saveDraft());
    return () => subscription.unsubscribe();
  }, [form, selectedCountryCode, manualCurrencyOverride, currentStep, maxStepReached, SIGNUP_DRAFT_KEY]);

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

  useEffect(() => {
    const focusTargetByStep: Record<number, string> = {
      2: "su-name",
      3: "su-email",
      4: "su-password",
      5: "su-company",
      6: "su-country",
      8: "su-base-currency",
      10: "submit-workspace",
    };
    const targetId = focusTargetByStep[currentStep];
    if (!targetId) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el instanceof HTMLElement) {
        el.focus();
      }
    }, 40);

    return () => window.clearTimeout(timer);
  }, [currentStep]);

  const nextStep = async () => {
    setStepError(null);
    if (currentStep >= totalSteps) return;

    if (currentStep === 2) {
      const ok = await form.trigger("name");
      if (!ok) return;
    }
    if (currentStep === 3) {
      const ok = await form.trigger("email");
      if (!ok) return;
    }
    if (currentStep === 4) {
      const ok = await form.trigger("password");
      if (!ok) return;
    }
    if (currentStep === 5) {
      const ok = await form.trigger("companyName");
      if (!ok) return;
    }
    if (currentStep === 6 && !selectedCountryCode) {
      setStepError("Please select a country before continuing.");
      return;
    }
    if (currentStep === 8) {
      const ok = await form.trigger("baseCurrency");
      if (!ok) return;
    }

    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, totalSteps);
      setMaxStepReached((m) => Math.max(m, next));
      return next;
    });
  };

  const goToStep = (step: number) => {
    if (step < 1 || step > totalSteps) return;
    if (step > maxStepReached) return;
    setStepError(null);
    setCurrentStep(step);
  };

  const previousStep = () => {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetWizard = () => {
    form.reset({
      name: "",
      email: "",
      password: "",
      companyName: "",
      baseCurrency: "USD",
    });
    setError(null);
    setStepError(null);
    setSelectedCountryCode("");
    setManualCurrencyOverride(false);
    setCurrentStep(1);
    setMaxStepReached(1);
    localStorage.removeItem(SIGNUP_DRAFT_KEY);
  };

  const handleFormKeyDown = async (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (currentStep < totalSteps) {
      event.preventDefault();
      await nextStep();
    }
  };

  const stepAnimationClass = useMemo(
    () =>
      "animate-in fade-in slide-in-from-right-1 duration-300 motion-reduce:animate-none",
    [currentStep]
  );

  const currentStepMeta = stepMeta[currentStep];

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
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-10 sm:py-8 lg:w-1/2 lg:px-14">
        <div className="my-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-none sm:p-8 sm:shadow-sm">
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="space-y-0.5" aria-live="polite">
                <p className="text-sm font-semibold text-gray-800">{currentStepMeta.title}</p>
                <p className="text-xs text-gray-500">{currentStepMeta.description}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <div className="pt-2">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Jump to step</p>
                <nav className="flex flex-wrap gap-1.5" aria-label="Signup steps">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                    const isCurrent = step === currentStep;
                    const isUnlocked = step <= maxStepReached;
                    const label = stepMeta[step].title;
                    return (
                      <button
                        key={step}
                        type="button"
                        aria-current={isCurrent ? "step" : undefined}
                        aria-label={`Go to step ${step}: ${label}`}
                        title={isUnlocked ? label : "Complete previous steps first"}
                        disabled={!isUnlocked}
                        onClick={() => goToStep(step)}
                        className={`min-h-[2rem] min-w-[2rem] rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 ${
                          isCurrent
                            ? "bg-blue-600 text-white shadow-sm"
                            : isUnlocked
                              ? "border border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50"
                              : "border border-gray-100 bg-white text-gray-400"
                        }`}
                      >
                        {step}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="mt-5 space-y-4 sm:mt-6 sm:space-y-5" onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown}>
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-800">{error}</div>
            )}
            {stepError && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-800">{stepError}</div>
            )}

            <div key={currentStep} className={`min-h-[170px] sm:min-h-[185px] ${stepAnimationClass}`}>
            {currentStep === 1 && (
              <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <h3 className="text-lg font-semibold text-gray-900">Welcome to your 10-step setup</h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  Press Enter or use Next to move through each part. You can go back any time.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-2">
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
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-2">
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
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-2">
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
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-2">
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
                      className="block w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors sm:text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
              </div>
            )}

            {currentStep === 7 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Base currency mode</label>
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    id="manual-edit"
                    type="checkbox"
                    checked={manualCurrencyOverride}
                    onChange={(e) => setManualCurrencyOverride(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="manual-edit" className="ml-2 block cursor-pointer text-sm text-gray-600">
                    Enable manual currency edit
                  </label>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  {manualCurrencyOverride ? "Manual mode enabled." : "Automatic mode uses your selected country."}
                </p>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Base currency</label>
                  <div className="text-gray-400">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                </div>
                {!manualCurrencyOverride && (
                  <p className="text-xs text-gray-500">Auto-selected from country. Turn on manual mode to edit.</p>
                )}
                <input
                  id="su-base-currency"
                  type="text"
                  disabled={!manualCurrencyOverride}
                  {...form.register("baseCurrency")}
                  className={`block w-full rounded-lg border px-4 py-3 transition-colors sm:text-sm ${
                    !manualCurrencyOverride
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  }`}
                />
                {form.formState.errors.baseCurrency && (
                  <p className="text-sm text-red-600">{form.formState.errors.baseCurrency.message}</p>
                )}
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <h3 className="font-semibold text-gray-900">Review your details</h3>
                <p><span className="font-medium">Name:</span> {form.watch("name") || "-"}</p>
                <p><span className="font-medium">Email:</span> {form.watch("email") || "-"}</p>
                <p><span className="font-medium">Company:</span> {form.watch("companyName") || "-"}</p>
                <p><span className="font-medium">Country:</span> {selectedCountryCode || "-"}</p>
                <p><span className="font-medium">Base currency:</span> {form.watch("baseCurrency") || "-"}</p>
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <h3 className="text-base font-semibold text-emerald-900">Final step</h3>
                <p className="text-sm text-emerald-800">
                  Everything looks good. Click Create workspace to complete your signup.
                </p>
              </div>
            )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={resetWizard}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStep === 1}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  id="submit-workspace"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
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
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
