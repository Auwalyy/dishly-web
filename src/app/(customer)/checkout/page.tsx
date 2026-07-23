"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MapPin, CreditCard, Wallet, Banknote, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Card, CardContent } from "@/components/ui";
import { addressSchema } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/constants";
import axios from "axios";
import { z } from "zod";

type AddressInput = z.infer<typeof addressSchema>;

const paymentIcons: Record<string, React.ReactNode> = {
  wallet: <Wallet className="h-5 w-5" />,
  stripe: <CreditCard className="h-5 w-5" />,
  flutterwave: <CreditCard className="h-5 w-5" />,
  paystack: <CreditCard className="h-5 w-5" />,
  cash_on_delivery: <Banknote className="h-5 w-5" />,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, restaurantId } = useCartStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [tip, setTip] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: user?.savedAddresses?.[0] as any,
  });

  const subtotal = getTotal();
  const deliveryFee = 500;
  const tax = subtotal * 0.075;
  const total = subtotal + deliveryFee + tax + tip;

  const onSubmit = async (address: AddressInput) => {
    setLoading(true);
    setError("");
    try {
      const orderData = {
        restaurantId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants,
          selectedExtras: item.selectedExtras,
          selectedSize: item.selectedSize,
          specialInstructions: item.specialInstructions,
        })),
        deliveryAddress: address,
        paymentMethod,
        tip,
        specialInstructions,
        scheduledFor: scheduledFor || undefined,
        deliveryFee,
        prices: Object.fromEntries(items.map((i) => [i.productId, i.price])),
      };

      const { data } = await axios.post("/api/orders", orderData);

      if (paymentMethod === "stripe") {
        const { data: payData } = await axios.post("/api/payments/stripe", { orderId: data.data._id, amount: total });
        router.push(`/checkout/payment?clientSecret=${payData.data.clientSecret}&orderId=${data.data._id}`);
        return;
      }

      if (paymentMethod === "paystack" || paymentMethod === "flutterwave") {
        const { data: payData } = await axios.post("/api/payments/initialize", { orderId: data.data._id, amount: total, provider: paymentMethod });
        window.location.href = payData.data.paymentLink;
        return;
      }

      clearCart();
      router.push(`/orders/${data.data._id}?success=true`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) { router.push("/cart"); return null; }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery address */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" /> Delivery Address
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input label="Street address" placeholder="123 Main Street" error={errors.street?.message} {...register("street")} />
                    </div>
                    <Input label="City" placeholder="Lagos" error={errors.city?.message} {...register("city")} />
                    <Input label="State" placeholder="Lagos State" error={errors.state?.message} {...register("state")} />
                    <Input label="Country" placeholder="Nigeria" error={errors.country?.message} {...register("country")} />
                    <Input label="Postal code (optional)" placeholder="100001" {...register("postalCode")} />
                  </div>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-500" /> Payment Method
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map(({ value, label }) => (
                      <button key={value} type="button" onClick={() => setPaymentMethod(value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === value
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}>
                        <span className={paymentMethod === value ? "text-orange-500" : "text-gray-400"}>
                          {paymentIcons[value]}
                        </span>
                        <span className={`text-sm font-medium ${paymentMethod === value ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"}`}>{label}</span>
                        {paymentMethod === value && <CheckCircle2 className="h-4 w-4 text-orange-500 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule & instructions */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" /> Delivery Options
                  </h2>
                  <Input label="Schedule delivery (optional)" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
                  <Textarea label="Special instructions (optional)" placeholder="Any notes for the restaurant or rider..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={3} />
                </CardContent>
              </Card>
            </div>

            {/* Order summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white flex-shrink-0 ml-2">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                    {tip > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tip</span><span>{formatCurrency(tip)}</span></div>}
                  </div>

                  {/* Tip */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add a tip</p>
                    <div className="flex gap-2">
                      {[0, 100, 200, 500].map((t) => (
                        <button key={t} type="button" onClick={() => setTip(t)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tip === t ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                          {t === 0 ? "None" : formatCurrency(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>

                  <Button type="submit" size="lg" loading={loading} className="w-full mt-6" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
