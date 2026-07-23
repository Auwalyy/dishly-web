import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export function withAuth(handler: Function, allowedRoles?: string[]) {
  return async (req: NextRequest, context?: any) => {
    const token = req.cookies.get("auth_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    try {
      const payload = verifyToken(token);
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }
      (req as any).user = payload;
      return handler(req, context);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
  };
}

export function withRateLimit(handler: Function, maxRequests = 100, windowMs = 900000) {
  const requests = new Map<string, { count: number; resetAt: number }>();
  return async (req: NextRequest, context?: any) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const record = requests.get(ip);
    if (!record || now > record.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
      }
    }
    return handler(req, context);
  };
}
