import { Request, Response } from "express";
import { OrderService, OrderValidationError } from "../../../domain/services";
import { LoyaltyError } from "../../../domain/services/loyalty-service";

/**
 * Factory that creates order route handlers bound to the given OrderService.
 */
export function createOrderController(orderService: OrderService) {
  return {
    /**
     * POST /orders — create a new order.
     * Expects body: { customerName: string, customerId: string, pizzas: Pizza[], redeemPoints?: boolean }
     */
    createOrder(req: Request, res: Response): void {
      try {
        const { customerName, customerId, pizzas, redeemPoints } = req.body;
        const order = orderService.createOrder(customerName, customerId, pizzas, redeemPoints ?? false);
        res.status(201).json(order);
      } catch (error) {
        if (error instanceof OrderValidationError) {
          res.status(422).json({ errors: error.errors });
          return;
        }
        if (error instanceof LoyaltyError) {
          res.status(400).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /** POST /orders/:id/cancel — cancel an order. */
    cancelOrder(req: Request, res: Response): void {
      try {
        const order = orderService.cancelOrder(req.params.id as string);
        res.json(order);
      } catch (error) {
        if (error instanceof OrderValidationError) {
          const msg = error.errors[0];
          if (msg === "Order not found") {
            res.status(404).json({ error: msg });
          } else {
            res.status(400).json({ error: msg });
          }
          return;
        }
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /** GET /orders/:id — get a single order by ID. */
    getOrderById(req: Request, res: Response): void {
      const order = orderService.getOrderById(req.params.id as string);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.json(order);
    },

    /** GET /orders — list all orders. */
    getAllOrders(_req: Request, res: Response): void {
      const orders = orderService.getAllOrders();
      res.json(orders);
    },
  };
}
