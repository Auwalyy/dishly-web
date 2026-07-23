"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import axios from "axios";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 500 : 0;
  const tax = subtotal * 0.075;
  const total = subtotal + deliveryFee + tax - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const { data } = await axios.post("/api/orders/validate-coupon", { code: couponCode, subtotal });
      setDiscount(data.data.discount);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some delicious food to get started</p>
          <Link href="/browse"><Button size="lg">Browse Restaurants</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <Trash2 className="h-4 w-4" /> Clear cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-2xl">🍽️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                          {item.selectedSize && <p className="text-xs text-gray-500 mt-0.5">Size: {item.selectedSize.label}</p>}
                          {item.selectedVariants?.length > 0 && (
                            <p className="text-xs text-gray-500">{item.selectedVariants.map((v) => `${v.name}: ${v.option}`).join(", ")}</p>
                          )}
                          {item.specialInstructions && <p className="text-xs text-orange-500 mt-1 italic">"{item.specialInstructions}"</p>}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-950 transition-colors">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-950 transition-colors">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                              <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (7.5%)</span><span>{formatCurrency(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} leftIcon={<Tag className="h-4 w-4" />} error={couponError} />
                    <Button variant="outline" size="md" loading={applyingCoupon} onClick={applyCoupon} className="flex-shrink-0">Apply</Button>
                  </div>
                </div>

                <Button size="lg" className="w-full mt-6" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => router.push("/checkout")}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <ShoppingBag className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <p>Free delivery on orders above {formatCurrency(5000)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
