import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Order from "@/lib/db/models/Order";
import { Coupon, Wallet, Transaction } from "@/lib/db/models";
import { getAuthUser } from "@/lib/auth/jwt";
import { orderSchema } from "@/lib/validations";
import { generateOrderNumber, generateReference, apiError, apiSuccess, paginateQuery, buildPaginationMeta } from "@/lib/utils";
import { COMMISSION_RATES } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const status = searchParams.get("status");

    const query: Record<string, any> = {};
    if (auth.role === "customer") query.customerId = auth.userId;
    else if (auth.role === "vendor") {
      const restaurantId = searchParams.get("restaurantId");
      if (restaurantId) query.restaurantId = restaurantId;
    }
    if (status) query.status = status;

    const { skip } = paginateQuery(page, limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate("restaurantId", "name logo").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json(apiSuccess(orders, "Orders fetched", buildPaginationMeta(total, page, limit)));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch orders", error.message), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(apiError("Validation failed", parsed.error.message), { status: 400 });

    const { items, deliveryAddress, paymentMethod, couponCode, tip = 0, specialInstructions, scheduledFor, restaurantId } = parsed.data;

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const variantTotal = (item.selectedVariants || []).reduce((s, v) => s + v.price, 0);
      const extraTotal = (item.selectedExtras || []).reduce((s, e) => s + e.price, 0);
      const sizePrice = item.selectedSize?.price || 0;
      return sum + (item.quantity * (variantTotal + extraTotal + sizePrice));
    }, 0);

    // Apply coupon
    let discount = 0;
    let couponId;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
      if (coupon && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrderAmount) {
        if (coupon.type === "percentage") discount = Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount || Infinity);
        else if (coupon.type === "fixed") discount = coupon.value;
        couponId = coupon._id;
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const deliveryFee = body.deliveryFee || 500;
    const tax = subtotal * 0.075;
    const total = subtotal + deliveryFee + tax - discount + tip;

    // Handle wallet payment
    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ ownerId: auth.userId, ownerType: "customer" });
      if (!wallet || wallet.balance < total) return NextResponse.json(apiError("Insufficient wallet balance"), { status: 400 });
      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -total } });
      await Transaction.create({
        walletId: wallet._id, ownerId: auth.userId, type: "debit",
        category: "order_payment", amount: total,
        balanceBefore: wallet.balance, balanceAfter: wallet.balance - total,
        reference: generateReference(), description: `Payment for order`,
        status: "completed",
      });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber, customerId: auth.userId, restaurantId,
      items: items.map((item) => ({ ...item, subtotal: item.quantity * (body.prices?.[item.productId] || 0) })),
      status: "pending", subtotal, deliveryFee, tax, discount, tip, total,
      paymentMethod, paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "completed",
      couponId, deliveryAddress, specialInstructions,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      isScheduled: !!scheduledFor,
      timeline: [{ status: "pending", timestamp: new Date() }],
    });

    // Distribute platform commission
    const platformCommission = total * (COMMISSION_RATES.platform / 100);
    const platformWallet = await Wallet.findOne({ ownerType: "platform" });
    if (platformWallet) {
      await Wallet.findByIdAndUpdate(platformWallet._id, { $inc: { balance: platformCommission } });
    }

    return NextResponse.json(apiSuccess(order, "Order placed successfully"), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to place order", error.message), { status: 500 });
  }
}
