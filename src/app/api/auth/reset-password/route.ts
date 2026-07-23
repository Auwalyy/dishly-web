import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { OTP } from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, token, password } = await req.json();

    const record = await OTP.findOne({ identifier: email, type: "password_reset", isUsed: false, expiresAt: { $gt: new Date() } });
    if (!record || record.otp !== token) return NextResponse.json(apiError("Invalid or expired reset token"), { status: 400 });

    const hashed = await hashPassword(password);
    await User.findOneAndUpdate({ email }, { password: hashed });
    await OTP.findByIdAndUpdate(record._id, { isUsed: true });

    return NextResponse.json(apiSuccess(null, "Password reset successfully"));
  } catch (error: any) {
    return NextResponse.json(apiError("Reset failed", error.message), { status: 500 });
  }
}
