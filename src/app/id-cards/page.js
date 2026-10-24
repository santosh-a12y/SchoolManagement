"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Button from "@/components/ui/Button";
import StudentIdCardTemplate from "@/templates/StudentIdCardTemplate";
import studentService from "@/services/studentService";
import documentService from "@/services/documentService";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import {
  Printer,
  Download,
  CreditCard,
  Layout,
  SlidersHorizontal,
  Layers,
  Check,
} from "lucide-react";

function IdCardsContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";
  const initialFormat = searchParams.get("format") || "standard";
  const { settings: school } = useSchoolSettings();

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat); // "standard" | "vertical"
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Print Setup Options
  const [printPaper, setPrintPaper] = useState("a4"); // "a4" | "card"
  const [printOrientation, setPrintOrientation] = useState("auto"); // "auto" | "landscape" | "portrait"
  const [includeBack, setIncludeBack] = useState(false);
  const [withCutGuide, setWithCutGuide] = useState(true);

  useEffect(() => {
    studentService.getStudents().then((data) => {
      setStudents(data);
      if (!initialAdmNo && data.length > 0) {
        setSelectedAdmissionNo(data[0].admissionNumber);
      }
    });
  }, [initialAdmNo]);

  useEffect(() => {
    if (!selectedAdmissionNo) return;
    const found = students.find((s) => s.admissionNumber === selectedAdmissionNo);
    if (found) {
      setSelectedStudent(found);
    } else {
      studentService
        .getStudentByAdmissionNumber(selectedAdmissionNo)
        .then((data) => setSelectedStudent(data.student))
        .catch(console.error);
    }
  }, [selectedAdmissionNo, students]);

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section} (Roll: ${s.rollNumber || "—"})`,
  }));

  // Calculate dynamic print page size and orientation
  const effectiveOrientation =
    printOrientation === "auto"
      ? selectedFormat === "standard"
        ? "landscape"
        : "portrait"
      : printOrientation;

  const printPageSize =
    printPaper === "card"
      ? selectedFormat === "standard"
        ? "85.6mm 54mm"
        : "54mm 85.6mm"
      : `A4 ${effectiveOrientation}`;

  const printMargin = printPaper === "card" ? "0mm" : "10mm";

  const handleDownloadPdf = () => {
    documentService.downloadPdf(
      "printable-document",
      `ID_Card_${selectedAdmissionNo}_${selectedFormat}.pdf`,
      {
        isIdCard: !includeBack,
        isVertical: selectedFormat === "vertical",
        orientation: effectiveOrientation,
      }
    );
  };

  return (
    <AppLayout>
      {/* Dynamic Print Stylesheet for ID Card Orientation & Sizing */}
      <style>{`
        @media print {
          @page {
            size: ${printPageSize} !important;
            margin: ${printMargin} !important;
          }
          body {
            background: #ffffff !important;
          }
          .id-card-print-container {
            display: flex !important;
            flex-direction: ${effectiveOrientation === "landscape" ? "row" : "column"} !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8mm !important;
            width: 100% !important;
            margin: auto !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <PageHeader
        title="Student Identity Cards"
        subtitle="Generate standard CR-80 physical identity cards and portrait badges for students"
        breadcrumbs={[
          { label: "Students", href: "/students" },
          { label: "ID Cards" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadPdf}
            >
              Download Card PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => documentService.print()}
            >
              Print ID Card
            </Button>
          </div>
        }
      />

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-8 no-print space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="w-full lg:w-80">
            <SearchableSelect
              label="Select Student"
              value={selectedAdmissionNo}
              onChange={setSelectedAdmissionNo}
              options={studentOptions}
            />
          </div>

          {/* Format Toggle Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Card Layout:</span>
            <button
              onClick={() => setSelectedFormat("standard")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFormat === "standard"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Horizontal (CR-80: 85.6 × 54mm)
            </button>
            <button
              onClick={() => setSelectedFormat("vertical")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedFormat === "vertical"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Vertical Badge (54 × 85.6mm)
            </button>
          </div>
        </div>

        {/* Print Setup Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Paper Target */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Print Paper:</span>
              <select
                value={printPaper}
                onChange={(e) => setPrintPaper(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="a4">A4 Sheet (Office Printer - Cut & Laminate)</option>
                <option value="card">Direct PVC Card Printer (CR-80 Borderless)</option>
              </select>
            </div>

            {/* Print Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Orientation:</span>
              <select
                value={printOrientation}
                onChange={(e) => setPrintOrientation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="auto">
                  Auto ({selectedFormat === "standard" ? "Landscape" : "Portrait"} Recommended)
                </option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Show Back Side Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={includeBack}
                onChange={(e) => setIncludeBack(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Print Front & Back Side</span>
            </label>

            {/* Cut Guides Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={withCutGuide}
                onChange={(e) => setWithCutGuide(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Show Cut Guidelines</span>
            </label>
          </div>
        </div>
      </div>

      {/* Card Preview Container */}
      <div className="py-4 flex flex-col items-center justify-center">
        {selectedStudent ? (
          <StudentIdCardTemplate
            student={selectedStudent}
            format={selectedFormat}
            school={school}
            showBack={includeBack}
            withCutGuide={withCutGuide}
          />
        ) : (
          <div className="text-slate-400 text-sm">Select a student above to preview the ID card.</div>
        )}
      </div>
    </AppLayout>
  );
}

export default function IdCardsPage() {
  return (
    <Suspense fallback={<div>Loading ID cards...</div>}>
      <IdCardsContent />
    </Suspense>
  );
}
