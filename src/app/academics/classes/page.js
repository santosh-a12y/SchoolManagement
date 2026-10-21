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
import { School, Plus } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newLevel, setNewLevel] = useState("Primary");
  const [newSections, setNewSections] = useState("A, B");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      setErrorMsg(err.message || "Failed to create class");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      render: (val) => (
        <div className="flex items-center gap-1.5">
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
            onClick={() => setIsModalOpen(true)}
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
          <Input
            label="Class Name"
            required
            placeholder="e.g. Class 11 (Commerce)"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
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
    </AppLayout>
  );
}
