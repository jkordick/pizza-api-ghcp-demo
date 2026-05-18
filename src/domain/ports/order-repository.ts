import { Order } from "../models";

/**
 * Port for persisting and retrieving orders.
 * Infrastructure layer must implement this interface.
 */
export interface OrderRepository {
  /** Save a new order and return it. */
  save(order: Order): Order;
  /** Find an order by its unique ID, or return undefined. */
  findById(id: string): Order | undefined;
  /** Return all orders. */
  findAll(): Order[];
}
