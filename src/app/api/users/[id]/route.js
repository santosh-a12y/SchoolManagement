import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await storageService.getUserById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await storageService.updateUser(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const deleted = await storageService.deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
