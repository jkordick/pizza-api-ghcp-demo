import { Request, Response } from "express";
import { VALID_SIZES, ALLOWED_TOPPINGS, SIZE_PRICES, TOPPING_PRICE } from "../../../domain/models";

/**
 * Handles GET /menu — returns available sizes, toppings, and pricing.
 */
export function getMenu(_req: Request, res: Response): void {
  res.json({
    sizes: VALID_SIZES.map((size) => ({
      name: size,
      basePrice: SIZE_PRICES[size],
    })),
    toppings: ALLOWED_TOPPINGS,
    toppingPrice: TOPPING_PRICE,
  });
}
