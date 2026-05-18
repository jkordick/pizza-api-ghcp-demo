import { Router } from "express";
import { OrderService } from "../../../domain/services";
import { createOrderController } from "../controllers/order-controller";

export function createOrderRoutes(orderService: OrderService): Router {
  const router = Router();
  const controller = createOrderController(orderService);

  router.post("/", (req, res) => controller.createOrder(req, res));
  router.get("/:id", (req, res) => controller.getOrderById(req, res));
  router.get("/", (req, res) => controller.getAllOrders(req, res));

  return router;
}
