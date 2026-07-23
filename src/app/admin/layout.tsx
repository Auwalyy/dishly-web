"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Store, Truck, UserCheck, ShoppingBag,
  CreditCard, Wallet, BarChart3, Settings, Tag, Image, LifeBuoy,
  FileText, Shield, Menu, X, Bell, LogOut, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import axios from "axios";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/admin/reports", icon: FileText, label: "Reports" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/restaurants", icon: Store, label: "Restaurants" },
      { href: "/admin/delivery-companies", icon: Truck, label: "Delivery Companies" },
      { href: "/admin/riders", icon: UserCheck, label: "Riders" },
      { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/payments", icon: CreditCard, label: "Payments" },
      { href: "/admin/wallets", icon: Wallet, label: "Wallets" },
      { href: "/admin/coupons", icon: Tag, label: "Coupons" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/banners", icon: Image, label: "Banners" },
      { href: "/admin/support", icon: LifeBuoy, label: "Support" },
      { href: "/admin/audit-logs", icon: Shield, label: "Audit Logs" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    clearUser();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative z-50 flex flex-col w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 overflow-y-auto"
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Dishly</span>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-6">
              {navGroups.map(({ label, items }) => (
                <div key={label}>
                  <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                  <div className="space-y-0.5">
                    {items.map(({ href, icon: Icon, label: itemLabel }) => {
                      const active = pathname === href || pathname.startsWith(href + "/");
                      return (
                        <Link key={href} href={href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            active
                              ? "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}>
                          <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-orange-500")} />
                          {itemLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-orange-500 font-medium">Super Admin</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
