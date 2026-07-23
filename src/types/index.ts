export type UserRole = "customer" | "vendor" | "delivery_company" | "rider" | "admin" | "super_admin";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "assigned" | "picked_up" | "on_the_way" | "delivered" | "cancelled" | "refund_requested" | "refund_approved" | "refunded";
export type PaymentMethod = "wallet" | "stripe" | "flutterwave" | "paystack" | "cash_on_delivery" | "split" | "gift_card" | "store_credit";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";
export type TransactionType = "credit" | "debit";
export type TransactionCategory = "order_payment" | "order_refund" | "withdrawal" | "deposit" | "commission" | "bonus" | "referral" | "delivery_fee" | "tip" | "adjustment";
export type NotificationType = "order_update" | "payment" | "promotion" | "system" | "chat" | "delivery" | "review" | "wallet" | "referral";
export type DeliveryStatus = "pending" | "assigned" | "accepted" | "picked_up" | "on_the_way" | "delivered" | "failed" | "cancelled";
export type VehicleType = "bicycle" | "motorcycle" | "car" | "van" | "truck";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "diamond" | "vip";
export type BulkOrderStatus = "draft" | "submitted" | "quoted" | "negotiating" | "approved" | "confirmed" | "preparing" | "delivered" | "cancelled";
export type SubscriptionPlan = "free" | "basic" | "professional" | "enterprise";

export interface ICoordinates { lat: number; lng: number; }
export interface IAddress { label?: string; street: string; city: string; state: string; country: string; postalCode?: string; coordinates?: ICoordinates; placeId?: string; formattedAddress?: string; }
export interface IBusinessHours { day: "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday"; isOpen: boolean; openTime: string; closeTime: string; }
export interface IBankDetails { bankName: string; accountName: string; accountNumber: string; routingNumber?: string; swiftCode?: string; }

export interface IUser { _id: string; name: string; email: string; phone?: string; avatar?: string; role: UserRole; isEmailVerified: boolean; isPhoneVerified: boolean; isActive: boolean; isBanned: boolean; googleId?: string; referralCode: string; referredBy?: string; loyaltyPoints: number; loyaltyTier: LoyaltyTier; corporateAccountId?: string; createdAt: string; updatedAt: string; }

export interface IRestaurant { _id: string; ownerId: string; name: string; slug: string; description: string; logo: string; banner: string; cuisineTypes: string[]; phone: string; email: string; address: IAddress; branches: string[]; isVerified: boolean; isActive: boolean; isOpen: boolean; businessHours: IBusinessHours[]; rating: number; reviewCount: number; deliveryTime: { min: number; max: number }; deliveryFee: number; minimumOrder: number; subscriptionPlan: SubscriptionPlan; commissionRate: number; cacDocument?: string; bankDetails?: IBankDetails; tags: string[]; isFeatured: boolean; createdAt: string; updatedAt: string; }

export interface IRestaurantBranch { _id: string; restaurantId: string; name: string; address: IAddress; phone: string; managerId?: string; isActive: boolean; businessHours: IBusinessHours[]; createdAt: string; }

export interface IProductVariant { name: string; options: { label: string; price: number }[]; }
export interface IProductExtra { name: string; price: number; isRequired: boolean; maxSelections: number; options: { label: string; price: number }[]; }
export interface IProductSize { label: string; price: number; }
export interface INutritionFacts { calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number; }
export interface IProduct { _id: string; restaurantId: string; branchId?: string; name: string; slug: string; description: string; images: string[]; video?: string; categoryId: string; price: number; discountPrice?: number; variants: IProductVariant[]; extras: IProductExtra[]; sizes: IProductSize[]; nutritionFacts?: INutritionFacts; ingredients: string[]; preparationTime: number; calories?: number; stock: number; isAvailable: boolean; isFeatured: boolean; isTrending: boolean; isBestSeller: boolean; isRecommended: boolean; rating: number; reviewCount: number; tags: string[]; createdAt: string; updatedAt: string; }

export interface ICategory { _id: string; name: string; slug: string; icon: string; image?: string; parentId?: string; isActive: boolean; sortOrder: number; }

export interface IOrderItem { productId: string; name: string; image: string; price: number; quantity: number; selectedVariants: { name: string; option: string; price: number }[]; selectedExtras: { name: string; option: string; price: number }[]; selectedSize?: { label: string; price: number }; specialInstructions?: string; subtotal: number; }
export interface IOrderTimeline { status: OrderStatus; timestamp: string; note?: string; updatedBy?: string; }
export interface IOrder { _id: string; orderNumber: string; customerId: string; restaurantId: string; branchId?: string; items: IOrderItem[]; status: OrderStatus; subtotal: number; deliveryFee: number; tax: number; discount: number; tip: number; total: number; paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; paymentId?: string; couponId?: string; deliveryAddress: IAddress; deliveryAssignmentId?: string; specialInstructions?: string; scheduledFor?: string; isScheduled: boolean; isGroupOrder: boolean; groupOrderId?: string; isBulkOrder: boolean; bulkOrderId?: string; isCorporateOrder: boolean; corporateAccountId?: string; timeline: IOrderTimeline[]; refundReason?: string; refundAmount?: number; createdAt: string; updatedAt: string; }

export interface IDeliveryCompany { _id: string; name: string; slug: string; logo: string; email: string; phone: string; address: IAddress; isVerified: boolean; isActive: boolean; commissionRate: number; rating: number; totalDeliveries: number; bankDetails?: IBankDetails; cacDocument?: string; createdAt: string; }
export interface IRider { _id: string; userId: string; deliveryCompanyId: string; name: string; phone: string; avatar?: string; vehicleType: VehicleType; vehicleId?: string; licenseNumber: string; isAvailable: boolean; isActive: boolean; isSuspended: boolean; currentLocation?: ICoordinates; rating: number; totalDeliveries: number; acceptanceRate: number; completionRate: number; createdAt: string; }
export interface IVehicle { _id: string; riderId: string; deliveryCompanyId: string; type: VehicleType; make: string; model: string; year: number; plateNumber: string; color: string; insuranceExpiry: string; isActive: boolean; }
export interface IProofOfDelivery { photo?: string; signature?: string; otp?: string; qrCode?: string; notes?: string; timestamp: string; }
export interface IDeliveryAssignment { _id: string; orderId: string; riderId: string; deliveryCompanyId: string; status: DeliveryStatus; pickupLocation: ICoordinates; dropoffLocation: ICoordinates; estimatedDistance: number; estimatedDuration: number; actualPickupTime?: string; actualDeliveryTime?: string; deliveryFee: number; riderEarnings: number; companyEarnings: number; proofOfDelivery?: IProofOfDelivery; createdAt: string; }

export interface IWallet { _id: string; ownerId: string; ownerType: "customer"|"vendor"|"delivery_company"|"rider"|"platform"; balance: number; currency: string; isActive: boolean; createdAt: string; }
export interface ITransaction { _id: string; walletId: string; ownerId: string; type: TransactionType; category: TransactionCategory; amount: number; balanceBefore: number; balanceAfter: number; reference: string; description: string; metadata?: Record<string, unknown>; status: PaymentStatus; createdAt: string; }
export interface IPaymentSplit { method: PaymentMethod; amount: number; status: PaymentStatus; }
export interface IPayment { _id: string; orderId: string; customerId: string; method: PaymentMethod; status: PaymentStatus; amount: number; currency: string; reference: string; gatewayReference?: string; gatewayResponse?: Record<string, unknown>; splits?: IPaymentSplit[]; createdAt: string; }

export interface ICoupon { _id: string; code: string; type: "percentage"|"fixed"|"free_delivery"; value: number; minOrderAmount: number; maxDiscount?: number; usageLimit: number; usedCount: number; perUserLimit: number; restaurantId?: string; isActive: boolean; expiresAt: string; createdAt: string; }
export interface IReview { _id: string; customerId: string; orderId: string; restaurantId?: string; productId?: string; riderId?: string; rating: number; comment: string; images: string[]; isVerified: boolean; reply?: string; createdAt: string; }
export interface INotification { _id: string; userId: string; type: NotificationType; title: string; message: string; data?: Record<string, unknown>; isRead: boolean; createdAt: string; }

export interface IBulkQuotation { restaurantId: string; items: IOrderItem[]; totalAmount: number; notes?: string; validUntil: string; status: "pending"|"accepted"|"rejected"; }
export interface IBulkOrder { _id: string; customerId: string; restaurantId?: string; title: string; eventType: string; guestCount: number; budget: number; deliveryDate: string; deliveryTime: string; deliveryLocations: IAddress[]; specialInstructions?: string; status: BulkOrderStatus; quotations: IBulkQuotation[]; approvedQuotationId?: string; totalAmount?: number; paymentStatus?: PaymentStatus; createdAt: string; }

export interface IGroupParticipant { userId: string; name: string; items: IOrderItem[]; subtotal: number; joinedAt: string; }
export interface IGroupOrder { _id: string; creatorId: string; restaurantId: string; title: string; participants: IGroupParticipant[]; status: "open"|"locked"|"paid"|"cancelled"; payerId?: string; totalAmount: number; deliveryAddress: IAddress; expiresAt: string; createdAt: string; }

export interface IDepartment { _id: string; name: string; budget: number; managerId: string; employees: string[]; }
export interface ICorporateAccount { _id: string; companyName: string; adminId: string; walletId: string; monthlyBudget: number; departments: IDepartment[]; employees: string[]; isActive: boolean; createdAt: string; }

export interface ILoyaltyHistory { points: number; type: "earned"|"redeemed"|"expired"; description: string; orderId?: string; createdAt: string; }
export interface ILoyaltyPoints { _id: string; userId: string; points: number; tier: LoyaltyTier; history: ILoyaltyHistory[]; }

export interface ITicketMessage { senderId: string; message: string; attachments: string[]; createdAt: string; }
export interface ISupportTicket { _id: string; userId: string; orderId?: string; subject: string; description: string; status: "open"|"in_progress"|"resolved"|"closed"; priority: "low"|"medium"|"high"|"urgent"; messages: ITicketMessage[]; assignedTo?: string; createdAt: string; updatedAt: string; }

export interface IAuditLog { _id: string; userId: string; action: string; resource: string; resourceId?: string; changes?: Record<string, unknown>; ipAddress?: string; userAgent?: string; createdAt: string; }

export interface IPlatformSettings { platformName: string; platformFee: number; deliveryBaseFee: number; deliveryPerKmFee: number; taxRate: number; currency: string; currencySymbol: string; minOrderAmount: number; maxDeliveryRadius: number; loyaltyPointsPerNaira: number; referralBonus: number; maintenanceMode: boolean; }

export interface ApiResponse<T = unknown> { success: boolean; message: string; data?: T; error?: string; pagination?: IPagination; }
export interface IPagination { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }

export interface ICartItem { productId: string; restaurantId: string; name: string; image: string; price: number; quantity: number; selectedVariants: { name: string; option: string; price: number }[]; selectedExtras: { name: string; option: string; price: number }[]; selectedSize?: { label: string; price: number }; specialInstructions?: string; subtotal: number; }
