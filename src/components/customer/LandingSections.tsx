"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Star, Clock, ChevronRight, Truck, ShieldCheck, Headphones } from "lucide-react";
import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { CUISINE_TYPES } from "@/constants";

const cuisineEmojis: Record<string, string> = {
  Nigerian: "🍲", Chinese: "🥡", Italian: "🍝", Indian: "🍛", Mexican: "🌮",
  American: "🍔", Japanese: "🍱", Thai: "🍜", Lebanese: "🥙", French: "🥐",
  Mediterranean: "🫒", African: "🌍", "Fast Food": "🍟", Healthy: "🥗",
  Vegan: "🌱", Seafood: "🦞", BBQ: "🍖", Pizza: "🍕", Burgers: "🍔",
  Sushi: "🍣", Desserts: "🍰", Bakery: "🥐", Beverages: "🧃",
};

// ---- Stats ----
const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "2K+", label: "Restaurants" },
  { value: "500+", label: "Delivery Riders" },
  { value: "4.9★", label: "Average Rating" },
];

export function StatsSection() {
  return (
    <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Categories ----
export function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Cuisine</h2>
            <p className="text-gray-500 mt-1">Find exactly what you're craving</p>
          </div>
          <Link href="/browse" className="flex items-center gap-1 text-orange-500 font-medium text-sm hover:gap-2 transition-all">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {CUISINE_TYPES.slice(0, 16).map((cuisine, i) => (
            <motion.div key={cuisine} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} viewport={{ once: true }}>
              <Link href={`/browse?cuisine=${encodeURIComponent(cuisine)}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950 border border-gray-100 dark:border-gray-700 hover:border-orange-200 transition-all group card-hover">
                <span className="text-2xl">{cuisineEmojis[cuisine] || "🍽️"}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-orange-500 transition-colors">{cuisine}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Featured Restaurants ----
export function FeaturedRestaurants() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-restaurants"],
    queryFn: async () => {
      const { data } = await axios.get("/api/restaurants?featured=true&limit=8");
      return data.data;
    },
  });

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Restaurants</h2>
            <p className="text-gray-500 mt-1">Top-rated restaurants near you</p>
          </div>
          <Link href="/browse" className="flex items-center gap-1 text-orange-500 font-medium text-sm hover:gap-2 transition-all">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            : (data || []).map((restaurant: any, i: number) => (
                <motion.div key={restaurant._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                  <Link href={`/browse/${restaurant.slug}`}>
                    <Card className="overflow-hidden card-hover cursor-pointer">
                      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-800 dark:to-gray-700">
                        {restaurant.banner && <img src={restaurant.banner} alt={restaurant.name} className="h-full w-full object-cover" />}
                        {!restaurant.isOpen && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">Closed</span>
                          </div>
                        )}
                        {restaurant.isFeatured && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{restaurant.name}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{restaurant.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{restaurant.cuisineTypes?.join(", ")}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max} min</span>
                          </div>
                          <span>{restaurant.deliveryFee === 0 ? "Free delivery" : formatCurrency(restaurant.deliveryFee)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}

// ---- How It Works ----
const steps = [
  { icon: "📍", title: "Set your location", desc: "Enter your delivery address or use GPS to find restaurants near you." },
  { icon: "🍽️", title: "Choose your meal", desc: "Browse menus, read reviews, and pick your favourite dishes." },
  { icon: "💳", title: "Pay securely", desc: "Pay with card, wallet, or cash on delivery. 100% secure checkout." },
  { icon: "🚀", title: "Track your order", desc: "Watch your order in real-time from kitchen to your doorstep." },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How Dishly Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Order your favourite food in 4 simple steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg text-3xl mb-4 mx-auto">
                {icon}
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- App Download ----
export function AppDownload() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-600 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Get the Dishly App</h2>
            <p className="text-orange-100 text-lg mb-8">Order faster, track in real-time, and get exclusive app-only deals.</p>
            <div className="flex flex-wrap gap-4">
              {[
                { store: "App Store", icon: "🍎", sub: "Download on the" },
                { store: "Google Play", icon: "▶️", sub: "Get it on" },
              ].map(({ store, icon, sub }) => (
                <button key={store} className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded-2xl transition-colors border border-white/30">
                  <span className="text-2xl">{icon}</span>
                  <div className="text-left">
                    <p className="text-xs opacity-80">{sub}</p>
                    <p className="font-semibold">{store}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-6">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "30 min average" },
              { icon: ShieldCheck, title: "Secure Payments", desc: "256-bit encryption" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center text-white">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-orange-100 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
