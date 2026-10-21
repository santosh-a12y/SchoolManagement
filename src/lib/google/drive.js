import { google } from "googleapis";
import { getGoogleAuthClient } from "./auth";
import stream from "stream";

/**
 * Upload student or parent photo to Google Drive
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {Promise<string>} Web view link / file direct URL
 */
export async function uploadToDrive(buffer, filename, mimeType = "image/jpeg") {
  const auth = getGoogleAuthClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!auth) {
    throw new Error("Google Drive auth not configured");
  }

  const drive = google.drive({ version: "v3", auth });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const fileMetadata = {
    name: filename,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType,
    body: bufferStream,
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, webViewLink, webContentLink, thumbnailLink",
  });

  // Make file publicly readable
  try {
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  } catch (err) {
    console.warn("Could not set Drive file public permission:", err.message);
  }

  return `https://drive.google.com/uc?id=${file.data.id}&export=view`;
}
