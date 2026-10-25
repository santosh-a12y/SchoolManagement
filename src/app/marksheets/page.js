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
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { calculateGrade } from "@/lib/formatters";
import { getNextSchoolClass } from "@/lib/constants";
import { Printer, Download, Save, GraduationCap, Edit, AlertCircle, CheckCircle2, Award } from "lucide-react";

function MarksheetsContent() {
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";
  const { settings: school } = useSchoolSettings();

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
            examMarks.map((m) => {
              const maxMarks = Number(m.maxMarks) || 100;
              const passMarks = Number(m.passMarks) || 33;
              const marksObtained = Number(m.marksObtained) || 0;
              const graceMarks = Number(m.graceMarks) || 0;
              const isGrace = Boolean(m.isGrace === "TRUE" || m.isGrace === true || graceMarks > 0);
              return {
                subject: m.subject,
                maxMarks,
                passMarks,
                marksObtained,
                graceMarks,
                isGrace,
                isAbsent: Boolean(m.isAbsent),
                grade: m.grade || "A1",
                remarks: m.remarks || "",
              };
            })
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
              graceMarks: 0,
              isGrace: false,
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

    if (field === "isGrace") {
      if (value) {
        // Teacher toggled grace mark on: auto-calculate grace marks needed to reach passMarks
        const pass = Number(updated[idx].passMarks) || 33;
        const obt = Number(updated[idx].marksObtained) || 0;
        const needed = Math.max(0, pass - obt);
        updated[idx].graceMarks = needed;
      } else {
        updated[idx].graceMarks = 0;
      }
    }

    if (field === "graceMarks") {
      const g = Math.max(0, Number(value) || 0);
      updated[idx].graceMarks = g;
      if (g > 0) {
        updated[idx].isGrace = true;
      }
    }

    if (field === "marksObtained" || field === "passMarks") {
      const pass = Number(updated[idx].passMarks) || 33;
      const obt = Number(updated[idx].marksObtained) || 0;
      if (obt >= pass) {
        updated[idx].isGrace = false;
        updated[idx].graceMarks = 0;
      } else if (updated[idx].isGrace) {
        updated[idx].graceMarks = Math.max(0, pass - obt);
      }
    }

    // Recalculate effective grade
    const max = Number(updated[idx].maxMarks) || 100;
    const isAbsent = Boolean(updated[idx].isAbsent);
    const obt = isAbsent ? 0 : Number(updated[idx].marksObtained) || 0;
    const grace = updated[idx].isGrace ? Number(updated[idx].graceMarks) || 0 : 0;
    const effective = obt + grace;
    const pct = max > 0 ? (effective / max) * 100 : 0;
    const { grade } = calculateGrade(pct);
    updated[idx].grade = isAbsent ? "AB" : grade;

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
        subjects: marksRows.map((r) => ({
          subject: r.subject,
          maxMarks: Number(r.maxMarks) || 100,
          passMarks: Number(r.passMarks) || 33,
          marksObtained: r.isAbsent ? 0 : Number(r.marksObtained) || 0,
          graceMarks: r.isGrace ? Number(r.graceMarks) || 0 : 0,
          isGrace: Boolean(r.isGrace),
          isAbsent: Boolean(r.isAbsent),
          grade: r.grade,
          remarks: r.remarks,
        })),
        teacherRemarks,
      });
      setNotification("Marks & promotion status saved successfully!");
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
      {activeTab === "entry" && (() => {
        const isAnnualExam =
          selectedExam?.toLowerCase().includes("annual") ||
          selectedExam?.toLowerCase().includes("final");
        const nextClass = getNextSchoolClass(studentData?.className);

        const evaluatedRows = marksRows.map((r) => {
          const pass = Number(r.passMarks) || 33;
          const obt = r.isAbsent ? 0 : Number(r.marksObtained) || 0;
          const isGrace = Boolean(r.isGrace);
          const grace = isGrace ? Number(r.graceMarks) || 0 : 0;
          const effective = obt + grace;
          const isBelowPass = !r.isAbsent && obt < pass;
          const isPassed = !r.isAbsent && effective >= pass;
          const isGracePassed = isBelowPass && isPassed && grace > 0;
          return {
            ...r,
            pass,
            obt,
            grace,
            isGrace,
            effective,
            isBelowPass,
            isPassed,
            isGracePassed,
          };
        });

        const hasFailedSubject = evaluatedRows.some((r) => !r.isPassed);
        const hasGraceApplied = evaluatedRows.some((r) => r.isGracePassed);
        const isStudentPassed = marksRows.length > 0 && !hasFailedSubject;

        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8 no-print space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Subject-Wise Marks Entry: {studentData?.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  Exam: {selectedExam} | Class: {studentData?.className}-{studentData?.section} | Session: {activeSession}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Result Status:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    isStudentPassed
                      ? hasGraceApplied
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-rose-100 text-rose-900 border-rose-300"
                  }`}
                >
                  {isStudentPassed
                    ? hasGraceApplied
                      ? "Passed with Grace"
                      : "Passed"
                    : "Failed"}
                </span>
              </div>
            </div>

            {/* Live Promotion Status Banner */}
            {isAnnualExam ? (
              isStudentPassed ? (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hasGraceApplied
                      ? "bg-amber-50/80 border-amber-200 text-amber-950"
                      : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        hasGraceApplied
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">Annual Promotion Status:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                            hasGraceApplied
                              ? "bg-amber-200/80 text-amber-950"
                              : "bg-emerald-200/80 text-emerald-950"
                          }`}
                        >
                          {nextClass ? `PROMOTED TO ${nextClass.toUpperCase()}` : "COURSE COMPLETED"}
                        </span>
                        {hasGraceApplied && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            Passed with Grace Marks
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        All subjects meet passing criteria. In the final marksheet, the student will be certified as{" "}
                        <strong className="text-slate-900">
                          {nextClass ? `Promoted to ${nextClass}` : "Graduated"}
                        </strong>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">Annual Promotion Status:</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-rose-200 text-rose-950">
                          FAILED TO PROMOTE (DETAINED IN {(studentData?.className || "CURRENT CLASS").toUpperCase()})
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 mt-1">
                        Marks obtained is less than pass marks in one or more subjects. To promote the student, adjust the marks or check the{" "}
                        <strong>Apply Grace</strong> checkbox to award grace marks. Otherwise, the student will remain detained in {studentData?.className}.
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {/* Marks Entry Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-3 w-1/4">Subject</th>
                    <th className="px-3 py-3 text-center w-20">Max Marks</th>
                    <th className="px-3 py-3 text-center w-20">Pass Marks</th>
                    <th className="px-3 py-3 text-center w-24">Marks Obtained</th>
                    <th className="px-3 py-3 text-center w-16">Absent?</th>
                    <th className="px-3 py-3 text-center w-28">Status</th>
                    <th className="px-3 py-3 text-center w-36">Grace Marks</th>
                    <th className="px-3 py-3 text-center w-16">Grade</th>
                    <th className="px-3 py-3">Subject Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {marksRows.map((row, idx) => {
                    const pass = Number(row.passMarks) || 33;
                    const obt = row.isAbsent ? 0 : Number(row.marksObtained) || 0;
                    const isGrace = Boolean(row.isGrace);
                    const grace = isGrace ? Number(row.graceMarks) || 0 : 0;
                    const effective = obt + grace;
                    const isBelowPass = !row.isAbsent && obt < pass;
                    const isPassed = !row.isAbsent && effective >= pass;
                    const isGracePassed = isBelowPass && isPassed && grace > 0;

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 ${
                          isBelowPass && !isPassed
                            ? "bg-rose-50/40"
                            : isGracePassed
                            ? "bg-amber-50/40"
                            : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={row.subject}
                            onChange={(e) => handleMarksChange(idx, "subject", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            value={row.maxMarks}
                            onChange={(e) =>
                              handleMarksChange(idx, "maxMarks", Number(e.target.value))
                            }
                            className="w-16 px-1.5 py-1 border border-slate-200 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            value={row.passMarks}
                            onChange={(e) =>
                              handleMarksChange(idx, "passMarks", Number(e.target.value))
                            }
                            className="w-16 px-1.5 py-1 border border-slate-200 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            disabled={row.isAbsent}
                            value={row.isAbsent ? 0 : row.marksObtained}
                            onChange={(e) =>
                              handleMarksChange(idx, "marksObtained", Number(e.target.value))
                            }
                            className={`w-20 px-1.5 py-1 border rounded text-center font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 ${
                              isBelowPass && !isGrace
                                ? "border-rose-400 text-rose-700 bg-rose-50"
                                : isGracePassed
                                ? "border-amber-400 text-amber-900 bg-amber-50"
                                : "border-slate-200 text-slate-900"
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.isAbsent}
                            onChange={(e) =>
                              handleMarksChange(idx, "isAbsent", e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {row.isAbsent ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                              Absent
                            </span>
                          ) : isGracePassed ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Grace Pass (+{grace})
                            </span>
                          ) : isPassed ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Passed
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                              Failed ({obt}/{pass})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {row.isAbsent ? (
                            <span className="text-slate-400 text-xs italic">—</span>
                          ) : isBelowPass || isGrace ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <label
                                className={`flex items-center gap-1 cursor-pointer text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                                  row.isGrace
                                    ? "bg-amber-100 border-amber-300 text-amber-900"
                                    : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={Boolean(row.isGrace)}
                                  onChange={(e) =>
                                    handleMarksChange(idx, "isGrace", e.target.checked)
                                  }
                                  className="w-3.5 h-3.5 text-amber-600 rounded cursor-pointer accent-amber-600"
                                />
                                <span>Grace</span>
                              </label>
                              {row.isGrace && (
                                <div className="flex items-center gap-0.5">
                                  <span className="text-xs font-bold text-amber-700">+</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={pass}
                                    value={row.graceMarks || 0}
                                    onChange={(e) =>
                                      handleMarksChange(idx, "graceMarks", Number(e.target.value))
                                    }
                                    className="w-12 px-1 py-1 text-center font-mono font-bold text-xs border border-amber-400 rounded bg-white text-amber-950 focus:ring-1 focus:ring-amber-500"
                                    title="Grace marks awarded to pass subject"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-emerald-700 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Passed (No Grace)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isGracePassed
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : !isPassed
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {row.grade}
                            {isGracePassed ? "*" : ""}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={row.remarks}
                            placeholder="e.g. Excellent work"
                            onChange={(e) => handleMarksChange(idx, "remarks", e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Grace Marks & Promotion Guidance Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Grace Marks & Promotion Rules:</span>
              </div>
              <p>
                • If marks obtained is less than pass marks, adjust the status and check <strong>Grace</strong> to award required grace marks.
              </p>
              <p>
                • In the printable marksheet, marks are displayed as <strong>Marks Obtained + Grace Marks*</strong> (e.g. <strong>28 + 5* (= 33)</strong>) and the student is passed and promoted to the next class.
              </p>
              <p>
                • If grace marks are not awarded and any subject remains failed, the student will <strong>fail to promote to the next class</strong> and be detained in the current class for the Annual Examination.
              </p>
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
        );
      })()}

      {/* TAB 2: MARKSHEET PRINT PREVIEW */}
      {activeTab === "preview" && (
        <div className="py-4 overflow-x-auto">
          <MarksheetTemplate
            student={studentData}
            examinationName={selectedExam}
            academicSession={activeSession}
            marks={marksRows}
            teacherRemarks={teacherRemarks}
            school={school}
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
