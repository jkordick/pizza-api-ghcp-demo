import { Pizza } from "./pizza";

/** Possible statuses for an order. */
export type OrderStatus = "pending" | "confirmed" | "delivered";

/**
 * Represents a customer order containing one or more pizzas.
 * An order must contain between 1 and 10 pizzas.
 */
export interface Order {
  /** Unique identifier for the order. */
  id: string;
  /** Customer name for the order. */
  customerName: string;
  /** List of pizzas in the order (1–10). */
  pizzas: Pizza[];
  /** Total price in euros. */
  totalPrice: number;
  /** Current status of the order. */
  status: OrderStatus;
  /** ISO timestamp of when the order was created. */
  createdAt: string;
}
