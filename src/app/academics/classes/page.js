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
import academicService from "@/services/academicService";
import { School, Plus, Trash2, AlertTriangle, Loader2, SlidersHorizontal, X } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newLevel, setNewLevel] = useState("Primary");
  const [newSections, setNewSections] = useState("A, B");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete modal state
  const [deleteTargetClass, setDeleteTargetClass] = useState(null);
  const [classDependencies, setClassDependencies] = useState(null);
  const [isCheckingDeps, setIsCheckingDeps] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Manage sections modal state
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [managingClass, setManagingClass] = useState(null);
  const [draftSections, setDraftSections] = useState([]);
  const [newSectionInput, setNewSectionInput] = useState("");
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [sectionActionMsg, setSectionActionMsg] = useState("");
  const [isCheckingSectionDep, setIsCheckingSectionDep] = useState(false);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const sectionsArray = newSections
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      await academicService.createClass({
        name: newClassName.trim(),
        level: newLevel,
        sections: sectionsArray.length > 0 ? sectionsArray : ["A"],
      });
      setIsModalOpen(false);
      setNewClassName("");
      await loadClasses();
    } catch (err) {
      const found = classes.find(
        (c) => c.name.toLowerCase() === newClassName.trim().toLowerCase()
      );
      if (err.message?.includes("already exists") && found) {
        setErrorMsg(
          <span>
            Class <strong>{newClassName}</strong> already exists.{" "}
            <button
              type="button"
              className="underline font-bold text-blue-600 hover:text-blue-800 cursor-pointer ml-1"
              onClick={() => {
                setIsModalOpen(false);
                handleOpenSectionsModal(found);
              }}
            >
              Click here to add or remove its sections.
            </button>
          </span>
        );
      } else {
        setErrorMsg(err.message || "Failed to create class");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSectionsModal = (classRow) => {
    setManagingClass(classRow);
    const initialSections = Array.isArray(classRow.sections)
      ? [...classRow.sections]
      : String(classRow.sections || "A")
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
    setDraftSections(initialSections.length > 0 ? initialSections : ["A"]);
    setNewSectionInput("");
    setSectionActionMsg("");
    setIsSectionsModalOpen(true);
  };

  const handleAddSection = (sectionToAdd) => {
    const sec = (sectionToAdd || newSectionInput).trim().toUpperCase();
    if (!sec) return;
    if (draftSections.includes(sec)) {
      setSectionActionMsg(`Section "${sec}" is already present.`);
      return;
    }
    setDraftSections([...draftSections, sec]);
    setNewSectionInput("");
    setSectionActionMsg("");
  };

  const handleRemoveSection = async (sec) => {
    if (draftSections.length <= 1) {
      alert("A class must have at least one section.");
      return;
    }

    setIsCheckingSectionDep(true);
    try {
      const dep = await academicService.checkSectionDependencies(managingClass.name, sec);
      if (dep.hasDependencies) {
        const details = [];
        if (dep.studentsCount > 0) details.push(`${dep.studentsCount} enrolled student(s)`);
        if (dep.marksCount > 0) details.push(`${dep.marksCount} mark record(s)`);
        const confirmMsg = `⚠️ Section ${sec} of ${managingClass.name} has active records (${details.join(", ")})!\n\nRemoving this section will unassign it from these records.\n\nAre you sure you want to remove Section ${sec}?`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      }
      setDraftSections(draftSections.filter((s) => s !== sec));
      setSectionActionMsg("");
    } catch (err) {
      console.error(err);
      if (window.confirm(`Remove Section ${sec} from ${managingClass.name}?`)) {
        setDraftSections(draftSections.filter((s) => s !== sec));
      }
    } finally {
      setIsCheckingSectionDep(false);
    }
  };

  const handleSaveSections = async () => {
    if (!managingClass) return;
    if (draftSections.length === 0) {
      alert("A class must have at least one section.");
      return;
    }
    setIsSavingSections(true);
    setSectionActionMsg("");
    try {
      await academicService.updateClassSections(managingClass.name, draftSections);
      setIsSectionsModalOpen(false);
      setManagingClass(null);
      await loadClasses();
    } catch (err) {
      setSectionActionMsg(err.message || "Failed to update sections");
    } finally {
      setIsSavingSections(false);
    }
  };

  const handleInitiateDeleteClass = async (classRow) => {
    setDeleteTargetClass(classRow);
    setIsCheckingDeps(true);
    setIsDeleteModalOpen(true);
    setClassDependencies(null);
    try {
      const deps = await academicService.checkClassDependencies(classRow.name);
      setClassDependencies(deps);
    } catch (err) {
      console.error("Failed to check dependencies:", err);
      setClassDependencies({ hasDependencies: false, studentsCount: 0, schedulesCount: 0, marksCount: 0 });
    } finally {
      setIsCheckingDeps(false);
    }
  };

  const handleConfirmDeleteClass = async () => {
    if (!deleteTargetClass) return;
    setIsDeleting(true);
    try {
      await academicService.deleteClass(deleteTargetClass.name, classDependencies?.hasDependencies);
      setIsDeleteModalOpen(false);
      setDeleteTargetClass(null);
      setClassDependencies(null);
      await loadClasses();
    } catch (err) {
      alert("Failed to delete class: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const matchedExistingClass = newClassName.trim()
    ? classes.find(
        (c) => c.name.toLowerCase() === newClassName.trim().toLowerCase()
      )
    : null;

  const columns = [
    {
      key: "name",
      label: "Class Name",
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      key: "level",
      label: "Academic Level",
      sortable: true,
      render: (val) => <Badge variant="blue">{val}</Badge>,
    },
    {
      key: "sections",
      label: "Assigned Sections",
      render: (val, row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.isArray(val) ? (
            val.map((sec) => (
              <span
                key={sec}
                className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                Section {sec}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">{String(val)}</span>
          )}
          <button
            type="button"
            onClick={() => handleOpenSectionsModal(row)}
            className="px-2 py-0.5 rounded text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1 ml-1"
            title="Add or remove sections"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenSectionsModal(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title={`Manage sections for ${row.name}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInitiateDeleteClass(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title={`Delete ${row.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Classes & Sections"
        subtitle="Configure classes, grade levels, and sections for student assignments"
        breadcrumbs={[
          { label: "Academics" },
          { label: "Classes & Sections" },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setErrorMsg("");
              setIsModalOpen(true);
            }}
          >
            Add New Class
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={classes}
        searchPlaceholder="Search classes or levels..."
      />

      {/* Add Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New School Class"
        subtitle="Define class name, academic division, and sections"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateClass}
            >
              Save Class
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">
              {errorMsg}
            </div>
          )}

          {matchedExistingClass && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center justify-between gap-3">
              <div>
                <strong>{matchedExistingClass.name}</strong> is already added (Sections:{" "}
                {Array.isArray(matchedExistingClass.sections)
                  ? matchedExistingClass.sections.join(", ")
                  : matchedExistingClass.sections}
                ).
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  handleOpenSectionsModal(matchedExistingClass);
                }}
              >
                Manage Sections
              </Button>
            </div>
          )}

          <Input
            label="Class Name"
            required
            placeholder="e.g. Class 11 (Commerce)"
            value={newClassName}
            onChange={(e) => {
              setNewClassName(e.target.value);
              setErrorMsg("");
            }}
          />
          <Select
            label="Academic Level"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            options={["Kindergarten", "Primary", "Middle", "Secondary", "Senior Secondary"]}
          />
          <Input
            label="Sections (Comma Separated)"
            required
            placeholder="A, B, C"
            value={newSections}
            onChange={(e) => setNewSections(e.target.value)}
            helperText="Enter letters separated by commas (e.g. A, B)"
          />
        </form>
      </Modal>

      {/* Manage Sections Modal */}
      <Modal
        isOpen={isSectionsModalOpen}
        onClose={() => !isSavingSections && setIsSectionsModalOpen(false)}
        title={`Manage Sections — ${managingClass?.name || ""}`}
        subtitle={`Add or remove sections for ${managingClass?.name || "this class"}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isSavingSections}
              onClick={() => setIsSectionsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSavingSections}
              onClick={handleSaveSections}
            >
              Save Sections
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {sectionActionMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">
              {sectionActionMsg}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Current Sections ({draftSections.length})
              </label>
              {isCheckingSectionDep && (
                <span className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking student records...
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[52px]">
              {draftSections.map((sec) => (
                <span
                  key={sec}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-300 shadow-xs"
                >
                  <span>Section {sec}</span>
                  <button
                    type="button"
                    disabled={isCheckingSectionDep || isSavingSections}
                    onClick={() => handleRemoveSection(sec)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title={`Remove Section ${sec}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Click <span className="font-semibold text-red-500">×</span> on any section badge to remove it. You will be prompted if any students are enrolled in that section.
            </p>
          </div>

          {/* Add New Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Add New Section
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g. C, D, or Rose"
                value={newSectionInput}
                onChange={(e) => setNewSectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
              />
              <Button
                size="md"
                variant="primary"
                icon={Plus}
                onClick={() => handleAddSection()}
                disabled={!newSectionInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Quick add:</span>
              {["A", "B", "C", "D", "E"]
                .filter((s) => !draftSections.includes(s))
                .slice(0, 4)
                .map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddSection(suggested)}
                    className="px-2 py-0.5 text-xs font-semibold rounded bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    + Section {suggested}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Class Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title={classDependencies?.hasDependencies ? "Confirm Class Deletion — Active Related Data" : "Delete Class"}
        subtitle={deleteTargetClass ? `Class: ${deleteTargetClass.name}` : ""}
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
              onClick={handleConfirmDeleteClass}
            >
              {classDependencies?.hasDependencies ? "Yes, Confirm & Delete Class" : "Delete Class"}
            </Button>
          </>
        }
      >
        {isCheckingDeps ? (
          <div className="flex items-center justify-center py-6 text-slate-500 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Checking class records in Google Sheet...</span>
          </div>
        ) : classDependencies?.hasDependencies ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>This Class has active student / examination records!</span>
              </div>
              <p>
                Deleting <strong>{deleteTargetClass?.name}</strong> may affect the following existing data:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-semibold text-amber-950">
                {classDependencies.studentsCount > 0 && (
                  <li>{classDependencies.studentsCount} enrolled student(s)</li>
                )}
                {classDependencies.schedulesCount > 0 && (
                  <li>{classDependencies.schedulesCount} exam timetable schedule item(s)</li>
                )}
                {classDependencies.marksCount > 0 && (
                  <li>{classDependencies.marksCount} student mark entry / entries</li>
                )}
              </ul>
            </div>
            <p className="text-xs text-slate-600">
              Please ensure enrolled students are reassigned to another class if needed. Are you sure you want to proceed with deleting this class from Google Sheets?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete class <strong>{deleteTargetClass?.name}</strong>?
            </p>
            <p className="text-xs text-slate-500">
              This class has no enrolled students or exam records. It will be removed cleanly from your Google Sheet.
            </p>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
