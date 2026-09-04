import { isSolutionId, type SolutionId } from "@/data/solutions";
import type { PaymentMethodId } from "@/features/payments/payments";

/**
 * MOCK order history — no backend.
 *
 * Order metadata (id / date / lines / total / status / payment method) is kept
 * in `localStorage` so the "My orders" list survives a reload. The shipping
 * address is **not** written to `localStorage` (PO decision, Sept 2026 — real
 * customer addresses are not persisted to disk in the browser); it lives in
 * `sessionStorage` only, keyed by order id, and is merged back on read.
 *
 * A real build replaces the whole store with an authenticated, EU-hosted,
 * server-side user/order record. `wecare.orders` + `wecare.order-addresses` are
 * cleared on sign-out / account switch (see AuthContext).
 */

const STORAGE_KEY = "wecare.orders";
const ADDRESS_KEY = "wecare.order-addresses"; // sessionStorage only

export type OrderStatus = "processing" | "inReview" | "shipped" | "delivered";

export interface OrderLine {
  productId: SolutionId;
  quantity: number;
}

/** Shipping address as entered at checkout. `firstName` / `lastName` are kept
 *  as separate canonical fields (PO decision — the identity must map cleanly
 *  to the medical provider / prescription / pharmacy / invoicing downstream).
 *  `phone` is an optional delivery-contact number. */
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  placedAt: string;
  lines: OrderLine[];
  totalEur: number;
  status: OrderStatus;
  /** Rehydrated from sessionStorage on read; never stored in localStorage. */
  shipTo?: ShippingAddress;
  paymentMethod?: PaymentMethodId;
}

/** sessionStorage map: { [orderId]: ShippingAddress }. */
function readAddresses(): Record<string, ShippingAddress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ADDRESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, ShippingAddress>)
      : {};
  } catch {
    return {};
  }
}

function writeAddress(orderId: string, addr: ShippingAddress): void {
  try {
    const all = readAddresses();
    all[orderId] = addr;
    window.sessionStorage.setItem(ADDRESS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** localStorage orders only. `shipTo` is force-stripped — the address lives in
 *  sessionStorage now, and an order written by an older build may still carry a
 *  stale one. `getOrders()` re-attaches the current address. */
function readStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (o): o is Order =>
          !!o &&
          typeof o === "object" &&
          typeof (o as Order).id === "string" &&
          Array.isArray((o as Order).lines) &&
          (o as Order).lines.every((l) => isSolutionId(l.productId)),
      )
      .map(({ shipTo: _drop, ...o }) => o);
  } catch {
    return [];
  }
}

export function getOrders(): Order[] {
  const addresses = readAddresses();
  return readStoredOrders().map((o) =>
    addresses[o.id] ? { ...o, shipTo: addresses[o.id] } : o,
  );
}

export function addOrder(input: {
  lines: OrderLine[];
  totalEur: number;
  status: OrderStatus;
  shipTo?: ShippingAddress;
  paymentMethod?: PaymentMethodId;
}): Order {
  const id = `WC-${Date.now().toString(36).toUpperCase()}`;

  // Address → sessionStorage only, never into `wecare.orders`.
  if (input.shipTo) writeAddress(id, input.shipTo);

  const persisted: Order = {
    id,
    placedAt: new Date().toISOString(),
    lines: input.lines,
    totalEur: input.totalEur,
    status: input.status,
    ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
  };
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([persisted, ...readStoredOrders()]),
    );
  } catch {
    /* ignore */
  }
  return input.shipTo ? { ...persisted, shipTo: input.shipTo } : persisted;
}
