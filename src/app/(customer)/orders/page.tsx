"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, RotateCcw } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, Badge, Skeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants";

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await axios.get("/api/orders?limit=50");
      return data.data;
    },
  });

  const orders = data || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <Link href="/browse"><Button>Start Ordering</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any, i: number) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/orders/${order._id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-orange-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                                {ORDER_STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.restaurantId?.name || "Restaurant"}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-gray-500 mt-1">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                          {order.status === "delivered" && (
                            <button className="mt-2 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                              <RotateCcw className="h-3 w-3" /> Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
