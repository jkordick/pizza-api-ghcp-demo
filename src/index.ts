import express from "express";
import { OrderService, LoyaltyService } from "./domain/services";
import { InMemoryOrderRepository, InMemoryLoyaltyRepository } from "./infrastructure/persistence";
import { menuRouter, createOrderRoutes, createLoyaltyRoutes } from "./infrastructure/http/routes";

const app = express();
const PORT = 3000;

app.use(express.json());

// Wire up dependencies (hexagonal architecture)
const orderRepository = new InMemoryOrderRepository();
const loyaltyRepository = new InMemoryLoyaltyRepository();
const loyaltyService = new LoyaltyService(loyaltyRepository);
const orderService = new OrderService(orderRepository, loyaltyService);

// Register routes
app.use("/menu", menuRouter);
app.use("/orders", createOrderRoutes(orderService));
app.use("/customers", createLoyaltyRoutes(loyaltyService));

// Only start listening when this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🍕 Pizza Planet API is running on http://localhost:${PORT}`);
  });
}

export { app, orderService, loyaltyService };
