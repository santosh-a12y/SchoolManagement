"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import academicService from "@/services/academicService";
import { formatDate } from "@/lib/formatters";
import { Calendar, Plus, CheckCircle2 } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionId, setNewSessionId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSetActive = async (sessionId) => {
    try {
      await academicService.setActiveSession(sessionId);
      await loadSessions();
    } catch (err) {
      alert("Failed to change active session: " + err.message);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionId.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await academicService.createSession({
        id: newSessionId.trim(),
        name: newSessionId.trim(),
        startDate,
        endDate,
        isActive: false,
      });
      setIsModalOpen(false);
      setNewSessionId("");
      await loadSessions();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Academic Session",
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (val) => formatDate(val),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (val) => formatDate(val),
    },
    {
      key: "isActive",
      label: "Status",
      render: (val) =>
        val ? (
          <Badge variant="emerald">Active Session</Badge>
        ) : (
          <Badge variant="slate">Archived / Inactive</Badge>
        ),
    },
    {
      key: "actions",
      label: "Action",
      className: "text-right",
      render: (_, row) =>
        row.isActive ? (
          <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
            <CheckCircle2 className="w-4 h-4" /> Current Active
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetActive(row.id)}
          >
            Set as Active
          </Button>
        ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Academic Sessions"
        subtitle="Manage school academic calendar years, session dates, and switch active operating period"
        breadcrumbs={[
          { label: "Academics" },
          { label: "Sessions" },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Create New Session
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sessions}
        searchPlaceholder="Search academic sessions..."
      />

      {/* New Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Session"
        subtitle="Define a new academic cycle (e.g. 2027-28)"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreateSession}
            >
              Save Session
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg">
              {errorMsg}
            </div>
          )}
          <Input
            label="Session Name"
            required
            placeholder="e.g. 2027-28"
            value={newSessionId}
            onChange={(e) => setNewSessionId(e.target.value)}
            helperText="Standard format: YYYY-YY"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Session Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Session End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
