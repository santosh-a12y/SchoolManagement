"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import AdmitCardTemplate from "@/templates/AdmitCardTemplate";
import studentService from "@/services/studentService";
import examService from "@/services/examService";
import documentService from "@/services/documentService";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { Printer, Download } from "lucide-react";

function AdmitCardsContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";
  const { settings: school } = useSchoolSettings();

  const [students, setStudents] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [selectedExam, setSelectedExam] = useState("Annual Exam");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    studentService.getStudents().then((data) => {
      setStudents(data);
      if (!initialAdmNo && data.length > 0) {
        setSelectedAdmissionNo(data[0].admissionNumber);
      }
    });
    examService.getExaminations().then(setExaminations);
  }, [initialAdmNo]);

  useEffect(() => {
    if (!selectedAdmissionNo) return;
    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then((data) => {
        setSelectedStudent(data.student);
        // Load schedule for this student's class and exam
        examService
          .getSchedule(selectedExam, "", data.student.className)
          .then(setSchedules)
          .catch(console.error);
      })
      .catch(console.error);
  }, [selectedAdmissionNo, selectedExam]);

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section} (Roll: ${s.rollNumber || "—"})`,
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Examination Admit Cards & Hall Tickets"
        subtitle="Generate official examination hall tickets with timetable schedules and instructions"
        breadcrumbs={[
          { label: "Academics", href: "/academics/examinations" },
          { label: "Admit Cards" },
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
                  `Admit_Card_${selectedAdmissionNo}_${selectedExam.replace(/\s+/g, "_")}.pdf`
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
              Print Admit Card
            </Button>
          </div>
        }
      />

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 no-print flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchableSelect
            label="Select Student"
            value={selectedAdmissionNo}
            onChange={setSelectedAdmissionNo}
            options={studentOptions}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select
            label="Examination"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            options={examinations.map((e) => e.name)}
          />
        </div>
      </div>

      {selectedStudent ? (
        <div className="py-4">
          <AdmitCardTemplate
            student={selectedStudent}
            examinationName={selectedExam}
            academicSession={selectedStudent.academicSession || "2026-27"}
            schedules={schedules}
            school={school}
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          Select a student to generate their Examination Admit Card.
        </div>
      )}
    </AppLayout>
  );
}

export default function AdmitCardsPage() {
  return (
    <Suspense fallback={<div>Loading admit cards...</div>}>
      <AdmitCardsContent />
    </Suspense>
  );
}
