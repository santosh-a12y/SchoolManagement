import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function POST(req) {
  try {
    const body = await req.json();
    const identifier = body.identifier || body.emailOrUsername || body.username || body.email;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your Email / Username and Password" },
        { status: 400 }
      );
    }

    const user = await storageService.authenticateUser(identifier, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid Email/Username or Password. Please try again." },
        { status: 401 }
      );
    }

    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Your staff account has been deactivated. Please contact Administration." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An authentication error occurred" },
      { status: 500 }
    );
  }
}
