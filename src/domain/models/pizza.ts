/** All available pizza sizes. */
export type PizzaSize = "small" | "medium" | "large";

/** All allowed toppings — pineapple is explicitly excluded. */
export type Topping =
  | "mozzarella"
  | "pepperoni"
  | "mushrooms"
  | "onions"
  | "peppers"
  | "olives"
  | "basil"
  | "ham"
  | "salami"
  | "jalapeños";

/**
 * Represents a single pizza in an order.
 * Must have exactly one size and between 1–5 toppings.
 */
export interface Pizza {
  size: PizzaSize;
  toppings: Topping[];
}

/** All valid pizza sizes. */
export const VALID_SIZES: PizzaSize[] = ["small", "medium", "large"];

/** All allowed toppings. */
export const ALLOWED_TOPPINGS: Topping[] = [
  "mozzarella",
  "pepperoni",
  "mushrooms",
  "onions",
  "peppers",
  "olives",
  "basil",
  "ham",
  "salami",
  "jalapeños",
];

/** Price in euros for each pizza size. */
export const SIZE_PRICES: Record<PizzaSize, number> = {
  small: 8,
  medium: 10,
  large: 12,
};

/** Price in euros for each additional topping. */
export const TOPPING_PRICE = 1.5;
