import { isSolutionId, type SolutionId } from "@/data/solutions";

/**
 * MOCK order history — localStorage only, no backend. Written at checkout,
 * read by the dashboard. `productId` holds a solution id.
 */

const STORAGE_KEY = "wecare.orders";

export type OrderStatus = "processing" | "inReview" | "shipped" | "delivered";

export interface OrderLine {
  productId: SolutionId;
  quantity: number;
}

export interface Order {
  id: string;
  placedAt: string;
  lines: OrderLine[];
  totalEur: number;
  status: OrderStatus;
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (o): o is Order =>
        !!o &&
        typeof o === "object" &&
        typeof (o as Order).id === "string" &&
        Array.isArray((o as Order).lines) &&
        (o as Order).lines.every((l) => isSolutionId(l.productId)),
    );
  } catch {
    return [];
  }
}

export function addOrder(input: {
  lines: OrderLine[];
  totalEur: number;
  status: OrderStatus;
}): Order {
  const order: Order = {
    id: `WC-${Date.now().toString(36).toUpperCase()}`,
    placedAt: new Date().toISOString(),
    lines: input.lines,
    totalEur: input.totalEur,
    status: input.status,
  };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([order, ...getOrders()]),
    );
  } catch {
    /* ignore */
  }
  return order;
}
