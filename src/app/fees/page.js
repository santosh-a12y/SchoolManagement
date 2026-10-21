"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import feeService from "@/services/feeService";
import { formatCurrency } from "@/lib/formatters";
import { SCHOOL_CLASSES, ACADEMIC_SESSIONS, FEE_CATEGORIES } from "@/lib/constants";
import { BadgeDollarSign, Plus, Receipt, AlertCircle } from "lucide-react";

export default function FeesOverviewPage() {
  const [structures, setStructures] = useState([]);
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [selectedSession, setSelectedSession] = useState("2026-27");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newFee, setNewFee] = useState({
    category: "Tuition Fee",
    amount: 25000,
    frequency: "Annual",
  });

  const loadStructures = async () => {
    setIsLoading(true);
    try {
      const data = await feeService.getFeeStructures(selectedSession, selectedClass);
      setStructures(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStructures();
  }, [selectedSession, selectedClass]);

  const handleSaveFee = async (e) => {
    e.preventDefault();
    if (!newFee.amount) return;

    try {
      await feeService.saveFeeStructure({
        ...newFee,
        academicSession: selectedSession,
        className: selectedClass,
        amount: Number(newFee.amount),
      });
      setIsModalOpen(false);
      await loadStructures();
    } catch (err) {
      alert("Failed to save fee structure: " + err.message);
    }
  };

  const totalClassFee = structures.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const columns = [
    {
      key: "category",
      label: "Fee Category",
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      key: "amount",
      label: "Standard Amount",
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-900 font-mono text-sm">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "frequency",
      label: "Frequency",
      render: (val) => <Badge variant="blue">{val || "Annual"}</Badge>,
    },
    {
      key: "className",
      label: "Applicable Class",
      render: (val) => <span className="text-xs text-slate-700">{val}</span>,
    },
    {
      key: "academicSession",
      label: "Session",
      render: (val) => <span className="text-xs text-slate-500 font-mono">{val}</span>,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Fee Structures & Categories"
        subtitle="Configure standard school fees by academic session and class level"
        breadcrumbs={[
          { label: "Fees", href: "/fees" },
          { label: "Fee Structures" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/fees/pending">
              <Button variant="outline" size="sm" icon={AlertCircle}>
                Pending Fees Report
              </Button>
            </Link>
            <Link href="/fees/payments">
              <Button variant="outline" size="sm" icon={Receipt}>
                Record Payment
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Add Fee Item
            </Button>
          </div>
        }
      />

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-56">
            <Select
              label="Academic Session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              options={ACADEMIC_SESSIONS.map((s) => ({ value: s.id, label: s.name }))}
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

        {/* Total Class Annual Fee Summary */}
        <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg flex items-center gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase text-blue-700">
              Total Annual Fee ({selectedClass})
            </div>
            <div className="text-lg font-bold text-blue-900 font-mono">
              {formatCurrency(totalClassFee)}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={structures}
        searchPlaceholder="Search fee category..."
        emptyTitle={`No fee structures set for ${selectedClass} (${selectedSession})`}
        emptyDescription="Click 'Add Fee Item' to set up tuition, admission, or transport fees."
      />

      {/* Add Fee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Fee Structure — ${selectedClass}`}
        subtitle={`Academic Session: ${selectedSession}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveFee}>
              Save Fee Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveFee} className="space-y-4">
          <Select
            label="Fee Category"
            required
            value={newFee.category}
            onChange={(e) => setNewFee({ ...newFee, category: e.target.value })}
            options={FEE_CATEGORIES.map((f) => f.name)}
          />
          <Input
            label="Amount (INR)"
            type="number"
            required
            placeholder="e.g. 15000"
            value={newFee.amount}
            onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
          />
          <Select
            label="Frequency"
            value={newFee.frequency}
            onChange={(e) => setNewFee({ ...newFee, frequency: e.target.value })}
            options={["One-time", "Monthly", "Quarterly", "Annual", "Per Exam"]}
          />
        </form>
      </Modal>
    </AppLayout>
  );
}
