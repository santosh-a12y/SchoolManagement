"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate } from "@/lib/formatters";
import { User, Phone, MapPin, QrCode, ShieldCheck } from "lucide-react";

/**
 * Student ID Card Template
 * Supports:
 * 1. Standard Horizontal CR-80 card layout (85.6mm × 54mm)
 * 2. Vertical Portrait Badge layout (54mm × 85.6mm)
 * 3. Front only or Front & Back sides with print cut guides
 * Perfectly budgeted vertical space to ensure no empty dead space at the bottom.
 */
export default function StudentIdCardTemplate({
  student,
  format = "standard", // 'standard' | 'vertical'
  school: customSchool,
  showBack = false,
  withCutGuide = true,
}) {
  const school = customSchool || appConfig.school;

  // 1. Standard Horizontal Card - Front (85.6mm × 54mm)
  const renderHorizontalFront = (key = "front") => (
    <div
      key={key}
      className="printable-document bg-white rounded-xl border border-slate-900 overflow-hidden shadow-md print:shadow-none font-sans text-slate-900 id-card-standard relative flex flex-col justify-between"
      style={{ width: "85.6mm", height: "54mm" }}
    >
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800 print:bg-black shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {school.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={school.logoUrl}
              alt="Logo"
              className="w-5 h-5 rounded object-contain bg-white shrink-0 p-0.5"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white shrink-0">
              {school.logoText || "S"}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-[10px] font-black uppercase tracking-tight leading-none text-white truncate max-w-[48mm]">
              {school.name}
            </h2>
            <span className="text-[7.5px] text-slate-300 block leading-tight">
              Student Identity Card • {school.affiliationNo ? `Aff: ${school.affiliationNo}` : "CBSE"}
            </span>
          </div>
        </div>
        <span className="text-[8px] font-bold bg-blue-600 px-1.5 py-0.5 rounded text-white font-mono shrink-0">
          {student?.academicSession || appConfig.defaultSession}
        </span>
      </div>

      {/* Card Body - Evenly Distributed Content */}
      <div className="px-2.5 py-1.5 flex items-stretch gap-2.5 flex-1 min-h-0">
        {/* Left: Photo & Admission Number */}
        <div className="flex flex-col items-center justify-between shrink-0 w-[21mm]">
          <div className="w-[21mm] h-[25mm] rounded border border-slate-400 bg-slate-100 flex items-center justify-center overflow-hidden shadow-xs">
            {student?.studentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.studentPhoto}
                alt={student.studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="w-full bg-slate-900 text-white text-[7.5px] font-mono font-bold py-0.5 text-center rounded mt-1 truncate">
            {student?.admissionNumber || "—"}
          </div>
        </div>

        {/* Right: Comprehensive Student Details */}
        <div className="flex-1 flex flex-col justify-between text-[8.5px] leading-tight min-w-0">
          <div>
            <div className="text-[11.5px] font-black text-slate-950 uppercase truncate leading-none mb-1">
              {student?.studentName || "Student Name"}
            </div>
            <div className="space-y-0.5 text-slate-700">
              <div className="flex items-center justify-between">
                <span>Class: <strong className="text-slate-950">{student?.className} - {student?.section}</strong></span>
                <span>Roll: <strong className="text-slate-950 font-mono">{student?.rollNumber || "—"}</strong></span>
              </div>
              <div className="truncate">
                Father: <strong className="text-slate-900">{student?.fatherName || student?.guardianName || "—"}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>DOB: <strong>{formatDate(student?.dateOfBirth)}</strong></span>
                <span>Blood: <strong className="text-red-700 font-bold">{student?.bloodGroup || "—"}</strong></span>
              </div>
              <div className="truncate">
                Emergency: <strong className="text-slate-900 font-mono">{student?.emergencyContact || student?.parentContact || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="text-[7px] text-slate-500 truncate border-t border-slate-100 pt-0.5">
            {student?.residentialAddress || school.address}
          </div>
        </div>
      </div>

      {/* Card Bottom Bar - Grounded Without Dead Space */}
      <div className="bg-slate-100 px-2.5 py-1 border-t border-slate-300 flex items-center justify-between text-[7px] text-slate-600 shrink-0">
        <div className="truncate max-w-[48mm]">
          <span className="font-semibold text-slate-800">Helpline:</span> {school.phone}
        </div>
        <div className="text-right flex items-center gap-1.5">
          <div className="text-right">
            <span className="font-bold text-slate-900 block leading-none">Principal Signature</span>
            <span className="text-[6px] text-slate-500 block leading-none mt-0.5">{school.principalName ? school.principalName.split(",")[0] : "Head of Institution"}</span>
          </div>
        </div>
      </div>
      {/* Visual Bottom Accent Stripe */}
      <div className="h-0.5 bg-blue-600 w-full shrink-0" />
    </div>
  );

  // 2. Standard Horizontal Card - Back (85.6mm × 54mm)
  const renderHorizontalBack = (key = "back") => (
    <div
      key={key}
      className="printable-document bg-white rounded-xl border border-slate-900 overflow-hidden shadow-md print:shadow-none font-sans text-slate-900 id-card-standard relative flex flex-col justify-between"
      style={{ width: "85.6mm", height: "54mm" }}
    >
      {/* Back Top Banner */}
      <div className="bg-slate-900 text-white px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800 print:bg-black shrink-0">
        <div className="text-[9px] font-black uppercase tracking-wider text-white">
          Emergency & Transport Information
        </div>
        <span className="text-[7px] font-mono text-slate-300">
          SCH CODE: {school.schoolCode || "SCH-98210"}
        </span>
      </div>

      {/* Back Content - Fully fills the card height */}
      <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-between text-[8px] leading-tight min-h-0">
        <div className="space-y-1">
          <div>
            <span className="text-slate-500 block text-[7px] uppercase font-bold">Residential Address</span>
            <p className="text-slate-900 font-medium line-clamp-2 leading-tight">
              {student?.residentialAddress || "Residential campus address on institutional records"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100">
            <div>
              <span className="text-slate-500 text-[7px] block">Mother's Name</span>
              <strong className="text-slate-900 truncate block">{student?.motherName || "—"}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[7px] block">Alternate Contact</span>
              <strong className="text-slate-900 font-mono block">{student?.parentContact || "—"}</strong>
            </div>
          </div>
        </div>

        {/* Card Usage Instructions */}
        <div className="bg-slate-50 p-1 rounded border border-slate-200 text-[6.5px] text-slate-600 leading-tight space-y-0.5">
          <p>• Card is strictly non-transferable and must be carried on campus at all times.</p>
          <p>• If found, return to: {school.address} | Tel: {school.phone}</p>
        </div>
      </div>

      {/* Back Bottom Bar */}
      <div className="bg-slate-100 px-2.5 py-1 border-t border-slate-300 flex items-center justify-between text-[7px] text-slate-600 shrink-0">
        <span>Web: {school.website || "www.school.edu"}</span>
        <span className="font-bold text-slate-900">Institutional Seal</span>
      </div>
      <div className="h-0.5 bg-slate-900 w-full shrink-0" />
    </div>
  );

  // 3. Vertical Portrait Badge - Front (54mm × 85.6mm)
  const renderVerticalFront = (key = "v-front") => (
    <div
      key={key}
      className="printable-document bg-white rounded-xl border border-slate-900 overflow-hidden shadow-md print:shadow-none font-sans text-slate-900 id-card-vertical relative flex flex-col justify-between text-center"
      style={{ width: "54mm", height: "85.6mm" }}
    >
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white px-2 py-1.5 border-b border-slate-800 print:bg-black shrink-0">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          {school.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={school.logoUrl}
              alt="Logo"
              className="w-5 h-5 rounded object-contain bg-white p-0.5 shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-black text-[9px] text-white shrink-0">
              {school.logoText || "S"}
            </div>
          )}
          <h2 className="text-[9.5px] font-black uppercase tracking-tight leading-tight text-white line-clamp-1">
            {school.name}
          </h2>
        </div>
        <div className="flex items-center justify-between text-[7px] text-slate-300 border-t border-slate-800 pt-0.5">
          <span className="uppercase tracking-wider font-semibold">Student ID Card</span>
          <span className="font-mono text-blue-400 font-bold">{student?.academicSession || appConfig.defaultSession}</span>
        </div>
      </div>

      {/* Main Body - Fully Fills the 85.6mm Vertical Height */}
      <div className="p-2 flex-1 flex flex-col justify-between items-center min-h-0">
        {/* Photo + Name + Adm Badge */}
        <div className="flex flex-col items-center w-full">
          <div className="w-[24mm] h-[28mm] rounded-md border-2 border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden shadow-xs">
            {student?.studentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.studentPhoto}
                alt={student.studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div className="text-[11px] font-black text-slate-950 uppercase mt-1 leading-tight tracking-tight line-clamp-1 w-full px-1">
            {student?.studentName || "Student Name"}
          </div>

          <div className="mt-0.5">
            <span className="font-mono font-bold text-[8.5px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {student?.admissionNumber || "—"}
            </span>
          </div>
        </div>

        {/* Structured Details Box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[8px] space-y-0.5 text-left leading-tight my-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Class & Sec:</span>
            <strong className="text-slate-950">{student?.className}-{student?.section}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Roll No:</span>
            <strong className="text-slate-950 font-mono">{student?.rollNumber || "—"}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Date of Birth:</span>
            <strong>{formatDate(student?.dateOfBirth)}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Blood Group:</span>
            <strong className="text-red-700 font-bold">{student?.bloodGroup || "—"}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Father Name:</span>
            <strong className="truncate max-w-[24mm]">{student?.fatherName || student?.guardianName || "—"}</strong>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-0.5">
            <span className="text-slate-500">Emergency Tel:</span>
            <strong className="font-mono text-slate-900">{student?.emergencyContact || student?.parentContact || "—"}</strong>
          </div>
        </div>

        {/* Signature & Barcode representation to fill the bottom evenly */}
        <div className="w-full flex items-center justify-between px-1 text-[7px] text-slate-600">
          <div className="text-left font-mono text-[7px] tracking-wider text-slate-500">
            |||||||||||||||||||||
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-900 block leading-none">Principal</span>
            <span className="text-[6px] text-slate-500 block leading-none">Authorized Sign</span>
          </div>
        </div>
      </div>

      {/* Grounded Bottom Footer Bar */}
      <div className="bg-slate-100 px-2 py-1 border-t border-slate-300 text-[6.5px] text-slate-700 flex items-center justify-between shrink-0">
        <span className="truncate max-w-[26mm] font-semibold">{school.phone}</span>
        <span className="truncate max-w-[24mm] text-slate-500">{school.website || "Campus Portal"}</span>
      </div>
      <div className="h-0.5 bg-blue-600 w-full shrink-0" />
    </div>
  );

  // 4. Vertical Portrait Badge - Back (54mm × 85.6mm)
  const renderVerticalBack = (key = "v-back") => (
    <div
      key={key}
      className="printable-document bg-white rounded-xl border border-slate-900 overflow-hidden shadow-md print:shadow-none font-sans text-slate-900 id-card-vertical relative flex flex-col justify-between text-center"
      style={{ width: "54mm", height: "85.6mm" }}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-2 py-1.5 border-b border-slate-800 print:bg-black shrink-0">
        <h2 className="text-[9.5px] font-black uppercase tracking-wider text-white">
          Cardholder Information
        </h2>
        <span className="text-[7px] text-slate-300 block">
          Affiliation: {school.affiliationNo || "CBSE Registration"}
        </span>
      </div>

      {/* Details - Fully distributed across vertical height */}
      <div className="p-2 text-left flex-1 flex flex-col justify-between text-[7.5px] leading-tight space-y-1 min-h-0">
        <div>
          <span className="text-slate-500 text-[7px] uppercase font-bold block">Permanent Residential Address:</span>
          <p className="text-slate-900 font-medium line-clamp-3 leading-tight mt-0.5">
            {student?.residentialAddress || "Official student address on school record"}
          </p>
        </div>

        <div className="space-y-0.5 pt-1 border-t border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-500">Father:</span>
            <strong className="truncate max-w-[28mm]">{student?.fatherName || "—"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mother:</span>
            <strong className="truncate max-w-[28mm]">{student?.motherName || "—"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Parent Mobile:</span>
            <strong className="font-mono">{student?.parentContact || "—"}</strong>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[6.5px] text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-800">Campus Regulations:</p>
          <p>• Student must display this card on campus daily.</p>
          <p>• Loss must be reported to the office immediately.</p>
          <p>• Return address: {school.address}</p>
        </div>

        <div className="text-center font-mono text-[7px] tracking-widest text-slate-400">
          *{student?.admissionNumber || "2026"}*
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-2 py-1 border-t border-slate-300 text-[6.5px] text-slate-700 flex items-center justify-between shrink-0">
        <span>{school.website || "www.school.edu"}</span>
        <span className="font-bold text-slate-900">Head of Institution</span>
      </div>
      <div className="h-0.5 bg-slate-900 w-full shrink-0" />
    </div>
  );

  const isStandard = format === "standard";

  if (!showBack) {
    return (
      <div id="printable-document" className="flex items-center justify-center">
        {withCutGuide ? (
          <div className="id-card-cut-guide">
            {isStandard ? renderHorizontalFront() : renderVerticalFront()}
          </div>
        ) : (
          isStandard ? renderHorizontalFront() : renderVerticalFront()
        )}
      </div>
    );
  }

  // Both Front & Back Side-by-Side (Ideal for A4 Paper print and fold/lamination)
  return (
    <div
      id="printable-document"
      className="id-card-print-container flex flex-wrap items-center justify-center gap-4 sm:gap-6"
    >
      <div className="text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 no-print">
          Front Side
        </span>
        <div className={withCutGuide ? "id-card-cut-guide" : ""}>
          {isStandard ? renderHorizontalFront("front") : renderVerticalFront("front")}
        </div>
      </div>

      <div className="text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 no-print">
          Back Side
        </span>
        <div className={withCutGuide ? "id-card-cut-guide" : ""}>
          {isStandard ? renderHorizontalBack("back") : renderVerticalBack("back")}
        </div>
      </div>
    </div>
  );
}
