"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import examService from "@/services/examService";
import { formatDate } from "@/lib/formatters";
import { SCHOOL_CLASSES, ACADEMIC_SESSIONS } from "@/lib/constants";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { Award, Calendar, Plus, Clock, MapPin, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function ExaminationsPage() {
  const [activeTab, setActiveTab] = useState("schedule"); // 'schedule' | 'exams'
  const [examinations, setExaminations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedExam, setSelectedExam] = useState("Annual Exam");
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Delete modal state
  const [deleteTargetExam, setDeleteTargetExam] = useState(null);
  const [examDependencies, setExamDependencies] = useState(null);
  const [isCheckingDeps, setIsCheckingDeps] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [newExamName, setNewExamName] = useState("");
  const [newTerm, setNewTerm] = useState("Term 1");
  const [newWeightage, setNewWeightage] = useState("20");

  const [scheduleItem, setScheduleItem] = useState({
    subject: "",
    examDate: "",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    roomNumber: "Hall-A",
    maxMarks: 100,
    passMarks: 33,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const exams = await examService.getExaminations();
      setExaminations(exams);
      if (exams.length > 0 && !exams.some((e) => e.name === selectedExam)) {
        setSelectedExam(exams[0].name);
      }
      const sched = await examService.getSchedule(selectedExam, "", selectedClass);
      setSchedules(sched);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExam, selectedClass]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamName.trim()) return;
    try {
      await examService.createExamination({
        name: newExamName.trim(),
        term: newTerm,
        weightage: Number(newWeightage) || 20,
      });
      setIsExamModalOpen(false);
      setNewExamName("");
      await loadData();
    } catch (err) {
      alert("Failed to create examination: " + err.message);
    }
  };

  const handleInitiateDeleteExam = async (exam) => {
    setDeleteTargetExam(exam);
    setIsCheckingDeps(true);
    setIsDeleteModalOpen(true);
    setExamDependencies(null);
    try {
      const deps = await examService.checkExaminationDependencies(exam.name);
      setExamDependencies(deps);
    } catch (err) {
      console.error("Failed to check dependencies:", err);
      setExamDependencies({ hasDependencies: false, schedulesCount: 0, marksCount: 0 });
    } finally {
      setIsCheckingDeps(false);
    }
  };

  const handleConfirmDeleteExam = async () => {
    if (!deleteTargetExam) return;
    setIsDeleting(true);
    try {
      await examService.deleteExamination(deleteTargetExam.name, examDependencies?.hasDependencies);
      setIsDeleteModalOpen(false);
      setDeleteTargetExam(null);
      setExamDependencies(null);
      await loadData();
    } catch (err) {
      alert("Failed to delete examination: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteScheduleItem = async (scheduleId, subjectName) => {
    if (!window.confirm(`Are you sure you want to remove "${subjectName}" from the timetable schedule?`)) {
      return;
    }
    try {
      await examService.deleteScheduleItem(scheduleId);
      await loadData();
    } catch (err) {
      alert("Failed to delete schedule item: " + err.message);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleItem.subject || !scheduleItem.examDate) {
      alert("Subject and Exam Date are required");
      return;
    }
    try {
      await examService.saveScheduleItem({
        ...scheduleItem,
        examinationName: selectedExam,
        academicSession: "2026-27",
        className: selectedClass,
        maxMarks: Number(scheduleItem.maxMarks) || 100,
        passMarks: Number(scheduleItem.passMarks) || 33,
      });
      setIsScheduleModalOpen(false);
      setScheduleItem({
        subject: "",
        examDate: "",
        startTime: "09:00 AM",
        endTime: "12:00 PM",
        roomNumber: "Hall-A",
        maxMarks: 100,
        passMarks: 33,
      });
      await loadData();
    } catch (err) {
      alert("Failed to save schedule: " + err.message);
    }
  };

  const scheduleColumns = [
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      key: "examDate",
      label: "Exam Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "time",
      label: "Timing",
      render: (_, row) => (
        <span className="flex items-center gap-1 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.startTime} - {row.endTime}
        </span>
      ),
    },
    {
      key: "roomNumber",
      label: "Hall / Room",
      render: (val) => (
        <span className="flex items-center gap-1 font-mono text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {val || "Hall-1"}
        </span>
      ),
    },
    {
      key: "maxMarks",
      label: "Max Marks",
      render: (val, row) => (
        <span className="font-semibold text-slate-800">
          {val} (Pass: {row.passMarks})
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleDeleteScheduleItem(row.id, row.subject)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Remove from timetable"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Examinations & Schedules"
        subtitle="Configure examination terms, grading criteria, and official timetable schedules used for Admit Cards"
        breadcrumbs={[
          { label: "Academics" },
          { label: "Examinations" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsExamModalOpen(true)}
            >
              New Exam Term
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Add Schedule Item
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "schedule"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Timetable & Schedules
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "exams"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Examination Terms ({examinations.length})
        </button>
      </div>

      {activeTab === "schedule" ? (
        <div className="space-y-4">
          {/* Schedule Selectors */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
            <div className="w-56">
              <Select
                label="Examination"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                options={examinations.map((e) => e.name)}
              />
            </div>
            <div className="w-56">
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={SCHOOL_CLASSES}
              />
            </div>
          </div>

          <DataTable
            columns={scheduleColumns}
            data={schedules}
            isLoading={isLoading}
            searchPlaceholder="Search schedule subjects, dates..."
            emptyTitle={`No schedule configured for ${selectedExam} (${selectedClass})`}
            emptyDescription="Click 'Add Schedule Item' above to schedule subjects and exam dates."
          />
        </div>
      ) : isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examinations.map((exam) => (
            <div
              key={exam.id || exam.name}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 relative group hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-slate-900 block">{exam.name}</span>
                  <Badge variant="blue" className="mt-1">{exam.term}</Badge>
                </div>
                <button
                  type="button"
                  onClick={() => handleInitiateDeleteExam(exam)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Delete ${exam.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Weightage in final evaluation: <strong>{exam.weightage}%</strong>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Term Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Add Examination Term"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateExam}>
              Save Examination
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <Input
            label="Examination Name"
            required
            placeholder="e.g. Mid-Term Assessment"
            value={newExamName}
            onChange={(e) => setNewExamName(e.target.value)}
          />
          <Select
            label="Term"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            options={["Term 1", "Term 2", "Mid Term", "Final", "Special"]}
          />
          <Input
            label="Weightage (%)"
            type="number"
            value={newWeightage}
            onChange={(e) => setNewWeightage(e.target.value)}
          />
        </form>
      </Modal>

      {/* Delete Exam Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title={examDependencies?.hasDependencies ? "Confirm Deletion — Active Related Records" : "Delete Examination Term"}
        subtitle={deleteTargetExam ? `Examination: ${deleteTargetExam.name}` : ""}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={isCheckingDeps}
              onClick={handleConfirmDeleteExam}
            >
              {examDependencies?.hasDependencies ? "Yes, Delete Term & Associated Records" : "Delete Examination"}
            </Button>
          </>
        }
      >
        {isCheckingDeps ? (
          <div className="flex items-center justify-center py-6 text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Checking associated records in Google Sheet...</span>
          </div>
        ) : examDependencies?.hasDependencies ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>This Examination Term is currently in use!</span>
              </div>
              <p>
                Deleting <strong>{deleteTargetExam?.name}</strong> will permanently remove this term and un-link/remove the following associated data:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-semibold text-amber-950">
                {examDependencies.schedulesCount > 0 && (
                  <li>{examDependencies.schedulesCount} scheduled exam timetable item(s)</li>
                )}
                {examDependencies.marksCount > 0 && (
                  <li>{examDependencies.marksCount} student mark entry / entries</li>
                )}
              </ul>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to proceed? This change will be saved to your Google Sheet and cannot be undone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete examination term <strong>{deleteTargetExam?.name}</strong>?
            </p>
            <p className="text-xs text-slate-500">
              This examination term has no linked timetable schedules or student marks. It will be safely removed from your Google Sheet.
            </p>
          </div>
        )}
      </Modal>

      {/* Add Schedule Item Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Add Schedule Item — ${selectedExam}`}
        subtitle={`Class: ${selectedClass}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSchedule}>
              Save Schedule Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <Input
            label="Subject"
            required
            placeholder="e.g. Mathematics"
            value={scheduleItem.subject}
            onChange={(e) => setScheduleItem({ ...scheduleItem, subject: e.target.value })}
          />
          <Input
            label="Exam Date"
            type="date"
            required
            value={scheduleItem.examDate}
            onChange={(e) => setScheduleItem({ ...scheduleItem, examDate: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              placeholder="09:00 AM"
              value={scheduleItem.startTime}
              onChange={(e) => setScheduleItem({ ...scheduleItem, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              placeholder="12:00 PM"
              value={scheduleItem.endTime}
              onChange={(e) => setScheduleItem({ ...scheduleItem, endTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Room / Hall"
              value={scheduleItem.roomNumber}
              onChange={(e) => setScheduleItem({ ...scheduleItem, roomNumber: e.target.value })}
            />
            <Input
              label="Max Marks"
              type="number"
              value={scheduleItem.maxMarks}
              onChange={(e) => setScheduleItem({ ...scheduleItem, maxMarks: Number(e.target.value) })}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={scheduleItem.passMarks}
              onChange={(e) => setScheduleItem({ ...scheduleItem, passMarks: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
