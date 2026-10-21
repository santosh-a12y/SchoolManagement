import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session") || "";
    const className = searchParams.get("className") || "";

    const structures = await storageService.getFeeStructures(session, className);
    return NextResponse.json({ success: true, data: structures });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.category || !body.amount) {
      return NextResponse.json({ success: false, error: "Category and Amount are required" }, { status: 400 });
    }

    const saved = await storageService.saveFeeStructure(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
