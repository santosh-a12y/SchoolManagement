import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "students"; // students | fees | marks | template

    let dataToExport = [];
    let filename = `Export_${type}_${Date.now()}.xlsx`;

    if (type === "template") {
      filename = "Student_Import_Template.xlsx";
      dataToExport = [
        {
          "Admission Number": "ADM-2026-101",
          "Student Name": "John Doe",
          "Date of Birth": "2015-06-15",
          "Gender": "Male",
          "Blood Group": "B+",
          "Contact Number": "+91 98765 43210",
          "Email": "john.doe@example.com",
          "Address": "House 10, Main Street, New Delhi",
          "Academic Session": "2026-27",
          "Class": "Class 5",
          "Section": "A",
          "Roll Number": "25",
          "Admission Date": "2026-04-01",
          "Father Name": "Robert Doe",
          "Father Occupation": "Accountant",
          "Mother Name": "Mary Doe",
          "Mother Occupation": "Teacher",
          "Parent Contact": "+91 98765 43210",
          "Parent Email": "robert.doe@example.com",
          "Emergency Contact": "+91 98765 43211",
        },
      ];
    } else if (type === "students") {
      const students = await storageService.getStudents();
      dataToExport = students.map((s) => ({
        "Admission No": s.admissionNumber,
        "Student Name": s.studentName,
        "Class": s.className,
        "Section": s.section,
        "Roll No": s.rollNumber,
        "Session": s.academicSession,
        "Gender": s.gender,
        "Date of Birth": s.dateOfBirth,
        "Blood Group": s.bloodGroup || "",
        "Father Name": s.fatherName,
        "Mother Name": s.motherName,
        "Parent Phone": s.parentContact,
        "Address": s.residentialAddress,
        "Status": s.status,
        "Admission Date": s.admissionDate,
      }));
    } else if (type === "fees") {
      const payments = await storageService.getFeePayments();
      dataToExport = payments.map((p) => ({
        "Receipt No": p.receiptNumber,
        "Admission No": p.admissionNumber,
        "Student Name": p.studentName,
        "Session": p.academicSession,
        "Class": p.className,
        "Fee Category": p.feeCategory,
        "Amount Paid": p.amountPaid,
        "Payment Mode": p.paymentMode,
        "Payment Date": p.paymentDate,
        "Transaction Ref": p.transactionRef || "",
        "Received By": p.receivedBy,
        "Remarks": p.remarks || "",
      }));
    } else if (type === "marks") {
      const marks = await storageService.getMarks();
      dataToExport = marks.map((m) => ({
        "Admission No": m.admissionNumber,
        "Session": m.academicSession,
        "Exam": m.examinationName,
        "Class": m.className,
        "Section": m.section,
        "Subject": m.subject,
        "Max Marks": m.maxMarks,
        "Pass Marks": m.passMarks,
        "Marks Obtained": m.marksObtained,
        "Is Absent": m.isAbsent ? "Yes" : "No",
        "Grade": m.grade,
        "Remarks": m.remarks || "",
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
