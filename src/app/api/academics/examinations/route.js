import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examName = searchParams.get("examName") || "";
    const session = searchParams.get("session") || "";
    const className = searchParams.get("className") || "";
    const type = searchParams.get("type"); // 'schedule' or 'list'

    if (type === "schedule") {
      const schedule = await storageService.getExaminationSchedule(examName, session, className);
      return NextResponse.json({ success: true, data: schedule });
    }

    const examinations = await storageService.getExaminations();
    return NextResponse.json({ success: true, data: examinations });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type === "schedule_item") {
      const saved = await storageService.saveExaminationScheduleItem(body.data);
      return NextResponse.json({ success: true, data: saved }, { status: 201 });
    }

    const exam = await storageService.createExamination(body);
    return NextResponse.json({ success: true, data: exam }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
