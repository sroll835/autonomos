import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../../domain/entities/Product';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]): number =>
  items.reduce((acc, item) => acc + (item.product.discountPrice ?? item.product.price) * item.quantity, 0);

/** Store del carrito de compras con persistencia */
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.product.id === product.id);
        const updated = existing
          ? items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
          : [...items, { product, quantity }];
        set({ items: updated, total: calculateTotal(updated), itemCount: updated.reduce((a, i) => a + i.quantity, 0) });
      },

      removeItem: (productId) => {
        const updated = get().items.filter((i) => i.product.id !== productId);
        set({ items: updated, total: calculateTotal(updated), itemCount: updated.reduce((a, i) => a + i.quantity, 0) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        const updated = get().items.map((i) => i.product.id === productId ? { ...i, quantity } : i);
        set({ items: updated, total: calculateTotal(updated), itemCount: updated.reduce((a, i) => a + i.quantity, 0) });
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    { name: 'cart-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
