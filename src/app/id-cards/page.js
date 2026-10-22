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
import { Printer, Download, CreditCard, Layout } from "lucide-react";

function IdCardsContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";
  const initialFormat = searchParams.get("format") || "standard";
  const { settings: school } = useSchoolSettings();

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const handleDownloadPdf = () => {
    documentService.downloadPdf(
      "printable-document",
      `ID_Card_${selectedAdmissionNo}_${selectedFormat}.pdf`,
      {
        isIdCard: true,
        isVertical: selectedFormat === "vertical",
      }
    );
  };

  return (
    <AppLayout>
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 no-print flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <SearchableSelect
            label="Select Student"
            value={selectedAdmissionNo}
            onChange={setSelectedAdmissionNo}
            options={studentOptions}
          />
        </div>

        {/* Format Toggle Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Card Layout:</span>
          <button
            onClick={() => setSelectedFormat("standard")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedFormat === "standard"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Horizontal (CR-80)
          </button>
          <button
            onClick={() => setSelectedFormat("vertical")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedFormat === "vertical"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Vertical Badge
          </button>
        </div>
      </div>

      {/* Card Preview Container */}
      <div className="py-8 flex flex-col items-center justify-center min-h-[350px]">
        {selectedStudent ? (
          <StudentIdCardTemplate
            student={selectedStudent}
            format={selectedFormat}
            school={school}
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
