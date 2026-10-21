"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Save,
  RefreshCw,
} from "lucide-react";

export default function ExcelManagementPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      setErrorMsg("");
    }
  };

  const handlePreviewImport = async (commit = false) => {
    if (!selectedFile) return;

    if (commit) setIsCommitting(true);
    else setIsUploading(true);

    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("commit", commit ? "true" : "false");

      const res = await fetch("/api/excel/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || "Import validation failed.");
      } else {
        setImportResult(data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process Excel spreadsheet.");
    } finally {
      setIsUploading(false);
      setIsCommitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Excel Import & Export Center"
        subtitle="Bulk import student admissions with pre-validation and export verified school spreadsheets"
        breadcrumbs={[{ label: "Excel Data Tools" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Import Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Import Student Records (.xlsx)
            </h3>
            <a
              href="/api/excel/export?type=template"
              download
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample Template
            </a>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">
              {selectedFile ? selectedFile.name : "Choose an Excel (.xlsx) file to upload"}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Upload your spreadsheet with columns: Admission Number, Student Name, Class, Section, Parent details.
            </p>
            <label htmlFor="excel-file-input">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer">
                Select Excel File
              </span>
            </label>
          </div>

          {selectedFile && !importResult && (
            <div className="flex items-center justify-end">
              <Button
                variant="primary"
                size="md"
                icon={Upload}
                isLoading={isUploading}
                onClick={() => handlePreviewImport(false)}
              >
                Validate & Preview Rows
              </Button>
            </div>
          )}

          {/* Validation & Preview Output */}
          {importResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 uppercase text-[10px]">Total Rows</span>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {importResult.totalRows}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 uppercase text-[10px]">Valid & Ready</span>
                  <div className="text-lg font-bold text-emerald-800 font-mono mt-0.5">
                    {importResult.validCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-red-700 uppercase text-[10px]">Errors / Duplicates</span>
                  <div className="text-lg font-bold text-red-800 font-mono mt-0.5">
                    {importResult.invalidCount}
                  </div>
                </div>
              </div>

              {/* Row Errors */}
              {importResult.invalidRecords?.length > 0 && (
                <div className="bg-red-50/50 border border-red-200 p-4 rounded-xl text-xs space-y-2">
                  <h5 className="font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Row Validation Errors (These rows will be skipped):
                  </h5>
                  <ul className="divide-y divide-red-100 max-h-40 overflow-y-auto">
                    {importResult.invalidRecords.map((inv, idx) => (
                      <li key={idx} className="py-1.5 flex items-start justify-between">
                        <div>
                          <strong className="text-red-800">Row {inv.rowNumber}</strong> (Adm: {inv.admissionNumber || "None"}):
                          <span className="text-red-700 ml-1">{inv.errors.join(", ")}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Commit Confirmation Button */}
              {importResult.isCommitted ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Successfully imported and permanently saved {importResult.insertedCount} student records!
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Verify the counts above before saving to database.
                  </span>
                  <Button
                    variant="success"
                    size="md"
                    icon={Save}
                    disabled={importResult.validCount === 0}
                    isLoading={isCommitting}
                    onClick={() => handlePreviewImport(true)}
                  >
                    Confirm & Save {importResult.validCount} Records
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Export Center */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-emerald-600" />
            Spreadsheet Exports
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            Download standard Excel (.xlsx) reports formatted with clean column headers for external audits, board submissions, and backups.
          </p>

          <div className="space-y-3 pt-2">
            <a
              href="/api/excel/export?type=students"
              download
              className="block p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all"
            >
              <div className="text-xs font-bold text-slate-900">Export Student Directory</div>
              <div className="text-[11px] text-slate-500">
                Full student roster with personal, class, and parent contact columns.
              </div>
            </a>

            <a
              href="/api/excel/export?type=fees"
              download
              className="block p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
            >
              <div className="text-xs font-bold text-slate-900">Export Fee Payment Records</div>
              <div className="text-[11px] text-slate-500">
                All receipt transactions, payment dates, amounts, and modes.
              </div>
            </a>

            <a
              href="/api/excel/export?type=marks"
              download
              className="block p-3 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all"
            >
              <div className="text-xs font-bold text-slate-900">Export Examination Marks</div>
              <div className="text-[11px] text-slate-500">
                Subject marks, totals, grades, and pass/fail results across all terms.
              </div>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
