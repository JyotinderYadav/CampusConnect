import React from "react";
import { cn } from "../../lib/utils";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn("font-semibold text-lg text-slate-900 leading-none tracking-tight", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn("text-sm text-slate-500 mt-1.5", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-6", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between", className)} {...props} />
);
