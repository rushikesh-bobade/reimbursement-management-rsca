"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseFormSchema, type ExpenseFormInput } from "@/lib/schemas";
import type { AppUser } from "@/app/page";
import { cn } from "@/lib/utils";
import { fieldInput, fieldLabel, surfaceCard } from "@/lib/ui";
import { Upload, CheckCircle, AlertCircle, ScanLine, Loader2 } from "lucide-react";

interface Props {
  compact?: boolean;
  currentUser: AppUser;
  onSubmitted: () => void;
}

const categories = [
  { value: "TRAVEL", label: "✈️ Travel" },
  { value: "MEALS", label: "🍽️ Meals" },
  { value: "OFFICE_SUPPLIES", label: "📎 Office Supplies" },
  { value: "EQUIPMENT", label: "💻 Equipment" },
  { value: "SOFTWARE", label: "📦 Software" },
  { value: "COMMUNICATION", label: "📱 Communication" },
  { value: "OTHER", label: "📋 Other" },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

export function ExpenseForm({ compact = false, currentUser, onSubmitted }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      originalCurrency: "USD",
      category: "TRAVEL",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: ExpenseFormInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.id,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit");
      }

      setSubmitted(true);
      reset();
      onSubmitted();
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // OCR: Upload receipt and auto-fill form
  const handleOCR = async (file: File) => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.extracted) {
        if (data.extracted.amount) setValue("amount", data.extracted.amount);
        if (data.extracted.date) setValue("date", data.extracted.date);
        if (data.extracted.description) setValue("description", data.extracted.description);
        if (data.extracted.category) setValue("category", data.extracted.category);
        setOcrResult(`OCR extracted (${Math.round(data.confidence)}% confidence)`);
      } else {
        setOcrResult("No data could be extracted from the receipt");
      }
    } catch {
      setOcrResult("OCR processing failed");
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className={cn(surfaceCard, "w-full", compact ? "p-5" : "p-6 sm:p-8")}>
      <div
        className={cn(
          "mb-6 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between",
          compact ? "border-b border-surface-border/50" : "border-b border-surface-border/70"
        )}
      >
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-display font-semibold tracking-tight text-on-surface",
              compact ? "text-lg" : "text-xl"
            )}
          >
            Submit new expense
          </h3>
          {!compact && (
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Amount, category, and date are required. Receipts help your approver review faster.
            </p>
          )}
        </div>
        {/* OCR Button */}
        {!compact && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={ocrLoading}
            className="flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-tertiary-fixed px-4 text-sm font-semibold text-tertiary shadow-sm ring-1 ring-tertiary/10 transition-all hover:bg-tertiary-fixed/90 disabled:opacity-50"
          >
            {ocrLoading ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            {ocrLoading ? "Scanning..." : "Scan Receipt (OCR)"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleOCR(file);
          }}
        />
      </div>

      {submitted && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-800 animate-fade-in">
          <CheckCircle className="mt-0.5 shrink-0" size={18} />
          <span>Expense submitted. It&apos;s now in the approval queue.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm font-medium text-error animate-fade-in">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {ocrResult && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-tertiary/15 bg-tertiary-fixed/60 px-4 py-3 text-sm font-medium text-tertiary animate-fade-in">
          <ScanLine className="mt-0.5 shrink-0" size={18} />
          <span>{ocrResult}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Amount & Currency */}
        <div className={cn("grid gap-x-4 gap-y-5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          <div className="min-w-0">
            <label className={fieldLabel} htmlFor="expense-amount">
              Amount *
            </label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              className={cn(
                fieldInput,
                "tabular-nums",
                errors.amount && "border-error/40 bg-error-container/20 ring-1 ring-error/15"
              )}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} /> {errors.amount.message}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label className={fieldLabel} htmlFor="expense-currency">
              Currency *
            </label>
            <select
              id="expense-currency"
              {...register("originalCurrency")}
              className={cn(fieldInput, "cursor-pointer appearance-none pr-10")}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Date */}
        <div className={cn("grid gap-x-4 gap-y-5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          <div className="min-w-0">
            <label className={fieldLabel} htmlFor="expense-category">
              Category *
            </label>
            <select
              id="expense-category"
              {...register("category")}
              className={cn(fieldInput, "cursor-pointer appearance-none pr-10")}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} /> {errors.category.message}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label className={fieldLabel} htmlFor="expense-date">
              Date *
            </label>
            <input
              id="expense-date"
              type="date"
              {...register("date")}
              className={cn(
                fieldInput,
                errors.date && "border-error/40 bg-error-container/20 ring-1 ring-error/15"
              )}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-error flex items-center gap-1">
                <AlertCircle size={12} /> {errors.date.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="min-w-0">
          <label className={fieldLabel} htmlFor="expense-description">
            Description *
          </label>
          <textarea
            id="expense-description"
            rows={compact ? 2 : 3}
            placeholder="Brief description of the expense..."
            {...register("description")}
            className={cn(
              fieldInput,
              "resize-none",
              errors.description && "border-error/40 bg-error-container/20 ring-1 ring-error/15"
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error flex items-center gap-1">
              <AlertCircle size={12} /> {errors.description.message}
            </p>
          )}
        </div>

        {/* Receipt upload */}
        {!compact && (
          <div className="min-w-0">
            <span className={fieldLabel}>Receipt (optional)</span>
            <div
              className="cursor-pointer rounded-xl border-2 border-dashed border-surface-border px-6 py-8 text-center transition-all duration-200 hover:border-primary/35 hover:bg-primary/[0.03]"
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <Upload size={26} className="mx-auto mb-2 text-primary/50" strokeWidth={1.75} />
              <p className="text-sm font-medium text-on-surface">Upload receipt</p>
              <p className="mt-1 text-xs text-on-surface-variant">PNG or JPG · OCR can pre-fill the form</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-semibold text-on-primary",
            "bg-gradient-to-r from-primary to-primary-container shadow-md shadow-primary/20",
            "transition-all duration-200 hover:shadow-lg hover:shadow-primary/30",
            "active:scale-[0.99]",
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          )}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Submitting...
            </span>
          ) : "Submit Expense"}
        </button>
      </form>
    </div>
  );
}
