import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "applied"
    | "shortlisted"
    | "assessment"
    | "interview"
    | "selected"
    | "rejected"
    | "withdrawn"
    | "eligible"
    | "ineligible"
    | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variants: Record<string, string> = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
    assessment: "bg-purple-50 text-purple-700 border-purple-200",
    interview: "bg-indigo-50 text-indigo-700 border-indigo-200",
    selected: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    withdrawn: "bg-slate-100 text-slate-500 border-slate-200",
    eligible: "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium",
    ineligible: "bg-rose-50 text-rose-700 border-rose-300 font-medium",
    outline: "bg-transparent text-slate-700 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
