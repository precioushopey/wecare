import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { isSolutionId, SOLUTION_BY_ID, type SolutionId } from "@/data/solutions";

const STORAGE_KEY = "wecare.cart";

/** `productId` holds a solution id; `quantity` is grams. */
export interface CartItem {
  productId: SolutionId;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  /** total grams across the cart */
  count: number;
  /** number of distinct solutions in the cart — for the header badge */
  lineCount: number;
  subtotalEur: number;
  /** every solution is prescription-only */
  hasPrescriptionItem: boolean;
  add: (id: SolutionId, quantity?: number) => void;
  setQuantity: (id: SolutionId, quantity: number) => void;
  remove: (id: SolutionId) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is CartItem =>
          !!i &&
          typeof i === "object" &&
          isSolutionId((i as CartItem).productId) &&
          Number.isFinite((i as CartItem).quantity),
      )
      .map((i) => ({
        productId: i.productId,
        quantity: Math.max(1, Math.floor(i.quantity)),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((id: SolutionId, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === id);
      if (existing) {
        return prev.map((i) =>
          i.productId === id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { productId: id, quantity }];
    });
  }, []);

  const setQuantity = useCallback((id: SolutionId, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== id)
        : prev.map((i) => (i.productId === id ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((id: SolutionId) => {
    setItems((prev) => prev.filter((i) => i.productId !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalEur = items.reduce(
      (sum, i) => sum + SOLUTION_BY_ID[i.productId].priceEur * i.quantity,
      0,
    );
    return {
      items,
      count,
      lineCount: items.length,
      subtotalEur,
      hasPrescriptionItem: items.length > 0,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [items, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
