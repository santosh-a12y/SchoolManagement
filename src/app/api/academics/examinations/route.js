import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examName = searchParams.get("examName") || searchParams.get("name") || "";
    const session = searchParams.get("session") || "";
    const className = searchParams.get("className") || "";
    const type = searchParams.get("type"); // 'schedule' | 'dependencies' | 'list'

    if (type === "dependencies") {
      const target = examName || searchParams.get("id");
      if (!target) {
        return NextResponse.json({ success: false, error: "Exam ID or name required" }, { status: 400 });
      }
      const deps = await storageService.checkExaminationDependencies(target);
      return NextResponse.json({ success: true, data: deps });
    }

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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let name = searchParams.get("name");
    let type = searchParams.get("type");
    let cascade = searchParams.get("cascade") === "true";

    try {
      const body = await request.json();
      if (body) {
        if (body.id) id = body.id;
        if (body.name) name = body.name;
        if (body.type) type = body.type;
        if (body.cascade !== undefined) cascade = Boolean(body.cascade);
      }
    } catch {}

    if (type === "schedule_item") {
      if (!id) {
        return NextResponse.json({ success: false, error: "Schedule item ID is required" }, { status: 400 });
      }
      const res = await storageService.deleteExaminationScheduleItem(id);
      return NextResponse.json({ success: true, data: res });
    }

    const target = id || name;
    if (!target) {
      return NextResponse.json({ success: false, error: "Examination ID or name is required" }, { status: 400 });
    }

    try {
      const result = await storageService.deleteExamination(target, cascade);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      if (err.message?.includes("Confirmation required")) {
        const deps = await storageService.checkExaminationDependencies(target);
        return NextResponse.json(
          {
            success: false,
            requiresConfirmation: true,
            dependencies: deps,
            error: err.message,
          },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
