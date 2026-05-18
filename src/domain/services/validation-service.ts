import {
  Pizza,
  PizzaSize,
  Topping,
  VALID_SIZES,
  ALLOWED_TOPPINGS,
  SIZE_PRICES,
  TOPPING_PRICE,
} from "../models";

/** Result of a validation check — either valid or an array of error messages. */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Validates a single pizza against all domain rules.
 *
 * Rules:
 * - Must have exactly one valid size (small, medium, large).
 * - Must have between 1 and 5 toppings.
 * - Pineapple is forbidden.
 * - All toppings must be from the allowed list.
 */
export function validatePizza(pizza: Pizza): ValidationResult {
  const errors: string[] = [];

  if (!pizza.size || !VALID_SIZES.includes(pizza.size as PizzaSize)) {
    errors.push(
      `Invalid size "${pizza.size}". Must be one of: ${VALID_SIZES.join(", ")}.`
    );
  }

  if (!Array.isArray(pizza.toppings)) {
    errors.push("Toppings must be an array.");
    return { valid: false, errors };
  }

  if (pizza.toppings.length < 1) {
    errors.push("A pizza must have at least one topping.");
  }

  if (pizza.toppings.length > 5) {
    errors.push("A pizza can have at most 5 toppings.");
  }

  for (const topping of pizza.toppings) {
    const normalized = (topping as string).toLowerCase();
    if (normalized === "pineapple") {
      errors.push("Nice try. Pineapple is not welcome here.");
    } else if (!ALLOWED_TOPPINGS.includes(topping as Topping)) {
      errors.push(
        `Invalid topping "${topping}". Allowed: ${ALLOWED_TOPPINGS.join(", ")}.`
      );
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validates all pizzas in an order.
 *
 * Rules:
 * - An order must contain between 1 and 10 pizzas.
 * - Each pizza must pass individual validation.
 */
export function validateOrder(pizzas: Pizza[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(pizzas) || pizzas.length === 0) {
    errors.push("An order must contain at least 1 pizza.");
    return { valid: false, errors };
  }

  if (pizzas.length > 10) {
    errors.push("An order can contain at most 10 pizzas.");
  }

  pizzas.forEach((pizza, index) => {
    const result = validatePizza(pizza);
    if (!result.valid) {
      result.errors.forEach((err) => errors.push(`Pizza #${index + 1}: ${err}`));
    }
  });

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
