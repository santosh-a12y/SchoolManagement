import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";
import { studentSchema } from "@/lib/validators";

export async function GET(request, { params }) {
  try {
    const { admissionNumber } = await params;

    if (!admissionNumber || admissionNumber === "undefined" || admissionNumber === "null") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Admission Number parameter" },
        { status: 400 }
      );
    }

    const student = await storageService.getStudentByAdmissionNumber(admissionNumber);

    if (!student) {
      return NextResponse.json(
        { success: false, error: `Student with Admission No ${admissionNumber} not found` },
        { status: 404 }
      );
    }

    // Fetch marks and fees for comprehensive student profile
    const marks = await storageService.getMarks({ admissionNumber });
    const feeSummary = await storageService.getStudentFeeSummary(admissionNumber, student.academicSession);

    return NextResponse.json({
      success: true,
      data: {
        student,
        marks,
        feeSummary,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { admissionNumber } = await params;
    const body = await request.json();

    // Partial validation
    const validation = studentSchema.partial().safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const updated = await storageService.updateStudent(admissionNumber, validation.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admissionNumber } = await params;
    const archived = await storageService.deleteStudent(admissionNumber);
    return NextResponse.json({ success: true, message: `Student ${admissionNumber} archived.`, data: archived });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
