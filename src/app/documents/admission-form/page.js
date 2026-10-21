"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Button from "@/components/ui/Button";
import AdmissionFormTemplate from "@/templates/AdmissionFormTemplate";
import studentService from "@/services/studentService";
import documentService from "@/services/documentService";
import { Printer, Download, FileText } from "lucide-react";

function AdmissionFormContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [student, setStudent] = useState(null);

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
    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then((data) => setStudent(data.student))
      .catch(console.error);
  }, [selectedAdmissionNo]);

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section}`,
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Student Admission Form"
        subtitle="Generate and print completed school admission applications with student & parent photographs"
        breadcrumbs={[
          { label: "Documents" },
          { label: "Admission Form" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() =>
                documentService.downloadPdf(
                  "printable-document",
                  `Admission_Form_${selectedAdmissionNo}.pdf`
                )
              }
            >
              Download PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => documentService.print()}
            >
              Print Admission Form
            </Button>
          </div>
        }
      />

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 no-print">
        <div className="w-full sm:w-80">
          <SearchableSelect
            label="Select Student"
            value={selectedAdmissionNo}
            onChange={setSelectedAdmissionNo}
            options={studentOptions}
          />
        </div>
      </div>

      {student ? (
        <div className="py-4">
          <AdmissionFormTemplate student={student} />
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          Select a student to generate their official admission form.
        </div>
      )}
    </AppLayout>
  );
}

export default function AdmissionFormPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <AdmissionFormContent />
    </Suspense>
  );
}
