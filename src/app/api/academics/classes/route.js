import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET() {
  try {
    const classes = await storageService.getClasses();
    return NextResponse.json({ success: true, data: classes });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Class name is required" }, { status: 400 });
    }

    const created = await storageService.createClass(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
