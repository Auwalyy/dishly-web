import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/", "/browse", "/login", "/register", "/forgot-password", "/reset-password", "/verify-otp", "/verify-email"];
const VENDOR_PATHS = ["/vendor"];
const DELIVERY_PATHS = ["/delivery"];
const RIDER_PATHS = ["/rider"];
const ADMIN_PATHS = ["/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/browse") || pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes("."));
  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url));
  }

  try {
    const payload = verifyToken(token);

    if (VENDOR_PATHS.some((p) => pathname.startsWith(p)) && !["vendor","admin","super_admin"].includes(payload.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (DELIVERY_PATHS.some((p) => pathname.startsWith(p)) && !["delivery_company","admin","super_admin"].includes(payload.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (RIDER_PATHS.some((p) => pathname.startsWith(p)) && !["rider","admin","super_admin"].includes(payload.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !["admin","super_admin"].includes(payload.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
