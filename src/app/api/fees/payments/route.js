import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";
import { feePaymentSchema } from "@/lib/validators";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      admissionNumber: searchParams.get("admissionNumber") || "",
      academicSession: searchParams.get("session") || "",
      className: searchParams.get("className") || "",
      receiptNumber: searchParams.get("receiptNumber") || "",
    };

    const payments = await storageService.getFeePayments(filters);
    return NextResponse.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = feePaymentSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const payment = await storageService.recordFeePayment(validation.data);
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
