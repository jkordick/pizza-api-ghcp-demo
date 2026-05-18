import { OrderService, OrderValidationError } from "../../src/domain/services/order-service";
import { LoyaltyService } from "../../src/domain/services/loyalty-service";
import { InMemoryOrderRepository } from "../../src/infrastructure/persistence";
import { InMemoryLoyaltyRepository } from "../../src/infrastructure/persistence/in-memory-loyalty-repository";
import { Pizza } from "../../src/domain/models";

describe("OrderService", () => {
  let orderService: OrderService;

  beforeEach(() => {
    const loyaltyRepo = new InMemoryLoyaltyRepository();
    const loyaltyService = new LoyaltyService(loyaltyRepo);
    orderService = new OrderService(new InMemoryOrderRepository(), loyaltyService);
  });

  const validPizza: Pizza = { size: "medium", toppings: ["mozzarella", "basil"] };

  it("creates an order and assigns an ID", () => {
    const order = orderService.createOrder("Mario", "mario-001", [validPizza]);
    expect(order.id).toBeDefined();
    expect(order.customerName).toBe("Mario");
    expect(order.customerId).toBe("mario-001");
    expect(order.status).toBe("confirmed");
    expect(order.pizzas).toHaveLength(1);
    expect(order.totalPrice).toBe(13); // 10 + 3
  });

  it("retrieves a created order by ID", () => {
    const created = orderService.createOrder("Luigi", "luigi-001", [validPizza]);
    const found = orderService.getOrderById(created.id);
    expect(found).toEqual(created);
  });

  it("returns undefined for a non-existent order", () => {
    expect(orderService.getOrderById("nope")).toBeUndefined();
  });

  it("lists all orders", () => {
    orderService.createOrder("Mario", "mario-001", [validPizza]);
    orderService.createOrder("Luigi", "luigi-001", [validPizza, validPizza]);
    expect(orderService.getAllOrders()).toHaveLength(2);
  });

  it("throws OrderValidationError for invalid pizzas", () => {
    const badPizza = { size: "medium", toppings: ["pineapple"] } as any;
    expect(() => orderService.createOrder("Bowser", "bowser-001", [badPizza])).toThrow(OrderValidationError);
  });

  it("throws OrderValidationError when customer name is empty", () => {
    expect(() => orderService.createOrder("", "customer-001", [validPizza])).toThrow(OrderValidationError);
  });

  it("throws OrderValidationError when customer ID is empty", () => {
    expect(() => orderService.createOrder("Mario", "", [validPizza])).toThrow(OrderValidationError);
  });
});
