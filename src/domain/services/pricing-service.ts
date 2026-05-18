import { Pizza, SIZE_PRICES, TOPPING_PRICE } from "../models";

/**
 * Calculates the price of a single pizza.
 * Base price depends on size, plus 1.50€ per topping.
 *
 * @returns Price in euros, rounded to 2 decimal places.
 */
export function calculatePizzaPrice(pizza: Pizza): number {
  const basePrice = SIZE_PRICES[pizza.size];
  const toppingsPrice = pizza.toppings.length * TOPPING_PRICE;
  return Math.round((basePrice + toppingsPrice) * 100) / 100;
}

/**
 * Calculates the total price for a list of pizzas.
 *
 * @returns Total price in euros, rounded to 2 decimal places.
 */
export function calculateOrderTotal(pizzas: Pizza[]): number {
  const total = pizzas.reduce((sum, pizza) => sum + calculatePizzaPrice(pizza), 0);
  return Math.round(total * 100) / 100;
}
