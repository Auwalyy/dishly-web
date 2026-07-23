import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import Order from "@/lib/db/models/Order";
import { Rider, DeliveryAssignment, Wallet, Transaction, Notification } from "@/lib/db/models";
import { getAuthUser } from "@/lib/auth/jwt";
import { apiError, apiSuccess, generateReference } from "@/lib/utils";
import { COMMISSION_RATES } from "@/constants";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id)
      .populate("restaurantId", "name logo phone address")
      .populate("customerId", "name phone avatar")
      .populate("deliveryAssignmentId")
      .lean();
    if (!order) return NextResponse.json(apiError("Order not found"), { status: 404 });
    return NextResponse.json(apiSuccess(order));
  } catch (error: any) {
    return NextResponse.json(apiError("Failed to fetch order", error.message), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json(apiError("Unauthorized"), { status: 401 });

    await connectDB();
    const { id } = await params;
    const { status, note } = await req.json();

    const order = await Order.findById(id);
    if (!order) return NextResponse.json(apiError("Order not found"), { status: 404 });

    const timeline = [...(order.timeline as any[]), { status, timestamp: new Date(), note, updatedBy: auth.userId }];
    const updated = await Order.findByIdAndUpdate(id, { status, timeline }, { new: true });

    // Auto-assign delivery when order is ready
    if (status === "ready") {
      const rider = await Rider.findOne({ isAvailable: true, isActive: true, isSuspended: false }).sort({ rating: -1 });
      if (rider) {
        const assignment = await DeliveryAssignment.create({
          orderId: id,
          riderId: rider._id,
          deliveryCompanyId: rider.deliveryCompanyId,
          status: "assigned",
          deliveryFee: order.deliveryFee,
          riderEarnings: order.deliveryFee * (COMMISSION_RATES.rider / 100),
          companyEarnings: order.deliveryFee * (COMMISSION_RATES.deliveryCompany / 100),
        });
        await Order.findByIdAndUpdate(id, { status: "assigned", deliveryAssignmentId: assignment._id });
        await Rider.findByIdAndUpdate(rider._id, { isAvailable: false });
      }
    }

    // Distribute earnings on delivery
    if (status === "delivered") {
      const assignment = await DeliveryAssignment.findOne({ orderId: id });
      if (assignment) {
        // Pay restaurant
        const restaurantWallet = await Wallet.findOne({ ownerId: order.restaurantId, ownerType: "vendor" });
        const restaurantEarnings = order.subtotal * (1 - COMMISSION_RATES.platform / 100);
        if (restaurantWallet) {
          await Wallet.findByIdAndUpdate(restaurantWallet._id, { $inc: { balance: restaurantEarnings } });
          await Transaction.create({ walletId: restaurantWallet._id, ownerId: order.restaurantId, type: "credit", category: "order_payment", amount: restaurantEarnings, balanceBefore: restaurantWallet.balance, balanceAfter: restaurantWallet.balance + restaurantEarnings, reference: generateReference(), description: `Earnings from order #${order.orderNumber}`, status: "completed" });
        }
        // Pay rider
        const riderWallet = await Wallet.findOne({ ownerId: assignment.riderId, ownerType: "rider" });
        if (riderWallet) {
          await Wallet.findByIdAndUpdate(riderWallet._id, { $inc: { balance: assignment.riderEarnings } });
          await Transaction.create({ walletId: riderWallet._id, ownerId: assignment.riderId, type: "credit", category: "delivery_fee", amount: assignment.riderEarnings, balanceBefore: riderWallet.balance, balanceAfter: riderWallet.balance + assignment.riderEarnings, reference: generateReference(), description: `Delivery earnings`, status: "completed" });
        }
        // Pay delivery company
        const companyWallet = await Wallet.findOne({ ownerId: assignment.deliveryCompanyId, ownerType: "delivery_company" });
        if (companyWallet) {
          await Wallet.findByIdAndUpdate(companyWallet._id, { $inc: { balance: assignment.companyEarnings } });
        }
        await DeliveryAssignment.findByIdAndUpdate(assignment._id, { status: "delivered", actualDeliveryTime: new Date() });
        await Rider.findByIdAndUpdate(assignment.riderId, { isAvailable: true, $inc: { totalDeliveries: 1 } });
      }
      // Notify customer
      await Notification.create({ userId: order.customerId, type: "order_update", title: "Order Delivered!", message: `Your order #${order.orderNumber} has been delivered.`, data: { orderId: id } });
    }

    return NextResponse.json(apiSuccess(updated, "Order updated"));
  } catch (error: any) {
    return NextResponse.json(apiError("Update failed", error.message), { status: 500 });
  }
}
