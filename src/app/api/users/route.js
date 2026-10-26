import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET() {
  try {
    const users = await storageService.getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: "Name and User Role are required" },
        { status: 400 }
      );
    }

    const newUser = await storageService.createUser(body);
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
