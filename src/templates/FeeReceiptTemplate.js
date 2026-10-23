"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatCurrency, formatDate, amountToWords } from "@/lib/formatters";

/**
 * High-Fidelity Printable Fee Receipt Template
 * Provides standard 2-copy school receipt (Parent Copy & Office Copy)
 */
export default function FeeReceiptTemplate({
  receiptNumber = "RCP-2026-0001",
  paymentDate = "2026-04-10",
  student,
  feeCategory = "Tuition Fee",
  amountPaid = 12000,
  paymentMode = "UPI",
  transactionRef = "UPI-REF-99218",
  receivedBy = "Accounts Department",
  remarks = "",
  remainingBalance = 0,
  school: customSchool,
}) {
  const school = customSchool || appConfig.school;

  const renderSingleCopy = (copyTitle) => (
    <div className="border-2 border-slate-900 p-5 rounded-sm bg-white mb-6 print:mb-8 font-sans leading-tight">
      {/* Receipt Top Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex items-start gap-2.5">
          {school.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={school.logoUrl}
              alt="Logo"
              className="w-10 h-10 object-contain rounded shrink-0 mt-0.5"
            />
          )}
          <div>
            <h1 className="text-lg font-black uppercase text-slate-950 tracking-tight">
              {school.name}
            </h1>
            <p className="text-[10px] text-slate-600">{school.address}</p>
            <p className="text-[10px] text-slate-600">
              Phone: {school.phone} | Affiliation: {school.affiliationNo}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-xs print:bg-black">
            {copyTitle}
          </span>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1">
            Receipt: <span className="text-blue-900 print:text-black">{receiptNumber}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            Date: {formatDate(paymentDate)}
          </div>
        </div>
      </div>

      {/* Student Details Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-2.5 rounded-sm bg-slate-50 print:bg-transparent mb-3">
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Student Name:</span>
          <div className="font-bold text-slate-900">{student?.studentName || "—"}</div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Admission No:</span>
          <div className="font-bold font-mono text-slate-900">{student?.admissionNumber || "—"}</div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Class & Section:</span>
          <div className="font-bold text-slate-900">
            {student?.className} - {student?.section}
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] uppercase">Academic Session:</span>
          <div className="font-bold text-slate-900">{student?.academicSession || appConfig.defaultSession}</div>
        </div>
      </div>

      {/* Payment Line Item Table */}
      <table className="w-full text-left text-xs border-collapse border border-slate-900 mb-3">
        <thead>
          <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-900 text-[11px] font-bold uppercase">
            <th className="border border-slate-900 px-3 py-1.5 w-12 text-center">#</th>
            <th className="border border-slate-900 px-3 py-1.5">Fee Particulars</th>
            <th className="border border-slate-900 px-3 py-1.5 text-center w-32">Payment Mode</th>
            <th className="border border-slate-900 px-3 py-1.5 text-right w-36">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-800">
            <td className="border border-slate-900 px-3 py-2 text-center font-mono">1</td>
            <td className="border border-slate-900 px-3 py-2">
              <span className="font-bold text-slate-950">{feeCategory}</span>
              {transactionRef && (
                <span className="block text-[10px] text-slate-500">
                  Ref/Transaction ID: {transactionRef}
                </span>
              )}
              {remarks && (
                <span className="block text-[10px] text-slate-500 italic">
                  Note: {remarks}
                </span>
              )}
            </td>
            <td className="border border-slate-900 px-3 py-2 text-center font-medium">
              {paymentMode}
            </td>
            <td className="border border-slate-900 px-3 py-2 text-right font-mono font-bold text-sm text-slate-950">
              {formatCurrency(amountPaid)}
            </td>
          </tr>

          {/* Grand Total Row */}
          <tr className="bg-slate-50 print:bg-slate-100 font-bold border-t-2 border-slate-900">
            <td colSpan={3} className="border border-slate-900 px-3 py-2 text-right uppercase text-[11px]">
              Total Amount Received:
            </td>
            <td className="border border-slate-900 px-3 py-2 text-right font-mono text-base font-extrabold text-emerald-800 print:text-black">
              {formatCurrency(amountPaid)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words */}
      <div className="border border-slate-400 p-2 mb-3 text-xs bg-slate-50/50 print:bg-transparent">
        <span className="text-slate-500 text-[10px] uppercase font-bold">Amount in Words:</span>
        <div className="font-semibold text-slate-900 italic">
          {amountToWords(amountPaid)}
        </div>
      </div>

      {/* Balance & Signatures Footer */}
      <div className="flex items-end justify-between pt-2">
        <div className="text-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Outstanding Balance:</span>
          <div className="font-bold text-sm text-amber-700 print:text-black font-mono">
            {formatCurrency(remainingBalance)}
          </div>
          <span className="text-[10px] text-slate-400">Cashier: {receivedBy}</span>
        </div>

        <div className="text-center">
          <div className="w-40 border-b border-slate-800 pb-1 mb-1 font-bold text-xs">
            Authorized Signatory
          </div>
          <div className="text-[10px] text-slate-500">School Accounts Office</div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      id="printable-document"
      className="printable-document bg-white max-w-[210mm] mx-auto p-4"
    >
      {renderSingleCopy("Student / Parent Copy")}
      {/* Perforation guide for physical receipt printing */}
      <div className="border-b-2 border-dashed border-slate-400 my-4 text-center relative no-print">
        <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest relative -top-2">
          ✂ Fold or Cut Here (2-Part School Receipt)
        </span>
      </div>
      {renderSingleCopy("School Office & Accounts Copy")}
    </div>
  );
}
