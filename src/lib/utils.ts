import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "APPROVED":
      return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "REJECTED":
      return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
    case "IN_REVIEW":
      return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
    case "PENDING":
    default:
      return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  }
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case "TRAVEL": return "✈️";
    case "MEALS": return "🍽️";
    case "OFFICE_SUPPLIES": return "📎";
    case "EQUIPMENT": return "💻";
    case "SOFTWARE": return "📦";
    case "OTHER": return "📋";
    default: return "📋";
  }
}
