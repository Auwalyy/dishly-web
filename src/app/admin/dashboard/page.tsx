"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Store, Truck, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, UserCheck, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

const revenueData = [
  { date: "Mon", revenue: 125000, orders: 342 },
  { date: "Tue", revenue: 148000, orders: 398 },
  { date: "Wed", revenue: 132000, orders: 356 },
  { date: "Thu", revenue: 165000, orders: 445 },
  { date: "Fri", revenue: 189000, orders: 512 },
  { date: "Sat", revenue: 210000, orders: 578 },
  { date: "Sun", revenue: 178000, orders: 489 },
];

const orderStatusData = [
  { name: "Delivered", value: 68, color: "#22c55e" },
  { name: "Preparing", value: 12, color: "#f97316" },
  { name: "On The Way", value: 10, color: "#3b82f6" },
  { name: "Cancelled", value: 7, color: "#ef4444" },
  { name: "Pending", value: 3, color: "#eab308" },
];

export default function AdminDashboard() {
  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data } = await axios.get("/api/orders?limit=8");
      return data.data;
    },
  });

  const stats = [
    { label: "Total Users", value: "124,582", change: "+2,341 this week", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "Restaurants", value: "2,847", change: "+48 this week", icon: Store, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
    { label: "Active Riders", value: "1,293", change: "+87 this week", icon: UserCheck, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Today's Revenue", value: formatCurrency(210000), change: "+18.5% vs yesterday", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Today's Orders", value: "578", change: "+12.3% vs yesterday", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
    { label: "Delivery Companies", value: "156", change: "+5 this week", icon: Truck, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Real-time platform metrics and insights</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-1.5 rounded-full">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />{change}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Weekly Revenue & Orders</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any, name: string) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Revenue" : "Orders"]} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#adminRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {orderStatusData.map(({ color }, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} />
                <Tooltip formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <a href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 font-medium">View all</a>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Order #", "Customer", "Restaurant", "Total", "Payment", "Status", "Time"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {(recentOrders || []).map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-gray-900 dark:text-white text-xs">#{order.orderNumber}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{order.customerId?.name || "—"}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{order.restaurantId?.name || "—"}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-3 text-gray-500 capitalize">{order.paymentMethod?.replace(/_/g, " ")}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{formatRelativeTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
