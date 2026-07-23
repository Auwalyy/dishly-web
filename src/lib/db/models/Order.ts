import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderDocument extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  items: object[];
  status: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: mongoose.Types.ObjectId;
  couponId?: mongoose.Types.ObjectId;
  deliveryAddress: object;
  deliveryAssignmentId?: mongoose.Types.ObjectId;
  specialInstructions?: string;
  scheduledFor?: Date;
  isScheduled: boolean;
  isGroupOrder: boolean;
  groupOrderId?: mongoose.Types.ObjectId;
  isBulkOrder: boolean;
  bulkOrderId?: mongoose.Types.ObjectId;
  isCorporateOrder: boolean;
  corporateAccountId?: mongoose.Types.ObjectId;
  timeline: object[];
  refundReason?: string;
  refundAmount?: number;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  selectedVariants: [{ name: String, option: String, price: Number }],
  selectedExtras: [{ name: String, option: String, price: Number }],
  selectedSize: { label: String, price: Number },
  specialInstructions: String,
  subtotal: Number,
}, { _id: false });

const TimelineSchema = new Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { _id: false });

const AddressSchema = new Schema({
  label: String, street: String, city: String, state: String,
  country: String, postalCode: String,
  coordinates: { lat: Number, lng: Number },
  formattedAddress: String,
}, { _id: false });

const OrderSchema = new Schema<IOrderDocument>({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  branchId: { type: Schema.Types.ObjectId, ref: "RestaurantBranch" },
  items: [OrderItemSchema],
  status: { type: String, enum: ["pending","confirmed","preparing","ready","assigned","picked_up","on_the_way","delivered","cancelled","refund_requested","refund_approved","refunded"], default: "pending" },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["wallet","stripe","flutterwave","paystack","cash_on_delivery","split","gift_card","store_credit"] },
  paymentStatus: { type: String, enum: ["pending","processing","completed","failed","refunded","cancelled"], default: "pending" },
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
  deliveryAddress: AddressSchema,
  deliveryAssignmentId: { type: Schema.Types.ObjectId, ref: "DeliveryAssignment" },
  specialInstructions: String,
  scheduledFor: Date,
  isScheduled: { type: Boolean, default: false },
  isGroupOrder: { type: Boolean, default: false },
  groupOrderId: { type: Schema.Types.ObjectId, ref: "GroupOrder" },
  isBulkOrder: { type: Boolean, default: false },
  bulkOrderId: { type: Schema.Types.ObjectId, ref: "BulkOrder" },
  isCorporateOrder: { type: Boolean, default: false },
  corporateAccountId: { type: Schema.Types.ObjectId, ref: "CorporateAccount" },
  timeline: [TimelineSchema],
  refundReason: String,
  refundAmount: Number,
}, { timestamps: true });

OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryAssignmentId: 1 });

const Order: Model<IOrderDocument> = mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
export default Order;
