import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const admissionNumber = searchParams.get("admissionNumber");
    const session = searchParams.get("session");
    const className = searchParams.get("className");

    if (admissionNumber) {
      const summary = await storageService.getStudentFeeSummary(admissionNumber, session);
      return NextResponse.json({ success: true, data: summary });
    }

    // High-performance batch pending fee analysis (0 N+1 queries)
    const validSummaries = await storageService.getBatchStudentFeeSummaries(session, className);

    const totalApplicable = validSummaries.reduce((sum, s) => sum + (s.totalApplicable || 0), 0);
    const totalCollected = validSummaries.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    const totalPending = validSummaries.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalStudents: validSummaries.length,
        totalApplicable,
        totalCollected,
        totalPending,
      },
      data: validSummaries,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
