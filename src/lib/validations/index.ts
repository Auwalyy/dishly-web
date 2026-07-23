import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and number"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  identifier: z.string(),
  type: z.enum(["email_verification", "phone_verification", "password_reset", "delivery_confirmation"]),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  placeId: z.string().optional(),
  formattedAddress: z.string().optional(),
});

export const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine type"),
  phone: z.string().min(10, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  address: addressSchema,
  deliveryFee: z.number().min(0),
  minimumOrder: z.number().min(0),
  deliveryTime: z.object({ min: z.number(), max: z.number() }),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description required"),
  price: z.number().min(0, "Price must be positive"),
  discountPrice: z.number().min(0).optional(),
  categoryId: z.string().min(1, "Category is required"),
  preparationTime: z.number().min(1),
  stock: z.number().default(-1),
  ingredients: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const orderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    selectedVariants: z.array(z.object({ name: z.string(), option: z.string(), price: z.number() })).optional(),
    selectedExtras: z.array(z.object({ name: z.string(), option: z.string(), price: z.number() })).optional(),
    selectedSize: z.object({ label: z.string(), price: z.number() }).optional(),
    specialInstructions: z.string().optional(),
  })).min(1, "Cart is empty"),
  deliveryAddress: addressSchema,
  paymentMethod: z.enum(["wallet","stripe","flutterwave","paystack","cash_on_delivery","split","gift_card","store_credit"]),
  couponCode: z.string().optional(),
  tip: z.number().min(0).optional(),
  specialInstructions: z.string().optional(),
  scheduledFor: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  restaurantId: z.string().optional(),
  productId: z.string().optional(),
  riderId: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["percentage", "fixed", "free_delivery"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().min(1).default(100),
  perUserLimit: z.number().min(1).default(1),
  restaurantId: z.string().optional(),
  expiresAt: z.string(),
});

export const bulkOrderSchema = z.object({
  title: z.string().min(2),
  eventType: z.string().min(1),
  guestCount: z.number().min(1),
  budget: z.number().min(0),
  deliveryDate: z.string(),
  deliveryTime: z.string(),
  deliveryLocations: z.array(addressSchema).min(1),
  specialInstructions: z.string().optional(),
  restaurantId: z.string().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.number().min(100, "Minimum withdrawal is ₦100"),
  bankDetails: z.object({
    bankName: z.string().min(1),
    accountName: z.string().min(1),
    accountNumber: z.string().min(10).max(10),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BulkOrderInput = z.infer<typeof bulkOrderSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
