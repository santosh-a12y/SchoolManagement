import { google } from "googleapis";
import { getGoogleAuthClient } from "./auth.js";

/**
 * Google Sheets Service Wrapper
 */

export const WORKSHEET_HEADERS = {
  Students: [
    "admissionNumber",
    "studentName",
    "dateOfBirth",
    "gender",
    "bloodGroup",
    "studentPhoto",
    "contactNumber",
    "email",
    "residentialAddress",
    "academicSession",
    "className",
    "section",
    "rollNumber",
    "admissionDate",
    "status",
    "fatherName",
    "fatherPhoto",
    "fatherOccupation",
    "motherName",
    "motherPhoto",
    "motherOccupation",
    "guardianName",
    "guardianRelation",
    "parentContact",
    "parentEmail",
    "emergencyContact",
    "createdAt",
    "updatedAt",
  ],
  AcademicSessions: ["id", "name", "startDate", "endDate", "isActive", "createdAt"],
  Classes: ["id", "name", "level", "sections", "createdAt"],
  Examinations: ["id", "name", "term", "weightage", "createdAt"],
  ExaminationSchedule: [
    "id",
    "examinationName",
    "academicSession",
    "className",
    "subject",
    "examDate",
    "startTime",
    "endTime",
    "roomNumber",
    "maxMarks",
    "passMarks",
  ],
  Marks: [
    "id",
    "admissionNumber",
    "academicSession",
    "examinationName",
    "className",
    "section",
    "subject",
    "maxMarks",
    "passMarks",
    "marksObtained",
    "graceMarks",
    "isGrace",
    "isAbsent",
    "grade",
    "remarks",
    "recordedAt",
  ],
  FeeStructure: [
    "id",
    "academicSession",
    "className",
    "category",
    "amount",
    "frequency",
    "dueDate",
  ],
  FeePayments: [
    "receiptNumber",
    "admissionNumber",
    "studentName",
    "academicSession",
    "className",
    "feeCategory",
    "amountPaid",
    "discountAmount",
    "discountReason",
    "paymentMode",
    "paymentDate",
    "transactionRef",
    "receivedBy",
    "remarks",
    "createdAt",
  ],
  Settings: ["key", "value", "updatedAt"],
  AuditLog: ["id", "action", "entity", "entityId", "details", "performedBy", "timestamp"],
};

/**
 * Get Google Sheets API client
 */
export function getSheetsClient() {
  const auth = getGoogleAuthClient();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

/**
 * Ensure a worksheet tab exists in the spreadsheet, creating it with default headers if not.
 */
export async function ensureWorksheetExists(sheetId, worksheetName) {
  const sheets = getSheetsClient();
  if (!sheets) throw new Error("Google Sheets client not authenticated");

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetTitles = (meta.data.sheets || []).map((s) => s.properties.title);
    if (!sheetTitles.includes(worksheetName)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: worksheetName,
                },
              },
            },
          ],
        },
      });

      const headers = WORKSHEET_HEADERS[worksheetName];
      if (headers && headers.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${worksheetName}!A1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headers] },
        });
      }
    }
    return true;
  } catch (err) {
    console.warn(`Could not verify/create sheet "${worksheetName}":`, err.message);
    return false;
  }
}

// In-memory cache to avoid Google Sheets API rate limiting (60 requests/min quota)
const memoryCache = new Map();
const CACHE_TTL_MS = 15000; // 15 seconds

export function invalidateWorksheetCache(worksheetName) {
  if (worksheetName) {
    memoryCache.delete(worksheetName);
  } else {
    memoryCache.clear();
  }
}

/**
 * Fetch all rows from a worksheet as an array of objects
 */
export async function getWorksheetData(sheetId, worksheetName) {
  // Check memory cache first
  const now = Date.now();
  const cached = memoryCache.get(worksheetName);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const sheets = getSheetsClient();
  if (!sheets) throw new Error("Google Sheets client not authenticated");

  let response;
  try {
    const range = `${worksheetName}!A1:ZZ`;
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
  } catch (err) {
    if (err.message && err.message.includes("Unable to parse range")) {
      return [];
    }
    throw err;
  }

  const rows = response.data?.values || [];
  if (rows.length === 0) {
    memoryCache.set(worksheetName, { data: [], timestamp: now });
    return [];
  }

  let headers = rows[0] || [];
  let dataRows = rows.slice(1);
  const fallbackHeaders = WORKSHEET_HEADERS[worksheetName] || [];

  // If first row is empty or looks like data (e.g. starts with ADM- or RCP-), use standard predefined headers
  const isRow0EmptyOrData =
    headers.length === 0 ||
    headers.every((h) => !h || String(h).trim() === "") ||
    String(headers[0]).startsWith("ADM-") ||
    String(headers[0]).startsWith("RCP-");

  if (isRow0EmptyOrData) {
    headers = fallbackHeaders;
    dataRows = rows.filter((r) => r && r.length > 0 && r.some((c) => c && String(c).trim() !== ""));
    // Ensure header row is written to A1 for future reads
    sheets.spreadsheets.values
      .update({
        spreadsheetId: sheetId,
        range: `${worksheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [fallbackHeaders] },
      })
      .catch((err) => console.warn("Could not write missing headers:", err.message));
  }

  const data = dataRows
    .map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        if (!header) return;
        const cleanKey = String(header).trim();
        let val = row[idx] !== undefined ? row[idx] : "";
        if (typeof val === "string" && val.startsWith("'") && (val.startsWith("'+") || val.startsWith("'="))) {
          val = val.slice(1);
        }
        obj[cleanKey] = val;
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== "" && v !== null && v !== undefined));

  // Store in cache
  memoryCache.set(worksheetName, { data, timestamp: now });
  return data;
}

function formatCellForGoogleSheets(val) {
  if (val === undefined || val === null) return "";
  const str = String(val);
  // Prevent Google Sheets formula parse error for phone numbers like +91...
  if (str.startsWith("+") || str.startsWith("=")) {
    return `'${str}`;
  }
  return str;
}

/**
 * Append a row to a worksheet with automatic header initialization
 */
export async function appendWorksheetRow(sheetId, worksheetName, rowObject) {
  const sheets = getSheetsClient();
  if (!sheets) throw new Error("Google Sheets client not authenticated");

  // Ensure sheet tab exists
  await ensureWorksheetExists(sheetId, worksheetName);

  const expectedHeaders = WORKSHEET_HEADERS[worksheetName] || Object.keys(rowObject);
  const rowValues = expectedHeaders.map((header) => {
    return formatCellForGoogleSheets(rowObject[header]);
  });

  // Check if header row exists
  const existingRange = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${worksheetName}!A1:Z1`,
  });

  const existingRow1 = existingRange.data.values?.[0] || [];
  const needsHeaders =
    existingRow1.length === 0 ||
    existingRow1.every((c) => !c || String(c).trim() === "");

  if (needsHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${worksheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [expectedHeaders, rowValues],
      },
    });
    invalidateWorksheetCache(worksheetName);
    return { success: true };
  }

  const range = `${worksheetName}!A:A`;
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rowValues],
    },
  });

  invalidateWorksheetCache(worksheetName);
  return response.data;
}

/**
 * Overwrite entire worksheet content with headers and records
 */
export async function setWorksheetData(sheetId, worksheetName, recordsArray) {
  const sheets = getSheetsClient();
  if (!sheets) throw new Error("Google Sheets client not authenticated");

  // Ensure sheet tab exists
  await ensureWorksheetExists(sheetId, worksheetName);

  const headers = WORKSHEET_HEADERS[worksheetName] || (recordsArray[0] ? Object.keys(recordsArray[0]) : []);
  const rows = [headers];

  recordsArray.forEach((item) => {
    const row = headers.map((h) => {
      return formatCellForGoogleSheets(item[h]);
    });
    rows.push(row);
  });

  const range = `${worksheetName}!A:ZZ`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range,
  });

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${worksheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });

  invalidateWorksheetCache(worksheetName);
  return response.data;
}
