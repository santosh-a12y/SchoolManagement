import { google } from "googleapis";

/**
 * Server-side Google Service Account Authentication Client
 * Secrets are ONLY read on the server side and never sent to client bundles.
 */
export function getGoogleAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    return null;
  }

  // Trim and handle surrounding quotes often added in cloud dashboards
  privateKey = privateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  // Handle newline escapes in environment variables
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    return auth;
  } catch (err) {
    console.error("Failed to initialize Google Auth Client:", err.message);
    return null;
  }
}

/**
 * Check if Google Sheets credentials are configured in environment
 */
export function isGoogleSheetsConfigured() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  return Boolean(email && privateKey && sheetId);
}
