import { validatePizza, validateOrder } from "../../src/domain/services/validation-service";
import { Pizza } from "../../src/domain/models";

describe("validatePizza", () => {
  it("accepts a valid pizza", () => {
    const pizza: Pizza = { size: "medium", toppings: ["mozzarella", "basil"] };
    expect(validatePizza(pizza)).toEqual({ valid: true });
  });

  it("rejects an invalid size", () => {
    const pizza = { size: "huge", toppings: ["mozzarella"] } as unknown as Pizza;
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]).toContain("Invalid size");
    }
  });

  it("rejects a pizza with no toppings", () => {
    const pizza: Pizza = { size: "small", toppings: [] };
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("A pizza must have at least one topping.");
    }
  });

  it("rejects a pizza with more than 5 toppings", () => {
    const pizza: Pizza = {
      size: "large",
      toppings: ["mozzarella", "pepperoni", "mushrooms", "onions", "peppers", "olives"],
    };
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("A pizza can have at most 5 toppings.");
    }
  });

  it("rejects pineapple with the correct message", () => {
    const pizza = { size: "medium", toppings: ["pineapple"] } as any;
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("Nice try. Pineapple is not welcome here.");
    }
  });

  it("rejects pineapple case-insensitively", () => {
    const pizza = { size: "medium", toppings: ["Pineapple"] } as any;
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("Nice try. Pineapple is not welcome here.");
    }
  });

  it("rejects an unknown topping", () => {
    const pizza = { size: "small", toppings: ["anchovies"] } as any;
    const result = validatePizza(pizza);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]).toContain('Invalid topping "anchovies"');
    }
  });
});

describe("validateOrder", () => {
  const validPizza: Pizza = { size: "medium", toppings: ["mozzarella"] };

  it("accepts an order with 1–10 valid pizzas", () => {
    expect(validateOrder([validPizza])).toEqual({ valid: true });
    expect(validateOrder(Array(10).fill(validPizza))).toEqual({ valid: true });
  });

  it("rejects an empty order", () => {
    const result = validateOrder([]);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("An order must contain at least 1 pizza.");
    }
  });

  it("rejects an order with more than 10 pizzas", () => {
    const result = validateOrder(Array(11).fill(validPizza));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("An order can contain at most 10 pizzas.");
    }
  });

  it("aggregates errors from multiple invalid pizzas", () => {
    const badPizzas = [
      { size: "small", toppings: [] } as Pizza,
      { size: "medium", toppings: ["pineapple"] } as any,
    ];
    const result = validateOrder(badPizzas);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    }
  });
});
