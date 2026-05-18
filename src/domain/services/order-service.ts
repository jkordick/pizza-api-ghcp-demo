import { Order, Pizza } from "../models";
import { OrderRepository } from "../ports";
import { validateOrder } from "./validation-service";
import { calculateOrderTotal } from "./pricing-service";
import { LoyaltyService } from "./loyalty-service";
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
 * Depends on the OrderRepository port for persistence and LoyaltyService for points.
 */
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly loyaltyService: LoyaltyService
  ) {}

  /**
   * Creates a new order after validating all pizzas.
   * Awards loyalty points and optionally redeems points for a discount.
   *
   * @throws OrderValidationError if any domain rule is violated.
   */
  createOrder(customerName: string, customerId: string, pizzas: Pizza[], redeemPoints: boolean = false): Order {
    if (!customerName || customerName.trim().length === 0) {
      throw new OrderValidationError(["Customer name is required."]);
    }
    if (!customerId || customerId.trim().length === 0) {
      throw new OrderValidationError(["Customer ID is required."]);
    }

    const validationResult = validateOrder(pizzas);
    if (!validationResult.valid) {
      throw new OrderValidationError(validationResult.errors);
    }

    const orderId = randomUUID();
    let totalPrice = calculateOrderTotal(pizzas);
    let pointsRedeemed = 0;

    // Apply redemption discount if requested
    if (redeemPoints) {
      const discount = this.loyaltyService.redeemPoints(customerId.trim(), orderId);
      totalPrice = Math.max(0, totalPrice - discount);
      pointsRedeemed = 100;
    }

    // Award points based on final total
    const pointsEarned = this.loyaltyService.earnPoints(customerId.trim(), orderId, totalPrice);

    const order: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerId: customerId.trim(),
      pizzas,
      totalPrice,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      pointsEarned,
      pointsRedeemed,
    };

    return this.orderRepository.save(order);
  }

  /** Cancels an order and reverses loyalty points. */
  cancelOrder(orderId: string): Order {
    const order = this.orderRepository.findById(orderId);
    if (!order) {
      throw new OrderValidationError(["Order not found"]);
    }
    if (order.status === "cancelled") {
      throw new OrderValidationError(["Order is already cancelled"]);
    }

    this.loyaltyService.reverseOrderPoints(
      order.customerId,
      order.id,
      order.pointsEarned,
      order.pointsRedeemed
    );

    order.status = "cancelled";
    this.orderRepository.save(order);
    return order;
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
