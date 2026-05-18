import { Order } from "../../domain/models";
import { OrderRepository } from "../../domain/ports";

/**
 * In-memory implementation of the OrderRepository port.
 * Stores orders in a Map for fast lookup by ID.
 */
export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  save(order: Order): Order {
    this.orders.set(order.id, order);
    return order;
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }
}
