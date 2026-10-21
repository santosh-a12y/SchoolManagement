"use client";

import React, { forwardRef } from "react";

/**
 * Reusable Select Dropdown Component
 */
const Select = forwardRef(function Select(
  {
    label,
    id,
    name,
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    helperText,
    required = false,
    disabled = false,
    className = "",
    selectClassName = "",
    ...props
  },
  ref
) {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm text-slate-900 bg-white transition-colors cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            px-3 py-2
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 hover:border-slate-400"
            }
            ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const isObject = typeof opt === "object" && opt !== null;
            const val = isObject ? opt.value : opt;
            const text = isObject ? opt.label : opt;
            return (
              <option key={String(val)} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
