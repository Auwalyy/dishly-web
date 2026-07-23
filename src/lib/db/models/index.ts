import mongoose, { Schema, Model } from "mongoose";

// ---- Wallet ----
const WalletSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ["customer","vendor","delivery_company","rider","platform"], required: true },
  balance: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "NGN" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
WalletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
export const Wallet: Model<any> = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

// ---- Transaction ----
const TransactionSchema = new Schema({
  walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
  ownerId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ["credit","debit"], required: true },
  category: { type: String, enum: ["order_payment","order_refund","withdrawal","deposit","commission","bonus","referral","delivery_fee","tip","adjustment"], required: true },
  amount: { type: Number, required: true, min: 0 },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  status: { type: String, enum: ["pending","processing","completed","failed","refunded","cancelled"], default: "completed" },
}, { timestamps: true });
TransactionSchema.index({ walletId: 1, createdAt: -1 });
TransactionSchema.index({ ownerId: 1 });
TransactionSchema.index({ reference: 1 });
export const Transaction: Model<any> = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

// ---- Payment ----
const PaymentSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  method: { type: String, enum: ["wallet","stripe","flutterwave","paystack","cash_on_delivery","split","gift_card","store_credit"] },
  status: { type: String, enum: ["pending","processing","completed","failed","refunded","cancelled"], default: "pending" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  reference: { type: String, required: true, unique: true },
  gatewayReference: String,
  gatewayResponse: Schema.Types.Mixed,
  splits: [{ method: String, amount: Number, status: String }],
}, { timestamps: true });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ reference: 1 });
export const Payment: Model<any> = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

// ---- Category ----
const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  icon: { type: String, default: "" },
  image: String,
  parentId: { type: Schema.Types.ObjectId, ref: "Category" },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
export const Category: Model<any> = mongoose.models.Category || mongoose.model("Category", CategorySchema);

// ---- DeliveryCompany ----
const DeliveryCompanySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: String,
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: Schema.Types.Mixed,
  ownerId: { type: Schema.Types.ObjectId, ref: "User" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  commissionRate: { type: Number, default: 80 },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  bankDetails: Schema.Types.Mixed,
  cacDocument: String,
}, { timestamps: true });
export const DeliveryCompany: Model<any> = mongoose.models.DeliveryCompany || mongoose.model("DeliveryCompany", DeliveryCompanySchema);

// ---- Rider ----
const RiderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "DeliveryCompany", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  avatar: String,
  vehicleType: { type: String, enum: ["bicycle","motorcycle","car","van","truck"] },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  licenseNumber: String,
  isAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  currentLocation: { lat: Number, lng: Number },
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 100 },
  completionRate: { type: Number, default: 100 },
}, { timestamps: true });
RiderSchema.index({ deliveryCompanyId: 1 });
RiderSchema.index({ isAvailable: 1, isActive: 1 });
RiderSchema.index({ "currentLocation": "2dsphere" });
export const Rider: Model<any> = mongoose.models.Rider || mongoose.model("Rider", RiderSchema);

// ---- Vehicle ----
const VehicleSchema = new Schema({
  riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
  deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "DeliveryCompany" },
  type: { type: String, enum: ["bicycle","motorcycle","car","van","truck"] },
  make: String, model: String, year: Number,
  plateNumber: { type: String, required: true },
  color: String,
  insuranceExpiry: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Vehicle: Model<any> = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);

// ---- DeliveryAssignment ----
const DeliveryAssignmentSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
  deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "DeliveryCompany" },
  status: { type: String, enum: ["pending","assigned","accepted","picked_up","on_the_way","delivered","failed","cancelled"], default: "pending" },
  pickupLocation: { lat: Number, lng: Number },
  dropoffLocation: { lat: Number, lng: Number },
  estimatedDistance: Number,
  estimatedDuration: Number,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  deliveryFee: Number,
  riderEarnings: Number,
  companyEarnings: Number,
  proofOfDelivery: { photo: String, signature: String, otp: String, qrCode: String, notes: String, timestamp: Date },
}, { timestamps: true });
DeliveryAssignmentSchema.index({ orderId: 1 });
DeliveryAssignmentSchema.index({ riderId: 1, status: 1 });
export const DeliveryAssignment: Model<any> = mongoose.models.DeliveryAssignment || mongoose.model("DeliveryAssignment", DeliveryAssignmentSchema);

// ---- Notification ----
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["order_update","payment","promotion","system","chat","delivery","review","wallet","referral"] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
export const Notification: Model<any> = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// ---- OTP ----
const OTPSchema = new Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["email_verification","phone_verification","password_reset","delivery_confirmation"], required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });
OTPSchema.index({ identifier: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OTP: Model<any> = mongoose.models.OTP || mongoose.model("OTP", OTPSchema);

// ---- Coupon ----
const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percentage","fixed","free_delivery"], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
export const Coupon: Model<any> = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

// ---- Review ----
const ReviewSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [String],
  isVerified: { type: Boolean, default: false },
  reply: String,
}, { timestamps: true });
ReviewSchema.index({ restaurantId: 1 });
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ customerId: 1 });
export const Review: Model<any> = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

// ---- Favorite ----
const FavoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["restaurant","product"], required: true },
  itemId: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });
FavoriteSchema.index({ userId: 1, type: 1 });
FavoriteSchema.index({ userId: 1, itemId: 1 }, { unique: true });
export const Favorite: Model<any> = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

// ---- LoyaltyPoints ----
const LoyaltySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ["bronze","silver","gold","diamond","vip"], default: "bronze" },
  history: [{ points: Number, type: { type: String, enum: ["earned","redeemed","expired"] }, description: String, orderId: Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });
export const LoyaltyPoints: Model<any> = mongoose.models.LoyaltyPoints || mongoose.model("LoyaltyPoints", LoyaltySchema);

// ---- AuditLog ----
const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: Schema.Types.ObjectId,
  changes: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
export const AuditLog: Model<any> = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

// ---- SupportTicket ----
const SupportTicketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open","in_progress","resolved","closed"], default: "open" },
  priority: { type: String, enum: ["low","medium","high","urgent"], default: "medium" },
  messages: [{ senderId: Schema.Types.ObjectId, message: String, attachments: [String], createdAt: { type: Date, default: Date.now } }],
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export const SupportTicket: Model<any> = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);

// ---- BulkOrder ----
const BulkOrderSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
  title: { type: String, required: true },
  eventType: String,
  guestCount: Number,
  budget: Number,
  deliveryDate: Date,
  deliveryTime: String,
  deliveryLocations: [Schema.Types.Mixed],
  specialInstructions: String,
  status: { type: String, enum: ["draft","submitted","quoted","negotiating","approved","confirmed","preparing","delivered","cancelled"], default: "draft" },
  quotations: [Schema.Types.Mixed],
  approvedQuotationId: Schema.Types.ObjectId,
  totalAmount: Number,
  paymentStatus: String,
}, { timestamps: true });
export const BulkOrder: Model<any> = mongoose.models.BulkOrder || mongoose.model("BulkOrder", BulkOrderSchema);

// ---- GroupOrder ----
const GroupOrderSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  title: String,
  participants: [{ userId: Schema.Types.ObjectId, name: String, items: [Schema.Types.Mixed], subtotal: Number, joinedAt: { type: Date, default: Date.now } }],
  status: { type: String, enum: ["open","locked","paid","cancelled"], default: "open" },
  payerId: { type: Schema.Types.ObjectId, ref: "User" },
  totalAmount: { type: Number, default: 0 },
  deliveryAddress: Schema.Types.Mixed,
  expiresAt: Date,
}, { timestamps: true });
export const GroupOrder: Model<any> = mongoose.models.GroupOrder || mongoose.model("GroupOrder", GroupOrderSchema);

// ---- CorporateAccount ----
const CorporateAccountSchema = new Schema({
  companyName: { type: String, required: true },
  adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
  monthlyBudget: { type: Number, default: 0 },
  departments: [{ name: String, budget: Number, managerId: Schema.Types.ObjectId, employees: [Schema.Types.ObjectId] }],
  employees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const CorporateAccount: Model<any> = mongoose.models.CorporateAccount || mongoose.model("CorporateAccount", CorporateAccountSchema);

// ---- RestaurantBranch ----
const BranchSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  name: { type: String, required: true },
  address: Schema.Types.Mixed,
  phone: String,
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  businessHours: [Schema.Types.Mixed],
}, { timestamps: true });
export const RestaurantBranch: Model<any> = mongoose.models.RestaurantBranch || mongoose.model("RestaurantBranch", BranchSchema);

// ---- GiftCard ----
const GiftCardSchema = new Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  purchasedBy: { type: Schema.Types.ObjectId, ref: "User" },
  redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
}, { timestamps: true });
export const GiftCard: Model<any> = mongoose.models.GiftCard || mongoose.model("GiftCard", GiftCardSchema);

// ---- Banner ----
const BannerSchema = new Schema({
  title: String,
  image: { type: String, required: true },
  link: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startsAt: Date,
  endsAt: Date,
}, { timestamps: true });
export const Banner: Model<any> = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);

// ---- Settings ----
const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
  group: String,
}, { timestamps: true });
export const Settings: Model<any> = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
