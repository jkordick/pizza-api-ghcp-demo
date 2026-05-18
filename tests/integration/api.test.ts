import request from "supertest";
import { app } from "../../src/index";

describe("GET /menu", () => {
  it("returns sizes, toppings, and topping price", async () => {
    const res = await request(app).get("/menu");
    expect(res.status).toBe(200);
    expect(res.body.sizes).toHaveLength(3);
    expect(res.body.toppings).toHaveLength(10);
    expect(res.body.toppingPrice).toBe(1.5);
    expect(res.body.toppings).not.toContain("pineapple");
  });
});

describe("POST /orders", () => {
  it("creates a valid order and returns 201", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Mario",
        customerId: "mario-001",
        pizzas: [{ size: "medium", toppings: ["mozzarella", "basil"] }],
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.customerName).toBe("Mario");
    expect(res.body.customerId).toBe("mario-001");
    expect(res.body.status).toBe("confirmed");
    expect(res.body.totalPrice).toBe(13);
  });

  it("returns 422 when pineapple is requested", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Bowser",
        customerId: "bowser-001",
        pizzas: [{ size: "medium", toppings: ["pineapple"] }],
      });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContain(
      "Pizza #1: Nice try. Pineapple is not welcome here."
    );
  });

  it("returns 422 for an empty pizza list", async () => {
    const res = await request(app)
      .post("/orders")
      .send({ customerName: "Luigi", customerId: "luigi-001", pizzas: [] });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 422 for too many toppings", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "Toad",
        customerId: "toad-001",
        pizzas: [
          {
            size: "large",
            toppings: [
              "mozzarella", "pepperoni", "mushrooms",
              "onions", "peppers", "olives",
            ],
          },
        ],
      });

    expect(res.status).toBe(422);
  });

  it("returns 422 when customer name is missing", async () => {
    const res = await request(app)
      .post("/orders")
      .send({
        customerName: "",
        customerId: "customer-001",
        pizzas: [{ size: "small", toppings: ["mozzarella"] }],
      });

    expect(res.status).toBe(422);
  });
});

describe("GET /orders/:id", () => {
  it("retrieves an existing order", async () => {
    const createRes = await request(app)
      .post("/orders")
      .send({
        customerName: "Peach",
        customerId: "peach-001",
        pizzas: [{ size: "small", toppings: ["basil"] }],
      });

    const getRes = await request(app).get(`/orders/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.customerName).toBe("Peach");
  });

  it("returns 404 for a non-existent order", async () => {
    const res = await request(app).get("/orders/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("GET /orders", () => {
  it("returns an array of orders", async () => {
    const res = await request(app).get("/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
