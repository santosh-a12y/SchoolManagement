import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { uploadToDrive } from "@/lib/google/drive";
import { isGoogleSheetsConfigured } from "@/lib/google/auth";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image size must be under 2MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "jpg";
    const cleanFileName = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // If Google Drive folder is configured, attempt upload to Drive
    if (isGoogleSheetsConfigured() && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      try {
        const driveUrl = await uploadToDrive(buffer, cleanFileName, file.type);
        return NextResponse.json({ success: true, url: driveUrl, storage: "google_drive" });
      } catch (err) {
        console.warn("Drive upload failed, saving locally:", err.message);
      }
    }

    // Local file fallback
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const localFilePath = path.join(uploadsDir, cleanFileName);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${cleanFileName}`;
    return NextResponse.json({ success: true, url: publicUrl, storage: "local" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
