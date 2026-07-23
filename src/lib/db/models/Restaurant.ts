import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestaurantDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  cuisineTypes: string[];
  phone: string;
  email: string;
  address: object;
  branches: mongoose.Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;
  isOpen: boolean;
  businessHours: object[];
  rating: number;
  reviewCount: number;
  deliveryTime: { min: number; max: number };
  deliveryFee: number;
  minimumOrder: number;
  subscriptionPlan: string;
  commissionRate: number;
  cacDocument?: string;
  taxId?: string;
  bankDetails?: object;
  tags: string[];
  isFeatured: boolean;
  totalOrders: number;
  totalRevenue: number;
}

const BusinessHoursSchema = new Schema({
  day: { type: String, enum: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] },
  isOpen: { type: Boolean, default: true },
  openTime: String,
  closeTime: String,
}, { _id: false });

const AddressSchema = new Schema({
  street: String, city: String, state: String, country: String,
  postalCode: String, coordinates: { lat: Number, lng: Number },
  placeId: String, formattedAddress: String,
}, { _id: false });

const RestaurantSchema = new Schema<IRestaurantDocument>({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  logo: { type: String, default: "" },
  banner: { type: String, default: "" },
  cuisineTypes: [String],
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: { type: AddressSchema, required: true },
  branches: [{ type: Schema.Types.ObjectId, ref: "RestaurantBranch" }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: false },
  businessHours: [BusinessHoursSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: { min: { type: Number, default: 20 }, max: { type: Number, default: 45 } },
  deliveryFee: { type: Number, default: 0 },
  minimumOrder: { type: Number, default: 0 },
  subscriptionPlan: { type: String, enum: ["free","basic","professional","enterprise"], default: "free" },
  commissionRate: { type: Number, default: 10 },
  cacDocument: String,
  taxId: String,
  bankDetails: Schema.Types.Mixed,
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
}, { timestamps: true });

RestaurantSchema.index({ slug: 1 });
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ "address.coordinates": "2dsphere" });
RestaurantSchema.index({ isActive: 1, isVerified: 1 });
RestaurantSchema.index({ cuisineTypes: 1 });
RestaurantSchema.index({ isFeatured: 1 });

const Restaurant: Model<IRestaurantDocument> = mongoose.models.Restaurant || mongoose.model<IRestaurantDocument>("Restaurant", RestaurantSchema);
export default Restaurant;
