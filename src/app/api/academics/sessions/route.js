import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET() {
  try {
    const sessions = await storageService.getAcademicSessions();
    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ success: false, error: "Session name/ID is required" }, { status: 400 });
    }

    const created = await storageService.createAcademicSession(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });
    }

    const updated = await storageService.setActiveSession(sessionId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
