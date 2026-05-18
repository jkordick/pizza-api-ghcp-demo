import express from "express";
import { OrderService } from "./domain/services";
import { InMemoryOrderRepository } from "./infrastructure/persistence";
import { menuRouter, createOrderRoutes } from "./infrastructure/http/routes";

const app = express();
const PORT = 3000;

app.use(express.json());

// Wire up dependencies (hexagonal architecture)
const orderRepository = new InMemoryOrderRepository();
const orderService = new OrderService(orderRepository);

// Register routes
app.use("/menu", menuRouter);
app.use("/orders", createOrderRoutes(orderService));

// Only start listening when this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🍕 Pizza Planet API is running on http://localhost:${PORT}`);
  });
}

export { app };
