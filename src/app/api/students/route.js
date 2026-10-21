import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";
import { studentSchema } from "@/lib/validators";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      session: searchParams.get("session") || "",
      className: searchParams.get("className") || "",
      section: searchParams.get("section") || "",
      status: searchParams.get("status") || "",
      search: searchParams.get("search") || "",
    };

    const students = await storageService.getStudents(filters);
    return NextResponse.json({ success: true, count: students.length, data: students });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request schema
    const validation = studentSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const created = await storageService.createStudent(validation.data);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
