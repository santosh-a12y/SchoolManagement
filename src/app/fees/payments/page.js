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
import { Receipt, Save, CheckCircle2, AlertCircle, ArrowRight, Printer, Percent, Sparkles, Tag, Gift, BadgePercent } from "lucide-react";

function FeePaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAdmNo = searchParams.get("admissionNumber") || "";

  const [students, setStudents] = useState([]);
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState(initialAdmNo);
  const [studentProfile, setStudentProfile] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);
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

  const [discountForm, setDiscountForm] = useState({
    enabled: false,
    type: "percentage", // 'percentage' | 'flat'
    value: 10, // 10%
    reason: "Early Bird Annual Full Payment (10% Discount)",
  });

  const loadRecentPayments = async () => {
    setIsPaymentsLoading(true);
    try {
      const allPayments = await feeService.getPayments();
      setPaymentsList(allPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaymentsLoading(false);
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

  const outstandingBalance = studentProfile?.feeSummary?.outstandingBalance || 0;

  // Compute calculated discount and net payable
  let calculatedDiscount = 0;
  if (discountForm.enabled && outstandingBalance > 0) {
    if (discountForm.type === "percentage") {
      calculatedDiscount = Math.round((outstandingBalance * (Number(discountForm.value) || 0)) / 100);
    } else {
      calculatedDiscount = Math.min(outstandingBalance, Number(discountForm.value) || 0);
    }
  }

  const netPayable = Math.max(0, outstandingBalance - calculatedDiscount);

  useEffect(() => {
    if (!selectedAdmissionNo) {
      setStudentProfile(null);
      return;
    }

    studentService
      .getStudentByAdmissionNumber(selectedAdmissionNo)
      .then((data) => {
        setStudentProfile(data);
        const bal = data.feeSummary?.outstandingBalance || 0;
        if (bal > 0) {
          if (discountForm.enabled) {
            const disc = discountForm.type === "percentage"
              ? Math.round((bal * (Number(discountForm.value) || 0)) / 100)
              : Math.min(bal, Number(discountForm.value) || 0);
            setPaymentForm((prev) => ({
              ...prev,
              amountPaid: String(Math.max(0, bal - disc)),
            }));
          } else {
            setPaymentForm((prev) => ({
              ...prev,
              amountPaid: String(bal),
            }));
          }
        }
      })
      .catch(console.error);
  }, [selectedAdmissionNo]);

  // Handle Quick Early Bird Preset Actions
  const applyPresetDiscount = (percentage, reason) => {
    setDiscountForm({
      enabled: true,
      type: "percentage",
      value: percentage,
      reason,
    });
    const disc = Math.round((outstandingBalance * percentage) / 100);
    const net = Math.max(0, outstandingBalance - disc);
    setPaymentForm((prev) => ({
      ...prev,
      amountPaid: String(net),
      remarks: reason,
    }));
  };

  const removeDiscount = () => {
    setDiscountForm((prev) => ({ ...prev, enabled: false }));
    setPaymentForm((prev) => ({
      ...prev,
      amountPaid: String(outstandingBalance),
      remarks: "",
    }));
  };

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
        discountAmount: discountForm.enabled ? calculatedDiscount : 0,
        discountReason: discountForm.enabled ? discountForm.reason : "",
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
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-emerald-700">
            {formatCurrency(val)}
          </span>
          {Number(row.discountAmount) > 0 && (
            <span className="block text-[10px] text-slate-500 font-mono">
              Credit: {formatCurrency(Number(val) + Number(row.discountAmount))}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "discountAmount",
      label: "Discount / Concession",
      sortable: true,
      render: (val, row) =>
        Number(val) > 0 ? (
          <div>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
              <Gift className="w-3 h-3 text-amber-600" />
              - {formatCurrency(val)}
            </span>
            {row.discountReason && (
              <span className="block text-[10px] text-slate-600 font-medium truncate max-w-xs mt-0.5" title={row.discountReason}>
                {row.discountReason}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-xs italic">—</span>
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
        title="Record Fee Payment & Discounts"
        subtitle="Process student fees, apply early-bird full payment discounts, generate official receipts, and settle dues"
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
                Receipt Number: <strong>{successReceiptNo}</strong> has been generated and student balance has been adjusted.
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

      {/* Early Bird Incentive Quick Action Card */}
      {outstandingBalance > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-blue-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-slate-900">
                  Annual Full Pre-Payment Discount Incentive
                </h4>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                  Business Growth & Cash Flow
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Encourage parents to clear the full academic year upfront at the start of the session. Upfront capital enables early school development, lab upgrades, and operational growth.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() =>
                applyPresetDiscount(10, "Early Bird Annual Full Payment (10% Discount)")
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                discountForm.enabled && discountForm.value === 10
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-900 border-blue-300 hover:bg-blue-100/60"
              }`}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Apply 10% Discount</span>
            </button>
            <button
              type="button"
              onClick={() =>
                applyPresetDiscount(5, "Early Bird Annual Full Payment (5% Discount)")
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                discountForm.enabled && discountForm.value === 5
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-900 border-blue-300 hover:bg-blue-100/60"
              }`}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Apply 5% Discount</span>
            </button>
            {discountForm.enabled && (
              <button
                type="button"
                onClick={removeDiscount}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
              >
                Clear Discount
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Payment Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Payment Entry Form</h3>
            <span className="text-xs text-slate-500">Official audited transaction register</span>
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
                label="Net Amount to Collect (INR)"
                type="number"
                required
                placeholder="e.g. 21600"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              />
            </div>

            {/* Discount / Concession Section */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.enabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        applyPresetDiscount(10, "Early Bird Annual Full Payment (10% Discount)");
                      } else {
                        removeDiscount();
                      }
                    }}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Apply Early-Bird / Full Annual Payment Discount</span>
                  </span>
                </label>
                {discountForm.enabled && (
                  <span className="text-xs font-mono font-bold text-amber-800">
                    Saving: {formatCurrency(calculatedDiscount)}
                  </span>
                )}
              </div>

              {discountForm.enabled && (
                <div className="space-y-3 pt-2 border-t border-amber-200/60">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={discountForm.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setDiscountForm((prev) => ({
                            ...prev,
                            type: newType,
                            value: newType === "percentage" ? 10 : 2000,
                          }));
                          const disc = newType === "percentage"
                            ? Math.round((outstandingBalance * 10) / 100)
                            : Math.min(outstandingBalance, 2000);
                          setPaymentForm((prev) => ({
                            ...prev,
                            amountPaid: String(Math.max(0, outstandingBalance - disc)),
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white font-medium focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {discountForm.type === "percentage" ? "Discount Rate (%)" : "Discount Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={discountForm.type === "percentage" ? 100 : outstandingBalance}
                        value={discountForm.value}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setDiscountForm((prev) => ({ ...prev, value: val }));
                          const disc = discountForm.type === "percentage"
                            ? Math.round((outstandingBalance * val) / 100)
                            : Math.min(outstandingBalance, val);
                          setPaymentForm((prev) => ({
                            ...prev,
                            amountPaid: String(Math.max(0, outstandingBalance - disc)),
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-amber-300 rounded bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Discount Reason
                      </label>
                      <select
                        value={discountForm.reason}
                        onChange={(e) =>
                          setDiscountForm((prev) => ({ ...prev, reason: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="Early Bird Annual Full Payment (10% Discount)">
                          Early Bird 10% (Annual Full Payment)
                        </option>
                        <option value="Early Bird Annual Full Payment (5% Discount)">
                          Early Bird 5% (Annual Full Payment)
                        </option>
                        <option value="Sibling Concession (15%)">Sibling Concession (15%)</option>
                        <option value="Staff Ward Concession">Staff Ward Concession</option>
                        <option value="Merit Scholarship / Fee Concession">
                          Merit Scholarship / Concession
                        </option>
                        <option value="Special Management Concession">
                          Special Management Concession
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Live Financial Breakdown Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-white/80 rounded-lg border border-amber-200 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Due:</span>
                      <div className="font-bold font-mono text-slate-900">{formatCurrency(outstandingBalance)}</div>
                    </div>
                    <div>
                      <span className="text-amber-700 text-[10px] uppercase font-semibold">Discount ({discountForm.type === "percentage" ? `${discountForm.value}%` : "Flat"}):</span>
                      <div className="font-bold font-mono text-amber-800">- {formatCurrency(calculatedDiscount)}</div>
                    </div>
                    <div>
                      <span className="text-emerald-700 text-[10px] uppercase font-semibold">Net Cash to Pay:</span>
                      <div className="font-bold font-mono text-emerald-800 text-sm">{formatCurrency(netPayable)}</div>
                    </div>
                    <div>
                      <span className="text-blue-700 text-[10px] uppercase font-semibold">Total Credit Applied:</span>
                      <div className="font-bold font-mono text-blue-900">{formatCurrency(outstandingBalance)}</div>
                    </div>
                  </div>
                </div>
              )}
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
                placeholder="e.g. Full annual payment with early-bird discount"
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
                  <span className="text-slate-500">Total Paid (Cash/Bank):</span>
                  <strong className="text-emerald-700 font-mono">
                    {formatCurrency(feeSummary?.totalPaid || 0)}
                  </strong>
                </div>
                {Number(feeSummary?.totalDiscount) > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span className="font-medium">Total Discounts / Concessions:</span>
                    <strong className="font-mono">
                      - {formatCurrency(feeSummary?.totalDiscount || 0)}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Pending Balance:</span>
                  <strong className="text-amber-700 font-mono font-bold">
                    {formatCurrency(feeSummary?.outstandingBalance || 0)}
                  </strong>
                </div>
              </div>

              <div className="text-center pt-2">
                <Badge variant={feeSummary?.outstandingBalance === 0 ? "emerald" : "amber"}>
                  {feeSummary?.outstandingBalance === 0 ? "Account Fully Settled" : "Balance Outstanding"}
                </Badge>
              </div>

              {/* Discount policy guide */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-slate-600 text-[11px] space-y-1">
                <div className="font-semibold text-blue-900 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Early Payment Concession Policy</span>
                </div>
                <p>
                  Offering 5%–10% discount for full annual payment at the beginning of the financial year accelerates collection and provides working capital for infrastructure and school operations.
                </p>
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
          isLoading={isPaymentsLoading}
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
