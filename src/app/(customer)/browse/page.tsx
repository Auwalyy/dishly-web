"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, Clock, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import { Card, Skeleton, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CUISINE_TYPES } from "@/constants";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [sortBy, setSortBy] = useState("rating");
  const [openOnly, setOpenOnly] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", search, cuisine, sortBy, openOnly, freeDelivery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (cuisine) params.set("cuisine", cuisine);
      if (openOnly) params.set("open", "true");
      params.set("sort", sortBy);
      params.set("limit", "24");
      const { data } = await axios.get(`/api/restaurants?${params}`);
      return data;
    },
  });

  const restaurants = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Search header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or dishes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400" /></button>}
            </div>
            <Button variant="outline" size="md" leftIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setShowFilters(!showFilters)}>
              Filters
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {["All", ...CUISINE_TYPES.slice(0, 12)].map((c) => (
              <button key={c}
                onClick={() => setCuisine(c === "All" ? "" : c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (c === "All" && !cuisine) || cuisine === c
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="rounded text-orange-500" />
                Open now
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)} className="rounded text-orange-500" />
                Free delivery
              </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="rating">Top Rated</option>
                <option value="deliveryFee">Delivery Fee</option>
                <option value="createdAt">Newest</option>
              </select>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isLoading ? "Loading..." : `${restaurants.length} restaurants found`}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            : restaurants.map((r: any, i: number) => (
                <motion.div key={r._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/browse/${r.slug}`}>
                    <Card className="overflow-hidden card-hover cursor-pointer h-full">
                      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-800 dark:to-gray-700">
                        {r.banner && <img src={r.banner} alt={r.name} className="h-full w-full object-cover" />}
                        {!r.isOpen && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">Closed</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {r.isFeatured && <Badge variant="default" className="text-[10px]">Featured</Badge>}
                          {r.deliveryFee === 0 && <Badge variant="success" className="text-[10px]">Free Delivery</Badge>}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{r.name}</h3>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{r.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{r.cuisineTypes?.join(" · ")}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{r.deliveryTime?.min}–{r.deliveryTime?.max} min</span>
                          </div>
                          <span className="font-medium">{r.deliveryFee === 0 ? "Free" : formatCurrency(r.deliveryFee)}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </div>

        {!isLoading && restaurants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No restaurants found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
