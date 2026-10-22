"use client";

import React from "react";
import appConfig from "@/config/appConfig";
import { formatDate } from "@/lib/formatters";
import { User } from "lucide-react";

/**
 * High-Fidelity Printable Examination Admit Card Template
 * (Official Examination Hall Ticket)
 */
export default function AdmitCardTemplate({
  student,
  examinationName = "Annual Exam",
  academicSession = "2026-27",
  schedules = [],
  school: customSchool,
}) {
  const school = customSchool || appConfig.school;

  return (
    <div
      id="printable-document"
      className="printable-document bg-white text-black p-8 max-w-[210mm] mx-auto border-2 border-slate-900 shadow-md print:shadow-none print:border-2 print:border-black font-sans leading-normal"
    >
      {/* School Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h1 className="text-xl font-black uppercase text-slate-950 tracking-tight">
          {school.name}
        </h1>
        <p className="text-xs text-slate-600 font-medium">{school.address}</p>
        <p className="text-[11px] text-slate-500">
          Affiliation No: {school.affiliationNo} | School Code: {school.schoolCode}
        </p>
        <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider print:bg-black">
          Official Examination Admit Card / Hall Ticket
        </div>
      </div>

      {/* Examination Title */}
      <div className="text-center mb-4">
        <h2 className="text-sm font-extrabold uppercase text-slate-900">
          {examinationName} — Session {academicSession}
        </h2>
      </div>

      {/* Candidate Details & Photograph */}
      <div className="border border-slate-900 p-4 rounded-sm mb-5 flex items-start justify-between gap-6 bg-slate-50/50 print:bg-transparent">
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Candidate Name:</span>
            <div className="font-bold text-slate-950 text-sm">{student?.studentName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Admission Number:</span>
            <div className="font-bold text-slate-950 font-mono">{student?.admissionNumber || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Class & Section:</span>
            <div className="font-bold text-slate-950">{student?.className} - {student?.section}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Exam Roll Number:</span>
            <div className="font-bold text-slate-950 font-mono text-sm">{student?.rollNumber || "01"}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Father&apos;s Name:</span>
            <div className="font-semibold text-slate-900">{student?.fatherName || "—"}</div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px]">Date of Birth:</span>
            <div className="font-semibold text-slate-900">{formatDate(student?.dateOfBirth)}</div>
          </div>
        </div>

        {/* Student Photograph */}
        <div className="w-20 h-24 border-2 border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
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
      </div>

      {/* Examination Timetable Schedule Table */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          Examination Timetable & Seating Schedule:
        </h3>
        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-200 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
              <th className="border border-slate-900 px-3 py-2 text-center w-12">#</th>
              <th className="border border-slate-900 px-3 py-2">Subject Name</th>
              <th className="border border-slate-900 px-3 py-2 text-center w-28">Exam Date</th>
              <th className="border border-slate-900 px-3 py-2 text-center w-36">Timing</th>
              <th className="border border-slate-900 px-3 py-2 text-center w-24">Room No</th>
              <th className="border border-slate-900 px-3 py-2 text-center w-32">Invigilator Sign</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-slate-900 p-4 text-center text-slate-500">
                  No examination schedule published for this class yet.
                </td>
              </tr>
            ) : (
              schedules.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800">
                  <td className="border border-slate-900 px-3 py-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-900 px-3 py-2 font-bold text-slate-950">
                    {row.subject}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-medium">
                    {formatDate(row.examDate)}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-mono">
                    {row.startTime} - {row.endTime}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-mono font-bold">
                    {row.roomNumber || "Hall-A"}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Instructions */}
      <div className="border border-slate-800 p-3 mb-8 text-[11px] bg-slate-50 print:bg-transparent">
        <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-1">
          Important Rules for the Candidate:
        </h4>
        <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 leading-tight">
          <li>Candidates must arrive at the examination room 15 minutes before the scheduled time.</li>
          <li>No candidate will be allowed entry into the examination hall without this official Admit Card.</li>
          <li>Possession of mobile phones, smartwatches, or unauthorized printed material is strictly prohibited.</li>
          <li>Maintain complete silence and obey all directions given by the examination invigilator.</li>
        </ol>
      </div>

      {/* Signature Area */}
      <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs font-semibold text-slate-900">
        <div>
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold">
            Candidate&apos;s Signature
          </div>
          <span className="text-[10px] text-slate-500">(Sign in presence of staff)</span>
        </div>
        <div>
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold">
            Class Teacher Signature
          </div>
          <span className="text-[10px] text-slate-500">Identity Verified</span>
        </div>
        <div>
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold">
            Controller of Examinations
          </div>
          <span className="text-[10px] text-slate-500">{school.name}</span>
        </div>
      </div>
    </div>
  );
}
