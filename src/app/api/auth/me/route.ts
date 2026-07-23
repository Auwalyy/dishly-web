import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { getAuthUser } from "@/lib/auth/jwt";
import { sanitizeUser, apiError, apiSuccess } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json(apiError("User not found"), { status: 404 });

    return NextResponse.json(apiSuccess(sanitizeUser(user)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch user", error.message), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const body = await req.json();
    const allowed = ["name", "phone", "avatar", "savedAddresses", "pushTokens"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (body[key] !== undefined) updates[key] = body[key]; }

    const user = await User.findByIdAndUpdate(auth.userId, updates, { new: true });
    return NextResponse.json(apiSuccess(sanitizeUser(user!), "Profile updated"));
  } catch (error: any) {
    return NextResponse.json(apiError("Update failed", error.message), { status: 500 });
  }
}
