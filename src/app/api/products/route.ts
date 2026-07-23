import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Product from "@/lib/db/models/Product";
import { getAuthUser } from "@/lib/auth/jwt";
import { productSchema } from "@/lib/validations";
import { slugify, apiError, apiSuccess, paginateQuery, buildPaginationMeta } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const restaurantId = searchParams.get("restaurantId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured") === "true";
    const trending = searchParams.get("trending") === "true";

    const query: Record<string, any> = { isAvailable: true };
    if (restaurantId) query.restaurantId = restaurantId;
    if (categoryId) query.categoryId = categoryId;
    if (search) query.$text = { $search: search };
    if (featured) query.isFeatured = true;
    if (trending) query.isTrending = true;

    const { skip } = paginateQuery(page, limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate("categoryId", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json(apiSuccess(products, "Products fetched", buildPaginationMeta(total, page, limit)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch products", error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth || !["vendor","admin","super_admin"].includes(auth.role)) return NextResponse.json(apiError("Forbidden"), { status: 403 });

    await connectDB();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(apiError("Validation failed", parsed.error.message), { status: 400 });

    const slug = slugify(parsed.data.name);
    const product = await Product.create({ ...parsed.data, slug, restaurantId: body.restaurantId });
    return NextResponse.json(apiSuccess(product, "Product created"), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to create product", error.message), { status: 500 });
  }
}
