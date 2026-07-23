import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validations";
import { sanitizeUser, apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(apiError("Validation failed"), { status: 400 });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) return NextResponse.json(apiError("Invalid credentials"), { status: 401 });
    if (user.isBanned) return NextResponse.json(apiError("Account suspended"), { status: 403 });
    if (!user.isActive) return NextResponse.json(apiError("Account inactive"), { status: 403 });

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json(apiError("Invalid credentials"), { status: 401 });

    const token = signToken({ userId: user._id.toString(), email, role: user.role });
    await setAuthCookie(token);

    return NextResponse.json(apiSuccess(sanitizeUser(user), "Login successful"));
  } catch (error: any) {
    return NextResponse.json(apiError("Login failed", error.message), { status: 500 });
  }
}
