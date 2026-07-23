import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Notification } from "@/lib/db/models";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess, paginateQuery, buildPaginationMeta } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const unreadOnly = searchParams.get("unread") === "true";

    const query: Record<string, any> = { userId: auth.userId };
    if (unreadOnly) query.isRead = false;

    const { skip } = paginateQuery(page, limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: auth.userId, isRead: false }),
    ]);

    return NextResponse.json(apiSuccess({ notifications, unreadCount }, "Notifications fetched", buildPaginationMeta(total, page, limit)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch notifications", error.message), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { ids, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany({ userId: auth.userId, isRead: false }, { isRead: true });
    } else if (ids?.length) {
      await Notification.updateMany({ _id: { $in: ids }, userId: auth.userId }, { isRead: true });
    }

    return NextResponse.json(apiSuccess(null, "Notifications marked as read"));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to update notifications", error.message), { status: 500 });
  }
}
