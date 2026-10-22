"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate } from "@/lib/formatters";

/**
 * High-Fidelity Printable Provisional Certificate Template
 */
export default function ProvisionalCertificateTemplate({
  student,
  certificateType = "Provisional School Leaving Certificate",
  conduct = "Exemplary",
  reason = "Higher Education & Relocation",
  issueDate = new Date().toISOString().split("T")[0],
  school: customSchool,
}) {
  const school = customSchool || appConfig.school;

  return (
    <div
      id="printable-document"
      className="printable-document bg-white text-black p-10 max-w-[210mm] mx-auto border-8 border-double border-slate-900 shadow-md print:shadow-none print:border-4 print:border-black font-serif leading-relaxed relative"
    >
      {/* Certificate Number & Date Top Line */}
      <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-700 border-b border-slate-300 pb-2 mb-6">
        <div>
          Certificate No:{" "}
          <span className="font-mono text-blue-900 print:text-black font-bold">
            CERT-{student?.admissionNumber?.replace("ADM-", "") || "2026-001"}
          </span>
        </div>
        <div>Date of Issue: {formatDate(issueDate)}</div>
      </div>

      {/* School Crest / Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-slate-900 mx-auto flex items-center justify-center font-black text-lg mb-2">
          {school.logoText || "S"}
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950 font-sans">
          {school.name}
        </h1>
        <p className="text-xs text-slate-600 font-sans mt-0.5">{school.address}</p>
        <p className="text-[11px] text-slate-500 font-sans">
          Affiliated with CBSE New Delhi | Affiliation No: {school.affiliationNo}
        </p>
      </div>

      {/* Certificate Title */}
      <div className="text-center my-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 underline underline-offset-8 font-sans">
          {certificateType}
        </h2>
      </div>

      {/* Certificate Body Text */}
      <div className="text-justify text-sm leading-loose my-8 space-y-4 px-4">
        <p>
          This is to officially certify that Master / Miss{" "}
          <strong className="underline underline-offset-4 text-base font-bold font-sans">
            {student?.studentName || "________________________"}
          </strong>
          , Son / Daughter of Shri{" "}
          <strong className="underline underline-offset-4 font-bold font-sans">
            {student?.fatherName || "________________________"}
          </strong>{" "}
          and Smt.{" "}
          <strong className="underline underline-offset-4 font-bold font-sans">
            {student?.motherName || "________________________"}
          </strong>
          , having Admission Number{" "}
          <strong className="font-mono font-bold underline underline-offset-4">
            {student?.admissionNumber || "_______________"}
          </strong>{" "}
          and Roll Number{" "}
          <strong className="font-mono font-bold underline underline-offset-4">
            {student?.rollNumber || "____"}
          </strong>
          , is a bonafide student of this institution.
        </p>

        <p>
          According to our official school admission register, the student was admitted on{" "}
          <strong className="underline underline-offset-4">
            {formatDate(student?.admissionDate)}
          </strong>{" "}
          and has successfully completed the coursework for{" "}
          <strong className="font-bold underline underline-offset-4">
            {student?.className} - Section {student?.section}
          </strong>{" "}
          during the Academic Session{" "}
          <strong className="underline underline-offset-4">
            {student?.academicSession || appConfig.defaultSession}
          </strong>
          .
        </p>

        <p>
          Their Date of Birth according to the Admission Register is{" "}
          <strong className="underline underline-offset-4 font-bold">
            {formatDate(student?.dateOfBirth)}
          </strong>
          .
        </p>

        <p>
          During their tenure at this institution, their moral character, general conduct, and
          academic demeanor have been found to be{" "}
          <strong className="underline underline-offset-4 font-bold">
            {conduct}
          </strong>
          . All school dues, library books, and examination fees have been fully settled and
          cleared.
        </p>

        <p>
          Reason for issuing this certificate:{" "}
          <strong className="italic underline underline-offset-4">{reason}</strong>. We wish the
          student all success in their future academic and personal endeavors.
        </p>
      </div>

      {/* Official Signatures & Seal */}
      <div className="grid grid-cols-3 gap-6 pt-16 text-center text-xs font-sans font-semibold text-slate-900">
        <div>
          <div className="border-t border-slate-900 pt-1 font-bold">Prepared By</div>
          <span className="text-[10px] text-slate-500">Office Clerk</span>
        </div>
        <div>
          <div className="border-t border-slate-900 pt-1 font-bold">Checked & Verified By</div>
          <span className="text-[10px] text-slate-500">Administrative Incharge</span>
        </div>
        <div>
          <div className="border-t border-slate-900 pt-1 font-bold">{school.principalName}</div>
          <span className="text-[10px] text-slate-500">{school.principalSignTitle}</span>
        </div>
      </div>
    </div>
  );
}
