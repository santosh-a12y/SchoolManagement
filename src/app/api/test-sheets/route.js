import { NextResponse } from "next/server";
import { getSheetsClient } from "@/lib/googleSheets";

export async function GET() {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient();

    // 1. First test connection and retrieve spreadsheet details & sheet tabs
    const sheetMeta = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetTitles = (sheetMeta.data.sheets || []).map(
      (s) => s.properties?.title
    );

    // 2. If 'Students' sheet tab exists, read sample rows
    let sampleData = [];
    if (sheetTitles.includes("Students")) {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Students!A1:E5",
      });
      sampleData = result.data.values ?? [];
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets!",
      spreadsheetTitle: sheetMeta.data.properties?.title,
      spreadsheetId,
      availableSheets: sheetTitles,
      studentsSample: sampleData,
    });
  } catch (error) {
    console.error("Sheets connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Google Sheets connection failed.",
        error: error.message,
        details: error.response?.data?.error || null,
      },
      { status: 500 }
    );
  }
}
