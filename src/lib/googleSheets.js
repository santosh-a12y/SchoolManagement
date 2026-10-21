
import { google } from "googleapis";

export async function getSheetsClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !privateKey || !spreadsheetId) {
        throw new Error("Google Sheets environment variables are missing.");
    }

    privateKey = privateKey.trim();
    if (
        (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
        privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: privateKey,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();

    return {
        sheets: google.sheets({ version: "v4", auth: client }),
        spreadsheetId,
    };
}
