import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Restaurant from "@/lib/db/models/Restaurant";
import { getAuthUser } from "@/lib/auth/jwt";
import { restaurantSchema } from "@/lib/validations";
import { slugify, apiError, apiSuccess, paginateQuery, buildPaginationMeta } from "@/lib/utils";
import { Wallet } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const featured = searchParams.get("featured") === "true";
    const open = searchParams.get("open") === "true";
    const sort = searchParams.get("sort") || "createdAt";

    const query: Record<string, any> = { isActive: true, isVerified: true };
    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisineTypes = cuisine;
    if (featured) query.isFeatured = true;
    if (open) query.isOpen = true;

    const { skip } = paginateQuery(page, limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort({ [sort]: -1 }).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(query),
    ]);

    return NextResponse.json(apiSuccess(restaurants, "Restaurants fetched", buildPaginationMeta(total, page, limit)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch restaurants", error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const body = await req.json();
    const parsed = restaurantSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(apiError("Validation failed", parsed.error.message), { status: 400 });

    const slug = slugify(parsed.data.name);
    const existing = await Restaurant.findOne({ slug });
    if (existing) return NextResponse.json(apiError("Restaurant name already taken"), { status: 409 });

    const restaurant = await Restaurant.create({ ...parsed.data, slug, ownerId: auth.userId });
    await Wallet.create({ ownerId: restaurant._id, ownerType: "vendor" });

    return NextResponse.json(apiSuccess(restaurant, "Restaurant created"), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to create restaurant", error.message), { status: 500 });
  }
}
