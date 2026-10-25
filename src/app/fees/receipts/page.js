"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import FeeReceiptTemplate from "@/templates/FeeReceiptTemplate";
import feeService from "@/services/feeService";
import studentService from "@/services/studentService";
import documentService from "@/services/documentService";
import useSchoolSettings from "@/hooks/useSchoolSettings";
import { Printer, Download, Receipt } from "lucide-react";

function FeeReceiptsContent() {
  const searchParams = useSearchParams();
  const initialReceiptNo = searchParams.get("receiptNumber") || "";
  const { settings: school } = useSchoolSettings();

  const [payments, setPayments] = useState([]);
  const [selectedReceiptNo, setSelectedReceiptNo] = useState(initialReceiptNo);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [student, setStudent] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(0);

  useEffect(() => {
    feeService.getPayments().then((data) => {
      setPayments(data);
      if (!initialReceiptNo && data.length > 0) {
        setSelectedReceiptNo(data[0].receiptNumber);
      }
    });
  }, [initialReceiptNo]);

  useEffect(() => {
    if (!selectedReceiptNo) return;
    const found = payments.find((p) => p.receiptNumber === selectedReceiptNo);
    if (found) {
      setCurrentPayment(found);
      studentService
        .getStudentByAdmissionNumber(found.admissionNumber)
        .then((sData) => {
          setStudent(sData.student);
          setRemainingBalance(sData.feeSummary?.outstandingBalance || 0);
        })
        .catch(console.error);
    }
  }, [selectedReceiptNo, payments]);

  const receiptOptions = payments.map((p) => ({
    value: p.receiptNumber,
    label: `${p.receiptNumber} — ${p.studentName} (₹ ${p.amountPaid})`,
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Fee Receipts & Reprint Archive"
        subtitle="Reprint original official fee receipts with parent and office duplicate copies"
        breadcrumbs={[
          { label: "Fees", href: "/fees" },
          { label: "Receipts" },
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
                  `Receipt_${selectedReceiptNo}.pdf`
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
              Print Receipt
            </Button>
          </div>
        }
      />

      {/* Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 no-print flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-96">
          <Select
            label="Select Receipt Number"
            value={selectedReceiptNo}
            onChange={(e) => setSelectedReceiptNo(e.target.value)}
            options={receiptOptions}
          />
        </div>
        <div className="text-xs text-slate-500 pt-2 sm:pt-4">
          Reprinting reproduces the immutable verified transaction audit record.
        </div>
      </div>

      {currentPayment ? (
        <div className="py-2">
          <FeeReceiptTemplate
            receiptNumber={currentPayment.receiptNumber}
            paymentDate={currentPayment.paymentDate}
            student={student}
            feeCategory={currentPayment.feeCategory}
            amountPaid={currentPayment.amountPaid}
            discountAmount={currentPayment.discountAmount || 0}
            discountReason={currentPayment.discountReason || ""}
            paymentMode={currentPayment.paymentMode}
            transactionRef={currentPayment.transactionRef}
            receivedBy={currentPayment.receivedBy}
            remarks={currentPayment.remarks}
            remainingBalance={remainingBalance}
            school={school}
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          Select a receipt above to preview and print.
        </div>
      )}
    </AppLayout>
  );
}

export default function FeeReceiptsPage() {
  return (
    <Suspense fallback={<div>Loading receipts...</div>}>
      <FeeReceiptsContent />
    </Suspense>
  );
}
