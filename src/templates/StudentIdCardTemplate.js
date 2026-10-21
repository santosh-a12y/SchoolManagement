"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate } from "@/lib/formatters";
import { User, Phone, MapPin, QrCode } from "lucide-react";

/**
 * Student ID Card Template
 * Supports:
 * 1. Standard Horizontal CR-80 card layout (85.6mm × 54mm)
 * 2. Vertical Portrait Badge layout (54mm × 85.6mm)
 */
export default function StudentIdCardTemplate({
  student,
  format = "standard", // 'standard' | 'vertical'
}) {
  const school = appConfig.school;

  // Standard Horizontal CR-80 Layout (336px × 212px)
  if (format === "standard") {
    return (
      <div
        id="printable-document"
        className="printable-document mx-auto bg-white rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg print:shadow-none font-sans text-slate-900 id-card-standard relative flex flex-col justify-between"
        style={{ width: "85.6mm", height: "54mm" }}
      >
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between border-b border-slate-800 print:bg-black">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">
              {school.logoText || "S"}
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-tight leading-none text-white">
                {school.name}
              </h2>
              <span className="text-[8px] text-slate-300 block">Student Identity Card</span>
            </div>
          </div>
          <span className="text-[8px] font-bold bg-blue-600 px-1.5 py-0.5 rounded text-white font-mono">
            {student?.academicSession || appConfig.defaultSession}
          </span>
        </div>

        {/* Card Body */}
        <div className="px-3 py-1.5 flex items-center gap-3 flex-1">
          {/* Photo */}
          <div className="w-16 h-20 rounded-md border border-slate-400 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
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

          {/* Student Bio Details */}
          <div className="flex-1 text-[9px] leading-tight space-y-0.5">
            <div className="text-[11px] font-black text-slate-950 uppercase truncate leading-snug">
              {student?.studentName || "Student Name"}
            </div>
            <div className="text-slate-600">
              Adm No: <strong className="text-blue-900 font-mono font-bold">{student?.admissionNumber || "—"}</strong>
            </div>
            <div className="text-slate-600">
              Class & Sec: <strong className="text-slate-900">{student?.className} - {student?.section}</strong>
            </div>
            <div className="text-slate-600">
              Roll No: <strong className="text-slate-900 font-mono">{student?.rollNumber || "—"}</strong> | Blood: <strong className="text-red-700">{student?.bloodGroup || "—"}</strong>
            </div>
            <div className="text-slate-600">
              DOB: <strong className="text-slate-900">{formatDate(student?.dateOfBirth)}</strong>
            </div>
            <div className="text-slate-600 truncate">
              Emergency: <strong className="text-slate-900">{student?.emergencyContact || student?.parentContact || "—"}</strong>
            </div>
          </div>
        </div>

        {/* Card Bottom Bar */}
        <div className="bg-slate-100 px-3 py-1 border-t border-slate-300 flex items-center justify-between text-[7px] text-slate-600">
          <span>{school.phone}</span>
          <div className="text-right">
            <span className="font-bold text-slate-900">Principal Signature</span>
          </div>
        </div>
      </div>
    );
  }

  // Vertical Portrait Badge Layout (54mm × 85.6mm)
  return (
    <div
      id="printable-document"
      className="printable-document mx-auto bg-white rounded-xl border-2 border-slate-800 overflow-hidden shadow-lg print:shadow-none font-sans text-slate-900 id-card-vertical relative flex flex-col justify-between text-center"
      style={{ width: "54mm", height: "85.6mm" }}
    >
      {/* Top Lanyard Punch Indicator (Visual Guide) */}
      <div className="w-6 h-1.5 bg-slate-300 rounded-full mx-auto mt-1 no-print" />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-2 py-2 border-b border-slate-800 print:bg-black mt-1">
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-black text-xs text-white mx-auto mb-1">
          {school.logoText || "S"}
        </div>
        <h2 className="text-[9px] font-black uppercase tracking-tight leading-tight text-white line-clamp-1">
          {school.name}
        </h2>
        <span className="text-[7px] text-slate-300 block uppercase tracking-wider">
          Student ID Card
        </span>
      </div>

      {/* Photo & Details */}
      <div className="p-2 flex flex-col items-center flex-1 justify-center space-y-1">
        <div className="w-16 h-20 rounded-md border-2 border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden shadow-xs">
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

        <div className="text-[10px] font-black text-slate-950 uppercase mt-1 leading-snug">
          {student?.studentName || "Student Name"}
        </div>
        <div className="text-[8px] font-mono font-bold text-blue-800">
          {student?.admissionNumber || "—"}
        </div>

        <div className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-[8px] space-y-0.5 text-left leading-tight">
          <div className="flex justify-between">
            <span className="text-slate-500">Class:</span>
            <strong>{student?.className}-{student?.section}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Roll No:</span>
            <strong>{student?.rollNumber || "—"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Blood:</span>
            <strong className="text-red-700">{student?.bloodGroup || "—"}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Session:</span>
            <strong>{student?.academicSession || appConfig.defaultSession}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Emergency:</span>
            <strong className="truncate max-w-[24mm]">{student?.parentContact || "—"}</strong>
          </div>
        </div>
      </div>

      {/* Footer Signature */}
      <div className="bg-slate-100 px-2 py-1 border-t border-slate-300 text-[7px] text-slate-700 flex items-center justify-between">
        <span>{school.emergencyContact}</span>
        <span className="font-bold">Principal Sign</span>
      </div>
    </div>
  );
}
