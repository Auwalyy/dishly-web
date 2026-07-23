import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  googleId?: string;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  loyaltyPoints: number;
  loyaltyTier: string;
  corporateAccountId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  savedAddresses: object[];
  savedCards: object[];
  pushTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  label: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: String,
  coordinates: { lat: Number, lng: Number },
  placeId: String,
  formattedAddress: String,
}, { _id: true });

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, sparse: true },
  password: { type: String, select: false },
  avatar: String,
  role: { type: String, enum: ["customer","vendor","delivery_company","rider","admin","super_admin"], default: "customer" },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  googleId: { type: String, sparse: true },
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: "User" },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ["bronze","silver","gold","diamond","vip"], default: "bronze" },
  corporateAccountId: { type: Schema.Types.ObjectId, ref: "CorporateAccount" },
  departmentId: { type: Schema.Types.ObjectId },
  savedAddresses: [AddressSchema],
  savedCards: [{ type: Schema.Types.Mixed }],
  pushTokens: [String],
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ referralCode: 1 });

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
export default User;
