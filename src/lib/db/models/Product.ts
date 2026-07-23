import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  images: string[];
  video?: string;
  categoryId: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  variants: object[];
  extras: object[];
  sizes: object[];
  nutritionFacts?: object;
  ingredients: string[];
  preparationTime: number;
  calories?: number;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isRecommended: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  totalOrders: number;
}

const VariantOptionSchema = new Schema({ label: String, price: Number }, { _id: false });
const VariantSchema = new Schema({ name: String, options: [VariantOptionSchema] }, { _id: false });
const ExtraSchema = new Schema({ name: String, price: Number, isRequired: Boolean, maxSelections: Number, options: [VariantOptionSchema] }, { _id: false });
const SizeSchema = new Schema({ label: String, price: Number }, { _id: false });
const NutritionSchema = new Schema({ calories: Number, protein: Number, carbs: Number, fat: Number, fiber: Number, sodium: Number }, { _id: false });

const ProductSchema = new Schema<IProductDocument>({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  branchId: { type: Schema.Types.ObjectId, ref: "RestaurantBranch" },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  description: { type: String, required: true },
  images: [String],
  video: String,
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  variants: [VariantSchema],
  extras: [ExtraSchema],
  sizes: [SizeSchema],
  nutritionFacts: NutritionSchema,
  ingredients: [String],
  preparationTime: { type: Number, default: 15 },
  calories: Number,
  stock: { type: Number, default: -1 },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ restaurantId: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ slug: 1, restaurantId: 1 }, { unique: true });
ProductSchema.index({ isAvailable: 1, isFeatured: 1 });
ProductSchema.index({ name: "text", description: "text", tags: "text" });

const Product: Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
export default Product;
