import { Router } from "express";
import { LoyaltyService } from "../../../domain/services";
import { createLoyaltyController } from "../controllers/loyalty-controller";

export function createLoyaltyRoutes(loyaltyService: LoyaltyService): Router {
  const router = Router();
  const controller = createLoyaltyController(loyaltyService);

  router.get("/:id/points", (req, res) => controller.getPoints(req, res));

  return router;
}
