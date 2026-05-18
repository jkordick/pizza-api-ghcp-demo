import { calculatePizzaPrice, calculateOrderTotal } from "../../src/domain/services/pricing-service";
import { Pizza } from "../../src/domain/models";

describe("calculatePizzaPrice", () => {
  it("returns base price for a small pizza with 1 topping", () => {
    const pizza: Pizza = { size: "small", toppings: ["mozzarella"] };
    expect(calculatePizzaPrice(pizza)).toBe(9.5); // 8 + 1.50
  });

  it("returns base price for a medium pizza with 2 toppings", () => {
    const pizza: Pizza = { size: "medium", toppings: ["mozzarella", "basil"] };
    expect(calculatePizzaPrice(pizza)).toBe(13); // 10 + 3
  });

  it("returns base price for a large pizza with 5 toppings", () => {
    const pizza: Pizza = {
      size: "large",
      toppings: ["mozzarella", "pepperoni", "mushrooms", "onions", "peppers"],
    };
    expect(calculatePizzaPrice(pizza)).toBe(19.5); // 12 + 7.50
  });
});

describe("calculateOrderTotal", () => {
  it("sums up prices for multiple pizzas", () => {
    const pizzas: Pizza[] = [
      { size: "small", toppings: ["mozzarella"] },          // 9.50
      { size: "large", toppings: ["pepperoni", "mushrooms"] }, // 15.00
    ];
    expect(calculateOrderTotal(pizzas)).toBe(24.5);
  });

  it("returns 0 for an empty array", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});
