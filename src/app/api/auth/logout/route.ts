import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/jwt";
import { apiSuccess } from "@/lib/utils";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json(apiSuccess(null, "Logged out successfully"));
}
