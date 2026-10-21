import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET() {
  try {
    const settings = await storageService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updated = await storageService.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
