import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ICartItem } from "@/types";

interface CartStore {
  items: ICartItem[];
  restaurantId: string | null;
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get();
        if (restaurantId && restaurantId !== item.restaurantId) {
          // Different restaurant — replace cart
          set({ items: [item], restaurantId: item.restaurantId });
          return;
        }
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price }
                : i
            ),
          });
        } else {
          set({ items: [...items, item], restaurantId: item.restaurantId });
        }
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          restaurantId: state.items.length === 1 ? null : state.restaurantId,
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], restaurantId: null }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "dishly-cart" }
  )
);
