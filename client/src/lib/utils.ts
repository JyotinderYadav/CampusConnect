import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null): string {
  if (amount == null) return "N/A";
  if (amount >= 1) return `₹${amount.toFixed(1)} LPA`;
  return `₹${(amount * 100000).toLocaleString("en-IN")}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
