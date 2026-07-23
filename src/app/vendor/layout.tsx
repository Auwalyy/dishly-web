"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, BarChart3, Settings,
  GitBranch, Users, Archive, Tag, Wallet, Star, Menu, X, Bell, ChevronDown, LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vendor/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/vendor/products", icon: Package, label: "Products" },
  { href: "/vendor/inventory", icon: Archive, label: "Inventory" },
  { href: "/vendor/branches", icon: GitBranch, label: "Branches" },
  { href: "/vendor/employees", icon: Users, label: "Employees" },
  { href: "/vendor/coupons", icon: Tag, label: "Coupons" },
  { href: "/vendor/wallet", icon: Wallet, label: "Wallet" },
  { href: "/vendor/reviews", icon: Star, label: "Reviews" },
  { href: "/vendor/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/vendor/settings", icon: Settings, label: "Settings" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
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
            className="fixed lg:relative z-50 flex flex-col w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">Dishly</span>
                <p className="text-xs text-gray-500">Vendor Portal</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link key={href} href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                    )}>
                    <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-orange-500")} />
                    {label}
                    {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500" />}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
