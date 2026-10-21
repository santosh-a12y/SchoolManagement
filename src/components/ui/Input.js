"use client";

import React, { forwardRef } from "react";

/**
 * Reusable Form Input Component
 * Includes visible labels, helper text, and validation error messages.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    name,
    type = "text",
    value,
    defaultValue,
    onChange,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    icon: Icon,
    className = "",
    inputClassName = "",
    ...props
  },
  ref
) {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${Icon ? "pl-9" : "pl-3"} pr-3 py-2
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 hover:border-slate-400"
            }
            ${inputClassName}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
