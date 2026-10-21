"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarksheetTemplate from "@/templates/MarksheetTemplate";
import studentService from "@/services/studentService";
import examService from "@/services/examService";
import documentService from "@/services/documentService";
import { calculateGrade } from "@/lib/formatters";
import { Printer, Download, Save, GraduationCap, Edit, AlertCircle, CheckCircle2 } from "lucide-react";

function MarksheetsContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";

  const [students, setStudents] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [selectedExam, setSelectedExam] = useState("Annual Exam");
  const [activeSession, setActiveSession] = useState("2026-27");

  const [studentData, setStudentData] = useState(null);
  const [marksRows, setMarksRows] = useState([]);
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'entry'
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    studentService.getStudents().then((data) => {
      setStudents(data);
      if (!initialAdmNo && data.length > 0) {
        setSelectedAdmissionNo(data[0].admissionNumber);
      }
    });
    examService.getExaminations().then((exams) => {
      setExaminations(exams);
    });
  }, [initialAdmNo]);

  useEffect(() => {
    if (!selectedAdmissionNo) return;

    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then((data) => {
        setStudentData(data.student);
        setActiveSession(data.student.academicSession || "2026-27");

        // Filter marks for selected exam
        const examMarks = (data.marks || []).filter(
          (m) => m.examinationName === selectedExam
        );

        if (examMarks.length > 0) {
          setMarksRows(
            examMarks.map((m) => ({
              subject: m.subject,
              maxMarks: m.maxMarks || 100,
              passMarks: m.passMarks || 33,
              marksObtained: m.marksObtained || 0,
              isAbsent: Boolean(m.isAbsent),
              grade: m.grade || "A1",
              remarks: m.remarks || "",
            }))
          );
          setTeacherRemarks(examMarks[0]?.remarks || "");
        } else {
          // Initialize standard subjects for class
          const defaultSubjects = [
            "English",
            "Mathematics",
            "General Science",
            "Social Studies",
            "Hindi",
            "Computer Science",
          ];
          setMarksRows(
            defaultSubjects.map((sub) => ({
              subject: sub,
              maxMarks: 100,
              passMarks: 33,
              marksObtained: 85,
              isAbsent: false,
              grade: "A2",
              remarks: "Good",
            }))
          );
        }
      })
      .catch(console.error);
  }, [selectedAdmissionNo, selectedExam]);

  const handleMarksChange = (idx, field, value) => {
    const updated = [...marksRows];
    updated[idx][field] = value;

    if (field === "marksObtained" || field === "maxMarks" || field === "isAbsent") {
      const max = Number(updated[idx].maxMarks) || 100;
      const obt = updated[idx].isAbsent ? 0 : Number(updated[idx].marksObtained) || 0;
      const pct = max > 0 ? (obt / max) * 100 : 0;
      const { grade } = calculateGrade(pct);
      updated[idx].grade = updated[idx].isAbsent ? "AB" : grade;
    }

    setMarksRows(updated);
  };

  const handleSaveMarks = async () => {
    if (!selectedAdmissionNo || !studentData) return;
    setIsSaving(true);
    setNotification("");
    try {
      await examService.saveMarksBatch({
        admissionNumber: selectedAdmissionNo,
        academicSession: activeSession,
        examinationName: selectedExam,
        className: studentData.className,
        section: studentData.section,
        subjects: marksRows,
        teacherRemarks,
      });
      setNotification("Marks saved successfully!");
      setTimeout(() => {
        setNotification("");
        setActiveTab("preview");
      }, 1000);
    } catch (err) {
      alert("Failed to save marks: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section}`,
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Student Marksheets & Grade Reports"
        subtitle="Record examination marks, automatically calculate percentages and grades, and print official report cards"
        breadcrumbs={[
          { label: "Academics" },
          { label: "Marksheets" },
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
                  `Marksheet_${selectedAdmissionNo}_${selectedExam.replace(/\s+/g, "_")}.pdf`
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
              Print Marksheet
            </Button>
          </div>
        }
      />

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 no-print flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto flex-1">
          <div className="w-full sm:w-72">
            <SearchableSelect
              label="Select Student"
              value={selectedAdmissionNo}
              onChange={setSelectedAdmissionNo}
              options={studentOptions}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              label="Examination"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              options={examinations.map((e) => e.name)}
            />
          </div>
        </div>

        {/* View / Edit Mode Switcher */}
        <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Marksheet Preview
          </button>
          <button
            onClick={() => setActiveTab("entry")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "entry"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Marks</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-medium no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: MARKS ENTRY FORM */}
      {activeTab === "entry" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8 no-print space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Subject-Wise Marks Entry: {studentData?.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Exam: {selectedExam} | Class: {studentData?.className}-{studentData?.section} | Session: {activeSession}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 w-1/4">Subject</th>
                  <th className="px-4 py-3 text-center w-24">Max Marks</th>
                  <th className="px-4 py-3 text-center w-24">Pass Marks</th>
                  <th className="px-4 py-3 text-center w-32">Marks Obtained</th>
                  <th className="px-4 py-3 text-center w-24">Absent?</th>
                  <th className="px-4 py-3 text-center w-20">Grade</th>
                  <th className="px-4 py-3">Subject Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {marksRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      <input
                        type="text"
                        value={row.subject}
                        onChange={(e) => handleMarksChange(idx, "subject", e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        value={row.maxMarks}
                        onChange={(e) =>
                          handleMarksChange(idx, "maxMarks", Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        value={row.passMarks}
                        onChange={(e) =>
                          handleMarksChange(idx, "passMarks", Number(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-slate-200 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        disabled={row.isAbsent}
                        value={row.isAbsent ? 0 : row.marksObtained}
                        onChange={(e) =>
                          handleMarksChange(idx, "marksObtained", Number(e.target.value))
                        }
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-center font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={row.isAbsent}
                        onChange={(e) =>
                          handleMarksChange(idx, "isAbsent", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.remarks}
                        placeholder="e.g. Excellent work"
                        onChange={(e) => handleMarksChange(idx, "remarks", e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <Input
              label="Overall Teacher's Remarks"
              placeholder="e.g. Shows steady academic dedication and excellent conduct throughout the year."
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setActiveTab("preview")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Save}
              isLoading={isSaving}
              onClick={handleSaveMarks}
            >
              Save Marks & Update Marksheet
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: MARKSHEET PRINT PREVIEW */}
      {activeTab === "preview" && (
        <div className="py-4 overflow-x-auto">
          <MarksheetTemplate
            student={studentData}
            examinationName={selectedExam}
            academicSession={activeSession}
            marks={marksRows}
            teacherRemarks={teacherRemarks}
          />
        </div>
      )}
    </AppLayout>
  );
}

export default function MarksheetsPage() {
  return (
    <Suspense fallback={<div>Loading marksheets...</div>}>
      <MarksheetsContent />
    </Suspense>
  );
}
