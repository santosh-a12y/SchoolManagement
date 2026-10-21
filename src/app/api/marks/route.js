import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";
import { marksRecordSchema } from "@/lib/validators";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      admissionNumber: searchParams.get("admissionNumber") || "",
      academicSession: searchParams.get("session") || "",
      examinationName: searchParams.get("examName") || "",
      className: searchParams.get("className") || "",
    };

    const records = await storageService.getMarks(filters);
    return NextResponse.json({ success: true, count: records.length, data: records });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate payload schema
    const validation = marksRecordSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const saved = await storageService.saveMarksBatch(validation.data);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
