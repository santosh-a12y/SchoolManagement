"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

/**
 * SearchableSelect Component
 * Allows rapid lookup of items (e.g., students by Admission No or Name).
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [], // [{ value: 'ADM-2026-001', label: 'Aarav Sharma', subtitle: 'Class 5-A' }]
  placeholder = "Search and select...",
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const q = query.toLowerCase();
    const valMatch = String(opt.value || "").toLowerCase().includes(q);
    const labelMatch = String(opt.label || "").toLowerCase().includes(q);
    const subMatch = String(opt.subtitle || "").toLowerCase().includes(q);
    return valMatch || labelMatch || subMatch;
  });

  return (
    <div className={`relative w-full flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Main Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border bg-white cursor-pointer transition-colors shadow-xs
          ${disabled ? "bg-slate-50 cursor-not-allowed opacity-75" : "hover:border-slate-400"}
          ${error ? "border-red-400 focus:ring-red-200" : "border-slate-300"}
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
      >
        <span className={selectedOption ? "text-slate-900 font-medium truncate" : "text-slate-400"}>
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              <span className="font-semibold text-blue-600">{selectedOption.value}</span>
              <span>—</span>
              <span className="text-slate-800">{selectedOption.label}</span>
              {selectedOption.subtitle && (
                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {selectedOption.subtitle}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>

        <div className="flex items-center gap-1 text-slate-400 ml-2 shrink-0">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setQuery("");
              }}
              className="p-0.5 hover:text-slate-700 rounded-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-72 flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type admission no, name, class..."
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching records found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors
                      ${isSelected ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50 text-slate-800"}`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-blue-600">{opt.value}</div>
                      <div className="font-medium text-slate-900">{opt.label}</div>
                      {opt.subtitle && <div className="text-xs text-slate-500">{opt.subtitle}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}
