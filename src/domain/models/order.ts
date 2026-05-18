import { Pizza } from "./pizza";

/** Possible statuses for an order. */
export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

/**
 * Represents a customer order containing one or more pizzas.
 * An order must contain between 1 and 10 pizzas.
 */
export interface Order {
  /** Unique identifier for the order. */
  id: string;
  /** Customer name for the order. */
  customerName: string;
  /** Customer identifier for loyalty tracking. */
  customerId: string;
  /** List of pizzas in the order (1–10). */
  pizzas: Pizza[];
  /** Total price in euros (after any discounts). */
  totalPrice: number;
  /** Current status of the order. */
  status: OrderStatus;
  /** ISO timestamp of when the order was created. */
  createdAt: string;
  /** Points earned from this order. */
  pointsEarned: number;
  /** Points redeemed on this order (0 or 100). */
  pointsRedeemed: number;
}
