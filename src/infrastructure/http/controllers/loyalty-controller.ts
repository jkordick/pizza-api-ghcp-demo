import { Request, Response } from "express";
import { LoyaltyService } from "../../../domain/services";

/**
 * Factory that creates loyalty route handlers bound to the given LoyaltyService.
 */
export function createLoyaltyController(loyaltyService: LoyaltyService) {
  return {
    /** GET /customers/:id/points — get customer's point balance and history. */
    getPoints(req: Request, res: Response): void {
      const customerId = req.params.id as string;
      const result = loyaltyService.getCustomerPoints(customerId);
      res.json(result);
    },
  };
}
