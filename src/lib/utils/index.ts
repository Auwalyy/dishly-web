import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DSH-${timestamp}-${random}`;
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateReference(): string {
  return `REF-${uuidv4().replace(/-/g, "").substring(0, 16).toUpperCase()}`;
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", ...options }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function calculateDeliveryFee(distanceKm: number, baseFee = 500, perKmFee = 100): number {
  return baseFee + distanceKm * perKmFee;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateLoyaltyTier(points: number): string {
  if (points >= 10000) return "vip";
  if (points >= 5000) return "diamond";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

export function paginateQuery(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

export function sanitizeUser(user: any) {
  const { password, __v, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}

export function generateOTP(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.substring(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  return `${phone.substring(0, 4)}****${phone.substring(phone.length - 3)}`;
}

export function isRestaurantOpen(businessHours: any[]): boolean {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = businessHours.find((h: any) => h.day === day);
  if (!hours || !hours.isOpen) return false;
  const [openH, openM] = hours.openTime.split(":").map(Number);
  const [closeH, closeM] = hours.closeTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function apiSuccess<T>(data: T, message = "Success", pagination?: any) {
  return { success: true, message, data, ...(pagination && { pagination }) };
}

export function apiError(message: string, error?: string) {
  return { success: false, message, error };
}
