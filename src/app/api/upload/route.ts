import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { uploadImage } from "@/lib/storage/cloudinary";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "dishly";

    if (!file) return NextResponse.json(apiError("No file provided"), { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json(apiError("File too large (max 10MB)"), { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(base64, folder);
    return NextResponse.json(apiSuccess(result, "File uploaded successfully"));
  } catch (error: any) {
    return NextResponse.json(apiError("Upload failed", error.message), { status: 500 });
  }
}
