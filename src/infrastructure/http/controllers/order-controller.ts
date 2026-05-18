import { Request, Response } from "express";
import { OrderService, OrderValidationError } from "../../../domain/services";

/**
 * Factory that creates order route handlers bound to the given OrderService.
 */
export function createOrderController(orderService: OrderService) {
  return {
    /**
     * POST /orders — create a new order.
     * Expects body: { customerName: string, pizzas: Pizza[] }
     */
    createOrder(req: Request, res: Response): void {
      try {
        const { customerName, pizzas } = req.body;
        const order = orderService.createOrder(customerName, pizzas);
        res.status(201).json(order);
      } catch (error) {
        if (error instanceof OrderValidationError) {
          res.status(422).json({ errors: error.errors });
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
