import Stripe from "stripe";
import axios from "axios";
import { generateReference } from "@/lib/utils";

// ---- Stripe ----
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

export async function createStripePaymentIntent(amount: number, currency = "ngn", metadata?: Record<string, string>) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
}

export async function verifyStripePayment(paymentIntentId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return { success: intent.status === "succeeded", data: intent };
}

// ---- Flutterwave ----
export async function initFlutterwavePayment(params: { amount: number; email: string; name: string; phone: string; orderId: string; currency?: string; }) {
  const reference = generateReference();
  const { data } = await axios.post("https://api.flutterwave.com/v3/payments", {
    tx_ref: reference,
    amount: params.amount,
    currency: params.currency || "NGN",
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify?provider=flutterwave`,
    customer: { email: params.email, name: params.name, phonenumber: params.phone },
    meta: { orderId: params.orderId },
    customizations: { title: "Dishly", logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png` },
  }, { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } });
  return { paymentLink: data.data.link, reference };
}

export async function verifyFlutterwavePayment(transactionId: string) {
  const { data } = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  });
  return { success: data.data.status === "successful", data: data.data };
}

// ---- Paystack ----
export async function initPaystackPayment(params: { amount: number; email: string; orderId: string; currency?: string; }) {
  const reference = generateReference();
  const { data } = await axios.post("https://api.paystack.co/transaction/initialize", {
    email: params.email,
    amount: Math.round(params.amount * 100),
    currency: params.currency || "NGN",
    reference,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify?provider=paystack`,
    metadata: { orderId: params.orderId },
  }, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
  return { paymentLink: data.data.authorization_url, reference };
}

export async function verifyPaystackPayment(reference: string) {
  const { data } = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  return { success: data.data.status === "success", data: data.data };
}

// ---- Payment Factory ----
export type PaymentProvider = "stripe" | "flutterwave" | "paystack";

export async function initializePayment(provider: PaymentProvider, params: {
  amount: number; email: string; name?: string; phone?: string; orderId: string; currency?: string;
}) {
  switch (provider) {
    case "stripe": return createStripePaymentIntent(params.amount, params.currency, { orderId: params.orderId });
    case "flutterwave": return initFlutterwavePayment({ ...params, name: params.name || "", phone: params.phone || "" });
    case "paystack": return initPaystackPayment(params);
    default: throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

export async function verifyPayment(provider: PaymentProvider, reference: string) {
  switch (provider) {
    case "stripe": return verifyStripePayment(reference);
    case "flutterwave": return verifyFlutterwavePayment(reference);
    case "paystack": return verifyPaystackPayment(reference);
    default: throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
