import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Wallet, Transaction } from "@/lib/db/models";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess, generateReference, paginateQuery, buildPaginationMeta } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const wallet = await Wallet.findOne({ ownerId: auth.userId });
    if (!wallet) return NextResponse.json(apiError("Wallet not found"), { status: 404 });

    const { skip } = paginateQuery(page, limit);
    const [transactions, total] = await Promise.all([
      Transaction.find({ walletId: wallet._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments({ walletId: wallet._id }),
    ]);

    return NextResponse.json(apiSuccess({ wallet, transactions }, "Wallet fetched", buildPaginationMeta(total, page, limit)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch wallet", error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { action, amount } = await req.json();

    const wallet = await Wallet.findOne({ ownerId: auth.userId });
    if (!wallet) return NextResponse.json(apiError("Wallet not found"), { status: 404 });

    if (action === "deposit") {
      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: amount } });
      await Transaction.create({
        walletId: wallet._id, ownerId: auth.userId, type: "credit",
        category: "deposit", amount, balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount, reference: generateReference(),
        description: "Wallet top-up", status: "completed",
      });
      return NextResponse.json(apiSuccess(null, "Wallet funded successfully"));
    }

    if (action === "withdraw") {
      if (wallet.balance < amount) return NextResponse.json(apiError("Insufficient balance"), { status: 400 });
      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -amount } });
      await Transaction.create({
        walletId: wallet._id, ownerId: auth.userId, type: "debit",
        category: "withdrawal", amount, balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount, reference: generateReference(),
        description: "Withdrawal request", status: "pending",
      });
      return NextResponse.json(apiSuccess(null, "Withdrawal initiated"));
    }

    return NextResponse.json(apiError("Invalid action"), { status: 400 });
  } catch (error: any) {
    return NextResponse.json(apiError("Wallet operation failed", error.message), { status: 500 });
  }
}
