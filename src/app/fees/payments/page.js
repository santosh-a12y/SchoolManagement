"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import studentService from "@/services/studentService";
import feeService from "@/services/feeService";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PAYMENT_MODES, FEE_CATEGORIES } from "@/lib/constants";
import { Receipt, Save, CheckCircle2, AlertCircle, ArrowRight, Printer } from "lucide-react";

function FeePaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [studentProfile, setStudentProfile] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successReceiptNo, setSuccessReceiptNo] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    feeCategory: "Tuition Fee",
    amountPaid: "",
    paymentMode: "UPI",
    paymentDate: new Date().toISOString().split("T")[0],
    transactionRef: "",
    receivedBy: "Accounts Staff",
    remarks: "",
  });

  const loadRecentPayments = async () => {
    try {
      const allPayments = await feeService.getPayments();
      setPaymentsList(allPayments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    studentService.getStudents().then((data) => {
      setStudents(data);
      if (!initialAdmNo && data.length > 0) {
        setSelectedAdmissionNo(data[0].admissionNumber);
      }
    });
    loadRecentPayments();
  }, [initialAdmNo]);

  useEffect(() => {
    if (!selectedAdmissionNo) {
      setStudentProfile(null);
      return;
    }

    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then((data) => {
        setStudentProfile(data);
        if (data.feeSummary?.outstandingBalance > 0) {
          setPaymentForm((prev) => ({
            ...prev,
            amountPaid: String(data.feeSummary.outstandingBalance),
          }));
        }
      })
      .catch(console.error);
  }, [selectedAdmissionNo]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedAdmissionNo || !studentProfile?.student) {
      setFormError("Please select a valid student first.");
      return;
    }

    const amount = Number(paymentForm.amountPaid);
    if (!amount || amount <= 0) {
      setFormError("Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const student = studentProfile.student;
      const res = await feeService.recordPayment({
        admissionNumber: student.admissionNumber,
        studentName: student.studentName,
        academicSession: student.academicSession || "2026-27",
        className: student.className,
        feeCategory: paymentForm.feeCategory,
        amountPaid: amount,
        paymentMode: paymentForm.paymentMode,
        paymentDate: paymentForm.paymentDate,
        transactionRef: paymentForm.transactionRef,
        receivedBy: paymentForm.receivedBy,
        remarks: paymentForm.remarks,
      });

      setSuccessReceiptNo(res.receiptNumber);
      await loadRecentPayments();
      // Reload student fee summary
      studentService
        .getStudentByAdmissionNumber(selectedAdmissionNo)
        .then(setStudentProfile);
    } catch (err) {
      setFormError(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: s.admissionNumber,
    label: s.studentName,
    subtitle: `${s.className}-${s.section} (Roll: ${s.rollNumber || "—"})`,
  }));

  const feeSummary = studentProfile?.feeSummary;

  const paymentColumns = [
    {
      key: "receiptNumber",
      label: "Receipt No",
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-blue-600">{val}</span>
      ),
    },
    {
      key: "studentName",
      label: "Student",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-900">{val}</div>
          <div className="text-xs text-slate-500 font-mono">{row.admissionNumber}</div>
        </div>
      ),
    },
    {
      key: "feeCategory",
      label: "Category",
      render: (val) => <span className="font-medium text-slate-800">{val}</span>,
    },
    {
      key: "paymentDate",
      label: "Date",
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: "amountPaid",
      label: "Amount Paid",
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "paymentMode",
      label: "Mode",
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 font-medium">
          {val}
        </span>
      ),
    },
    {
      key: "action",
      label: "Print",
      className: "text-right",
      render: (_, row) => (
        <Link
          href={`/fees/receipts?receiptNumber=${row.receiptNumber}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Receipt</span>
        </Link>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Record Fee Payment"
        subtitle="Process student fees, generate official receipts, and update outstanding balances"
        breadcrumbs={[
          { label: "Fees", href: "/fees" },
          { label: "Record Payment" },
        ]}
      />

      {successReceiptNo && (
        <div className="p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Payment Recorded Successfully!</h4>
              <p className="text-xs text-emerald-700">
                Receipt Number: <strong>{successReceiptNo}</strong> has been generated and saved.
              </p>
            </div>
          </div>
          <Link href={`/fees/receipts?receiptNumber=${successReceiptNo}`}>
            <Button variant="success" size="sm" icon={Printer}>
              Print Official Receipt
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Payment Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Payment Entry Form</h3>
            <span className="text-xs text-slate-500">All payments are permanently audited</span>
          </div>

          {formError && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <SearchableSelect
              label="Select Student (Admission No or Name)"
              required
              value={selectedAdmissionNo}
              onChange={setSelectedAdmissionNo}
              options={studentOptions}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Fee Category"
                required
                value={paymentForm.feeCategory}
                onChange={(e) => setPaymentForm({ ...paymentForm, feeCategory: e.target.value })}
                options={FEE_CATEGORIES.map((f) => f.name)}
              />

              <Input
                label="Amount Paid (INR)"
                type="number"
                required
                placeholder="e.g. 12000"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Payment Mode"
                required
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                options={PAYMENT_MODES.map((m) => m.value)}
              />

              <Input
                label="Payment Date"
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />

              <Input
                label="Transaction / Cheque Ref"
                placeholder="e.g. UPI-99201"
                value={paymentForm.transactionRef}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Received By (Staff Name)"
                required
                value={paymentForm.receivedBy}
                onChange={(e) => setPaymentForm({ ...paymentForm, receivedBy: e.target.value })}
              />

              <Input
                label="Remarks / Notes"
                placeholder="e.g. Term 1 partial fee"
                value={paymentForm.remarks}
                onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                isLoading={isSubmitting}
              >
                Record Payment & Generate Receipt
              </Button>
            </div>
          </form>
        </div>

        {/* Right Col: Student Fee Balance Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Student Fee Account
          </h3>

          {studentProfile?.student ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Selected Student:</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {studentProfile.student.studentName}
                </div>
                <div className="text-slate-500 font-mono">
                  {studentProfile.student.admissionNumber} | Class {studentProfile.student.className}-{studentProfile.student.section}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicable Fees:</span>
                  <strong className="text-slate-900 font-mono">
                    {formatCurrency(feeSummary?.totalApplicable || 0)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <strong className="text-emerald-700 font-mono">
                    {formatCurrency(feeSummary?.totalPaid || 0)}
                  </strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Pending Balance:</span>
                  <strong className="text-amber-700 font-mono font-bold">
                    {formatCurrency(feeSummary?.outstandingBalance || 0)}
                  </strong>
                </div>
              </div>

              <div className="text-center pt-2">
                <Badge variant={feeSummary?.outstandingBalance === 0 ? "emerald" : "amber"}>
                  {feeSummary?.outstandingBalance === 0 ? "Account Fully Paid" : "Balance Outstanding"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Select a student to inspect applicable fee structures and pending balance.
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments Log */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Recent Payment Transactions</h3>
        <DataTable
          columns={paymentColumns}
          data={paymentsList}
          searchPlaceholder="Search receipt number, student name, mode..."
        />
      </div>
    </AppLayout>
  );
}

export default function FeePaymentsPage() {
  return (
    <Suspense fallback={<div>Loading payments...</div>}>
      <FeePaymentsContent />
    </Suspense>
  );
}
