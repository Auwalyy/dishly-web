export const APP_NAME = "Dishly";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROLES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
  DELIVERY_COMPANY: "delivery_company",
  RIDER: "rider",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  assigned: "Rider Assigned",
  picked_up: "Picked Up",
  on_the_way: "On The Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_requested: "Refund Requested",
  refund_approved: "Refund Approved",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-purple-100 text-purple-800",
  assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-cyan-100 text-cyan-800",
  on_the_way: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refund_requested: "bg-pink-100 text-pink-800",
  refund_approved: "bg-lime-100 text-lime-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const LOYALTY_TIERS = {
  bronze: { label: "Bronze", minPoints: 0, color: "#CD7F32", multiplier: 1 },
  silver: { label: "Silver", minPoints: 500, color: "#C0C0C0", multiplier: 1.5 },
  gold: { label: "Gold", minPoints: 2000, color: "#FFD700", multiplier: 2 },
  diamond: { label: "Diamond", minPoints: 5000, color: "#B9F2FF", multiplier: 3 },
  vip: { label: "VIP", minPoints: 10000, color: "#FF6B6B", multiplier: 5 },
};

export const PAYMENT_METHODS = [
  { value: "wallet", label: "Wallet", icon: "Wallet" },
  { value: "stripe", label: "Card (Stripe)", icon: "CreditCard" },
  { value: "flutterwave", label: "Flutterwave", icon: "CreditCard" },
  { value: "paystack", label: "Paystack", icon: "CreditCard" },
  { value: "cash_on_delivery", label: "Cash on Delivery", icon: "Banknote" },
];

export const CUISINE_TYPES = [
  "Nigerian", "Chinese", "Italian", "Indian", "Mexican", "American",
  "Japanese", "Thai", "Lebanese", "French", "Mediterranean", "African",
  "Continental", "Fast Food", "Healthy", "Vegan", "Seafood", "BBQ",
  "Pizza", "Burgers", "Sushi", "Desserts", "Bakery", "Beverages",
];

export const VEHICLE_TYPES = [
  { value: "bicycle", label: "Bicycle" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
];

export const PAGINATION_DEFAULTS = { page: 1, limit: 20 };

export const COMMISSION_RATES = {
  platform: Number(process.env.PLATFORM_COMMISSION_RATE) || 10,
  deliveryCompany: Number(process.env.DELIVERY_COMPANY_COMMISSION_RATE) || 80,
  rider: Number(process.env.RIDER_COMMISSION_RATE) || 20,
};
