"use client";

import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button Component
 * 
 * Provides consistent styling across administrative actions.
 * Variants:
 * - primary: Royal Blue (#2563eb) for main actions (Save, Submit, New)
 * - secondary: Slate/Navy for secondary actions
 * - outline: Bordered button for cancel/back actions
 * - danger: Crimson red for destructive actions
 * - ghost: Flat text button with hover highlight
 */
export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) {
  // Base structural classes
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

  // Size variations
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  // Color & border variants
  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm focus:ring-blue-500",
    secondary:
      "bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white shadow-sm focus:ring-slate-700",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs focus:ring-blue-500",
    danger:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400",
    success:
      "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm focus:ring-emerald-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
    </button>
  );
}
