import { OrderService, OrderValidationError } from "../../src/domain/services/order-service";
import { InMemoryOrderRepository } from "../../src/infrastructure/persistence";
import { Pizza } from "../../src/domain/models";

describe("OrderService", () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(new InMemoryOrderRepository());
  });

  const validPizza: Pizza = { size: "medium", toppings: ["mozzarella", "basil"] };

  it("creates an order and assigns an ID", () => {
    const order = orderService.createOrder("Mario", [validPizza]);
    expect(order.id).toBeDefined();
    expect(order.customerName).toBe("Mario");
    expect(order.status).toBe("confirmed");
    expect(order.pizzas).toHaveLength(1);
    expect(order.totalPrice).toBe(13); // 10 + 3
  });

  it("retrieves a created order by ID", () => {
    const created = orderService.createOrder("Luigi", [validPizza]);
    const found = orderService.getOrderById(created.id);
    expect(found).toEqual(created);
  });

  it("returns undefined for a non-existent order", () => {
    expect(orderService.getOrderById("nope")).toBeUndefined();
  });

  it("lists all orders", () => {
    orderService.createOrder("Mario", [validPizza]);
    orderService.createOrder("Luigi", [validPizza, validPizza]);
    expect(orderService.getAllOrders()).toHaveLength(2);
  });

  it("throws OrderValidationError for invalid pizzas", () => {
    const badPizza = { size: "medium", toppings: ["pineapple"] } as any;
    expect(() => orderService.createOrder("Bowser", [badPizza])).toThrow(OrderValidationError);
  });

  it("throws OrderValidationError when customer name is empty", () => {
    expect(() => orderService.createOrder("", [validPizza])).toThrow(OrderValidationError);
  });
});
