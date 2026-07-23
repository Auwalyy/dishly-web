import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { OTP } from "@/lib/db/models";
import { generateOTP, apiError, apiSuccess } from "@/lib/utils";
import { sendEmail, passwordResetTemplate } from "@/lib/notifications/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json(apiSuccess(null, "If that email exists, a reset link has been sent"));

    const otp = generateOTP();
    await OTP.deleteMany({ identifier: email, type: "password_reset" });
    await OTP.create({ identifier: email, otp, type: "password_reset", expiresAt: new Date(Date.now() + 60 * 60 * 1000) });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${otp}&email=${encodeURIComponent(email)}`;
    await sendEmail({ to: email, subject: "Reset your Dishly password", html: passwordResetTemplate(resetUrl, user.name) });

    return NextResponse.json(apiSuccess(null, "If that email exists, a reset link has been sent"));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to process request", error.message), { status: 500 });
  }
}
