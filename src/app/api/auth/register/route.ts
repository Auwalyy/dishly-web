import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { Wallet, LoyaltyPoints, OTP } from "@/lib/db/models";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth/jwt";
import { registerSchema } from "@/lib/validations";
import { generateReferralCode, generateOTP, sanitizeUser, apiError, apiSuccess } from "@/lib/utils";
import { sendEmail, otpEmailTemplate } from "@/lib/notifications/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(apiError("Validation failed", parsed.error.message), { status: 400 });

    const { name, email, password, phone, referralCode } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json(apiError("Email already registered"), { status: 409 });

    const hashedPassword = await hashPassword(password);
    const newReferralCode = generateReferralCode();

    let referredBy;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    const user = await User.create({ name, email, phone, password: hashedPassword, referralCode: newReferralCode, referredBy, role: "customer" });

    await Wallet.create({ ownerId: user._id, ownerType: "customer" });
    await LoyaltyPoints.create({ userId: user._id });

    const otp = generateOTP();
    await OTP.create({ identifier: email, otp, type: "email_verification", expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendEmail({ to: email, subject: "Verify your Dishly account", html: otpEmailTemplate(otp, name) });

    const token = signToken({ userId: user._id.toString(), email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json(apiSuccess(sanitizeUser(user), "Registration successful"), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(apiError("Registration failed", error.message), { status: 500 });
  }
}
