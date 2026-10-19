import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm",
            error ? "border-rose-400 focus:ring-rose-400" : "border-slate-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
