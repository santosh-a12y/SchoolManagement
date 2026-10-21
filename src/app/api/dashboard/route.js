import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";
import appConfig from "@/config/appConfig";

export async function GET() {
  try {
    const status = await storageService.getConnectionStatus();
    const activeSession = status.activeSession || appConfig.defaultSession;

    const [students, summaries, payments] = await Promise.all([
      storageService.getStudents(),
      storageService.getBatchStudentFeeSummaries(activeSession),
      storageService.getFeePayments(),
    ]);

    const activeStudents = students.filter((s) => s.status === "Active");

    const totalApplicable = summaries.reduce((sum, s) => sum + (s.totalApplicable || 0), 0);
    const totalCollected = summaries.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    const totalPending = summaries.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

    const classDistribution = {};
    students.forEach((s) => {
      const cls = s.className || "Unassigned";
      classDistribution[cls] = (classDistribution[cls] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        status,
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        activeSession,
        totalCollected,
        totalPending,
        totalApplicable,
        recentPayments: payments.slice(0, 5),
        recentStudents: students.slice(-5).reverse(),
        classDistribution,
      },
    });
  } catch (err) {
    console.error("Dashboard API aggregation error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
