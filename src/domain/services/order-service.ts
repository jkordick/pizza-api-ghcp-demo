import { Order, Pizza } from "../models";
import { OrderRepository } from "../ports";
import { validateOrder } from "./validation-service";
import { calculateOrderTotal } from "./pricing-service";
import { randomUUID } from "crypto";

/** Error thrown when order validation fails. */
export class OrderValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join("; "));
    this.name = "OrderValidationError";
  }
}

/**
 * Application service that orchestrates order creation and retrieval.
 * Depends on the OrderRepository port for persistence.
 */
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Creates a new order after validating all pizzas.
   *
   * @throws OrderValidationError if any domain rule is violated.
   */
  createOrder(customerName: string, pizzas: Pizza[]): Order {
    if (!customerName || customerName.trim().length === 0) {
      throw new OrderValidationError(["Customer name is required."]);
    }

    const validationResult = validateOrder(pizzas);
    if (!validationResult.valid) {
      throw new OrderValidationError(validationResult.errors);
    }

    const order: Order = {
      id: randomUUID(),
      customerName: customerName.trim(),
      pizzas,
      totalPrice: calculateOrderTotal(pizzas),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    return this.orderRepository.save(order);
  }

  /** Returns an order by ID, or undefined if not found. */
  getOrderById(id: string): Order | undefined {
    return this.orderRepository.findById(id);
  }

  /** Returns all orders. */
  getAllOrders(): Order[] {
    return this.orderRepository.findAll();
  }
}
