import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Restaurant from "@/lib/db/models/Restaurant";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const restaurant = await Restaurant.findById(id).populate("branches").lean();
    if (!restaurant) return NextResponse.json(apiError("Restaurant not found"), { status: 404 });
    return NextResponse.json(apiSuccess(restaurant));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch restaurant", error.message), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { id } = await params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return NextResponse.json(apiError("Not found"), { status: 404 });
    if (restaurant.ownerId.toString() !== auth.userId && !["admin","super_admin"].includes(auth.role)) {
      return NextResponse.json(apiError("Forbidden"), { status: 403 });
    }

    const body = await req.json();
    const updated = await Restaurant.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(apiSuccess(updated, "Restaurant updated"));
  } catch (error: any) {
    return NextResponse.json(apiError("Update failed", error.message), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || !["admin","super_admin"].includes(auth.role)) return NextResponse.json(apiError("Forbidden"), { status: 403 });

    await connectDB();
    const { id } = await params;
    await Restaurant.findByIdAndDelete(id);
    return NextResponse.json(apiSuccess(null, "Restaurant deleted"));
  } catch (error: any) {
    return NextResponse.json(apiError("Delete failed", error.message), { status: 500 });
  }
}
