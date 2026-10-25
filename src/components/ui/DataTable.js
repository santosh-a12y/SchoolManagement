"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import EmptyState from "./EmptyState";

/**
 * Reusable Administrative DataTable Component
 * 
 * Supports:
 * - Search query across all text columns
 * - Column sorting (asc/desc)
 * - Pagination controls (10, 25, 50 rows)
 * - Custom header filters (Class, Section, etc.)
 */
export default function DataTable({
  columns = [], // [{ key: 'studentName', label: 'Name', sortable: true, render: (val, row) => ... }]
  data = [],
  searchPlaceholder = "Search records...",
  filterComponents = null,
  initialSortKey = "",
  initialSortDir = "asc",
  onRowClick = null,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  isLoading = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey || (columns[0]?.key || ""));
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset pagination to page 1 whenever source data length changes
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Numeric comparison
      if (!isNaN(valA) && !isNaN(valB)) {
        return sortDir === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }

      // String comparison
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [filteredData, sortKey, sortDir]);

  // Pagination calculation
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Numbered pagination windowing (e.g. 1, 2, 3 ... 10)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  // Sort click handler
  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Controls Bar: Search & Filters */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Custom Filter Components Slot */}
        {filterComponents && (
          <div className="flex flex-wrap items-center gap-2">
            {filterComponents}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs tracking-wider uppercase select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`px-4 py-3.5 ${
                    col.sortable ? "cursor-pointer hover:bg-slate-100" : ""
                  } ${col.headerClassName || ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <span>
                        {sortDir === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {isLoading ? (
              // Realistic Shimmer Skeleton Rows matching column blueprint
              Array.from({ length: Math.min(pageSize, 8) }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={`px-4 py-3.5 align-middle ${col.className || ""}`}
                    >
                      {cIdx === 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                          <div className="space-y-1.5 flex-1 max-w-[160px]">
                            <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                          </div>
                        </div>
                      ) : cIdx === columns.length - 1 && (col.key === "actions" || col.label === "Actions") ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-7 h-7 bg-slate-200/80 rounded-md" />
                          <div className="w-7 h-7 bg-slate-200/80 rounded-md" />
                          <div className="w-7 h-7 bg-slate-200/80 rounded-md" />
                        </div>
                      ) : (
                        <div
                          className="h-3.5 bg-slate-200 rounded"
                          style={{
                            width: `${40 + ((rIdx * 19 + cIdx * 23) % 45)}%`,
                            maxWidth: "180px",
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || row.admissionNumber || row.receiptNumber || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-blue-50/40" : "hover:bg-slate-50/80"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-middle ${col.className || ""}`}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {isLoading ? (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-6 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-36" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-7 w-7 bg-slate-200 rounded-md" />
            <div className="h-7 w-7 bg-slate-200 rounded-md" />
            <div className="h-7 w-24 bg-slate-200 rounded-md" />
            <div className="h-7 w-7 bg-slate-200 rounded-md" />
            <div className="h-7 w-7 bg-slate-200 rounded-md" />
          </div>
        </div>
      ) : totalRecords > 0 ? (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          {/* Left: Rows Per Page & Record Count */}
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-300 rounded px-2 py-1 bg-white text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Showing{" "}
              <strong className="text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900">
                {Math.min(currentPage * pageSize, totalRecords)}
              </strong>{" "}
              of <strong className="text-slate-900">{totalRecords}</strong> records
            </span>
          </div>

          {/* Right: Numbered Page Buttons & Navigation Chevrons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Numbered Pills with Smart Windowing */}
            <div className="flex items-center gap-1 px-1">
              {pageNumbers.map((pNum, idx) => {
                if (pNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 py-1 text-xs text-slate-400 font-semibold select-none"
                    >
                      ...
                    </span>
                  );
                }
                const isActive = pNum === currentPage;
                return (
                  <button
                    key={`page-${pNum}`}
                    onClick={() => setPage(pNum)}
                    className={`min-w-[28px] h-7 px-2 text-xs rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-xs cursor-default"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
