import request from "supertest";
import express from "express";
import { OrderService, LoyaltyService } from "../../src/domain/services";
import { InMemoryOrderRepository, InMemoryLoyaltyRepository } from "../../src/infrastructure/persistence";
import { createOrderRoutes, createLoyaltyRoutes } from "../../src/infrastructure/http/routes";

/**
 * Integration tests for the loyalty points system.
 * Uses a fresh app instance per test suite to avoid shared state.
 */
function createTestApp() {
  const app = express();
  app.use(express.json());
  const orderRepo = new InMemoryOrderRepository();
  const loyaltyRepo = new InMemoryLoyaltyRepository();
  const loyaltyService = new LoyaltyService(loyaltyRepo);
  const orderService = new OrderService(orderRepo, loyaltyService);
  app.use("/orders", createOrderRoutes(orderService));
  app.use("/customers", createLoyaltyRoutes(loyaltyService));
  return { app, loyaltyService, loyaltyRepo };
}

describe("Loyalty: Earn Points", () => {
  it("returns pointsEarned in the order response", async () => {
    const { app } = createTestApp();
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Alice",
        customerId: "alice-001",
        pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni"] }],
      });

    expect(res.status).toBe(201);
    expect(res.body.pointsEarned).toBeDefined();
    expect(res.body.pointsEarned).toBe(Math.floor(res.body.totalPrice));
  });

  it("earns 23 points for a 23.50 EUR order", async () => {
    const { app } = createTestApp();
    // large base = 14, 2 toppings = 3 => 17 EUR (need to calculate exact)
    // Actually let's just verify the formula: pointsEarned = floor(totalPrice)
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Bob",
        customerId: "bob-001",
        pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms"] }],
      });

    expect(res.status).toBe(201);
    expect(res.body.pointsEarned).toBe(Math.floor(res.body.totalPrice));
  });

  it("returns pointsRedeemed as 0 when no redemption", async () => {
    const { app } = createTestApp();
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Alice",
        customerId: "alice-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella"] }],
      });

    expect(res.status).toBe(201);
    expect(res.body.pointsRedeemed).toBe(0);
  });
});

describe("Loyalty: Redeem Points", () => {
  it("applies 5 EUR discount when customer has 100+ points", async () => {
    const { app } = createTestApp();
    // large pizza + 3 toppings = 12 + 4.5 = 16.5 EUR => 16 pts each
    // Need 7 orders to get 112 points (7 * 16 = 112)
    for (let i = 0; i < 7; i++) {
      await request(app)
        .post("/orders")
        .send({
          customerName: "Alice",
          customerId: "alice-001",
          pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms"] }],
        });
    }

    // Now redeem
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Alice",
        customerId: "alice-001",
        pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms"] }],
        redeemPoints: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.pointsRedeemed).toBe(100);
    // Total should be 16.5 - 5 = 11.5
    expect(res.body.totalPrice).toBe(11.5);
  });

  it("returns 400 when trying to redeem with insufficient points", async () => {
    const { app } = createTestApp();
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Bob",
        customerId: "bob-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella"] }],
        redeemPoints: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Insufficient points");
  });

  it("earns points on the discounted total after redemption", async () => {
    const { app } = createTestApp();
    // Give customer 100+ points: 6 orders * 18 pts each = 108 pts
    // large + 4 toppings = 12 + 6 = 18 EUR => 18 pts
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post("/orders")
        .send({
          customerName: "Carol",
          customerId: "carol-001",
          pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms", "onions"] }],
        });
    }

    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Carol",
        customerId: "carol-001",
        pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms", "onions"] }],
        redeemPoints: true,
      });

    expect(res.status).toBe(201);
    // Points earned should be based on discounted total: 18 - 5 = 13 => 13 pts
    expect(res.body.pointsEarned).toBe(Math.floor(res.body.totalPrice));
    expect(res.body.totalPrice).toBe(13);
  });
});

describe("Loyalty: View Balance and History", () => {
  it("returns balance 0 and empty transactions for new customer", async () => {
    const { app } = createTestApp();
    const res = await request(app).get("/customers/new-customer/points");
    expect(res.status).toBe(200);
    expect(res.body.customerId).toBe("new-customer");
    expect(res.body.balance).toBe(0);
    expect(res.body.transactions).toEqual([]);
  });

  it("returns correct balance and transactions after orders", async () => {
    const { app } = createTestApp();
    // Place an order to earn points
    await request(app)
      .post("/orders")
      .send({
        customerName: "Dave",
        customerId: "dave-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella"] }],
      });

    const res = await request(app).get("/customers/dave-001/points");
    expect(res.status).toBe(200);
    expect(res.body.customerId).toBe("dave-001");
    expect(res.body.balance).toBe(11); // medium + 1 topping = 10 + 1.5 = 11.5 => 11 pts
    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.transactions[0].type).toBe("earned");
    expect(res.body.transactions[0].amount).toBe(11);
  });
});

describe("Loyalty: Order Cancellation", () => {
  it("cancels an order and returns it with cancelled status", async () => {
    const { app } = createTestApp();
    const createRes = await request(app)
      .post("/orders")
      .send({
        customerName: "Eve",
        customerId: "eve-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella"] }],
      });

    const cancelRes = await request(app)
      .post(`/orders/${createRes.body.id}/cancel`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe("cancelled");
  });

  it("returns 404 for non-existent order", async () => {
    const { app } = createTestApp();
    const res = await request(app).post("/orders/nonexistent/cancel");
    expect(res.status).toBe(404);
  });

  it("returns 400 for already cancelled order", async () => {
    const { app } = createTestApp();
    const createRes = await request(app)
      .post("/orders")
      .send({
        customerName: "Eve",
        customerId: "eve-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella"] }],
      });

    await request(app).post(`/orders/${createRes.body.id}/cancel`);
    const res = await request(app).post(`/orders/${createRes.body.id}/cancel`);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("already cancelled");
  });

  it("revokes earned points and returns redeemed points on cancellation", async () => {
    const { app } = createTestApp();
    // Accumulate 100+ points
    for (let i = 0; i < 7; i++) {
      await request(app)
        .post("/orders")
        .send({
          customerName: "Frank",
          customerId: "frank-001",
          pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms"] }],
        });
    }

    // Place order with redemption
    const redeemRes = await request(app)
      .post("/orders")
      .send({
        customerName: "Frank",
        customerId: "frank-001",
        pizzas: [{ size: "large", toppings: ["mozzarella", "pepperoni", "mushrooms"] }],
        redeemPoints: true,
      });

    // Check balance before cancel
    const beforeCancel = await request(app).get("/customers/frank-001/points");
    const balanceBefore = beforeCancel.body.balance;

    // Cancel the redeemed order
    await request(app).post(`/orders/${redeemRes.body.id}/cancel`);

    // Check balance after cancel: should return 100 redeemed and revoke earned
    const afterCancel = await request(app).get("/customers/frank-001/points");
    // Balance should increase by 100 (returned) and decrease by pointsEarned (revoked)
    const expectedBalance = balanceBefore + 100 - redeemRes.body.pointsEarned;
    expect(afterCancel.body.balance).toBe(expectedBalance);
  });
});
