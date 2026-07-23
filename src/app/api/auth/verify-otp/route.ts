import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { OTP } from "@/lib/db/models";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { otp, identifier, type } = await req.json();

    const record = await OTP.findOne({ identifier, type, isUsed: false, expiresAt: { $gt: new Date() } });
    if (!record) return NextResponse.json(apiError("Invalid or expired OTP"), { status: 400 });
    if (record.otp !== otp) return NextResponse.json(apiError("Incorrect OTP"), { status: 400 });

    await OTP.findByIdAndUpdate(record._id, { isUsed: true });

    if (type === "email_verification") {
      await User.findOneAndUpdate({ email: identifier }, { isEmailVerified: true });
    } else if (type === "phone_verification") {
      await User.findOneAndUpdate({ phone: identifier }, { isPhoneVerified: true });
    }

    return NextResponse.json(apiSuccess(null, "OTP verified successfully"));
  } catch (error: any) {
    return NextResponse.json(apiError("Verification failed", error.message), { status: 500 });
  }
}
