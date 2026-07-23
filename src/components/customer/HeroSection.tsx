"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown, Star, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularSearches = ["Jollof Rice", "Burgers", "Pizza", "Suya", "Shawarma", "Fried Rice"];

export default function HeroSection() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Lagos, Nigeria");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/browse?search=${encodeURIComponent(search)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="h-3.5 w-3.5" />
              Fast delivery in 30 minutes
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Delicious food,{" "}
              <span className="gradient-text">delivered fast</span>{" "}
              to your door
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Order from thousands of restaurants near you. Track your delivery in real-time and enjoy every bite.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2 mb-6">
              <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors min-w-[160px]">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">{location}</span>
                <ChevronDown className="h-3 w-3 ml-auto flex-shrink-0" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for food or restaurants..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl">Find Food</Button>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Popular:</span>
              {popularSearches.map((term) => (
                <button key={term} onClick={() => router.push(`/browse?search=${encodeURIComponent(term)}`)}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right content — floating cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block">
            <div className="relative h-[500px]">
              {/* Main food image placeholder */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl">🍔</span>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -left-8 top-16 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🍕</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Margherita Pizza</p>
                  <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /><span className="text-xs text-gray-500">4.9 (2.3k)</span></div>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -right-8 top-32 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">25 min</span>
                </div>
                <p className="text-xs text-gray-500">Estimated delivery</p>
              </motion.div>

              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-4 bottom-24 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Order delivered to</p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Adaeze O.</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
