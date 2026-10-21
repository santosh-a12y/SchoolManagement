import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET() {
  try {
    const status = await storageService.getConnectionStatus();
    return NextResponse.json(
      { success: true, ...status },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
