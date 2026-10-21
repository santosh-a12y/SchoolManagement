import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { storageService } from "@/services/storageService";
import { studentSchema } from "@/lib/validators";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const commit = formData.get("commit") === "true";

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No Excel file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Excel sheet is empty. Please use the standard template." },
        { status: 400 }
      );
    }

    const existingStudents = await storageService.getStudents();
    const existingAdmissionNumbers = new Set(existingStudents.map((s) => s.admissionNumber?.trim().toLowerCase()));

    const validRecords = [];
    const invalidRecords = [];
    const seenInFile = new Set();

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // header is row 1
      const admNo = String(row.admissionNumber || row["Admission Number"] || "").trim();
      const rowErrors = [];

      if (!admNo) {
        rowErrors.push("Missing Admission Number");
      } else if (seenInFile.has(admNo.toLowerCase())) {
        rowErrors.push(`Duplicate Admission Number in this file: ${admNo}`);
      } else if (existingAdmissionNumbers.has(admNo.toLowerCase())) {
        rowErrors.push(`Admission Number ${admNo} already exists in database`);
      }

      const candidate = {
        admissionNumber: admNo,
        studentName: String(row.studentName || row["Student Name"] || "").trim(),
        dateOfBirth: String(row.dateOfBirth || row["Date of Birth"] || "2015-01-01").trim(),
        gender: String(row.gender || row["Gender"] || "Male").trim(),
        bloodGroup: String(row.bloodGroup || row["Blood Group"] || "O+").trim(),
        studentPhoto: "",
        contactNumber: String(row.contactNumber || row["Contact Number"] || "").trim(),
        email: String(row.email || row["Email"] || "").trim(),
        residentialAddress: String(row.residentialAddress || row["Address"] || "").trim(),
        academicSession: String(row.academicSession || row["Academic Session"] || "2026-27").trim(),
        className: String(row.className || row["Class"] || "Class 5").trim(),
        section: String(row.section || row["Section"] || "A").trim(),
        rollNumber: String(row.rollNumber || row["Roll Number"] || idx + 1).trim(),
        admissionDate: String(row.admissionDate || row["Admission Date"] || new Date().toISOString().split("T")[0]).trim(),
        status: "Active",
        fatherName: String(row.fatherName || row["Father Name"] || "").trim(),
        fatherOccupation: String(row.fatherOccupation || row["Father Occupation"] || "").trim(),
        motherName: String(row.motherName || row["Mother Name"] || "").trim(),
        motherOccupation: String(row.motherOccupation || row["Mother Occupation"] || "").trim(),
        guardianName: "",
        guardianRelation: "",
        parentContact: String(row.parentContact || row["Parent Contact"] || row.contactNumber || "").trim(),
        parentEmail: String(row.parentEmail || row["Parent Email"] || "").trim(),
        emergencyContact: String(row.emergencyContact || "").trim(),
      };

      const parsed = studentSchema.safeParse(candidate);
      if (!parsed.success) {
        parsed.error.errors.forEach((err) => {
          rowErrors.push(`${err.path.join(".")}: ${err.message}`);
        });
      }

      if (rowErrors.length > 0) {
        invalidRecords.push({ rowNumber, admissionNumber: admNo, errors: rowErrors, data: candidate });
      } else {
        seenInFile.add(admNo.toLowerCase());
        validRecords.push(parsed.data);
      }
    });

    // If commit is true and there are valid records, save them
    let insertedCount = 0;
    if (commit && validRecords.length > 0) {
      for (const rec of validRecords) {
        await storageService.createStudent(rec);
        insertedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      validCount: validRecords.length,
      invalidCount: invalidRecords.length,
      invalidRecords,
      previewRecords: validRecords.slice(0, 10),
      insertedCount,
      isCommitted: commit,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
