"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ProvisionalCertificateTemplate from "@/templates/ProvisionalCertificateTemplate";
import studentService from "@/services/studentService";
import documentService from "@/services/documentService";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { Printer, Download, Award } from "lucide-react";

function CertificatesContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";
  const { settings: school } = useSchoolSettings();

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [student, setStudent] = useState(null);
  const [certificateType, setCertificateType] = useState("Provisional School Leaving Certificate");
  const [conduct, setConduct] = useState("Exemplary");
  const [reason, setReason] = useState("Higher Education & Relocation");

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
        title="Provisional & Character Certificates"
        subtitle="Generate, preview, and print official certificates for student transfers, completions, and character attestations"
        breadcrumbs={[
          { label: "Documents" },
          { label: "Certificates" },
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
                  `Certificate_${selectedAdmissionNo}.pdf`,
                  { orientation: "portrait" }
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
              Print Certificate
            </Button>
          </div>
        }
      />

      {/* Control Configuration Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-8 no-print space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <SearchableSelect
              label="Select Student"
              value={selectedAdmissionNo}
              onChange={setSelectedAdmissionNo}
              options={studentOptions}
            />
          </div>
          <div>
            <Select
              label="Certificate Type"
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              options={[
                "Provisional School Leaving Certificate",
                "Character & Conduct Certificate",
                "Bonafide Student Certificate",
                "Course Completion Certificate",
              ]}
            />
          </div>
          <div>
            <Select
              label="Student Conduct"
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              options={["Exemplary", "Very Good", "Good", "Satisfactory"]}
            />
          </div>
          <div>
            <Input
              label="Reason for Issue"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      </div>

      {student ? (
        <div className="py-4">
          <ProvisionalCertificateTemplate
            student={student}
            school={school}
            certificateType={certificateType}
            conduct={conduct}
            reason={reason}
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          Select a student above to generate a certificate.
        </div>
      )}
    </AppLayout>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div>Loading certificates...</div>}>
      <CertificatesContent />
    </Suspense>
  );
}
