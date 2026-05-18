# 🍕 Pizza Planet

A Pizza ordering REST API built with Node.js, Express, and TypeScript.

Built using **hexagonal architecture** (ports and adapters) to keep domain logic cleanly separated from infrastructure.

## Quick start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build and run
npm run build
npm start
```

The API starts on **http://localhost:3000**.

## API endpoints

### GET /menu

Returns available sizes, toppings, and prices.

```bash
curl http://localhost:3000/menu
```

### POST /orders

Create a new order.

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Mario",
    "pizzas": [
      { "size": "large", "toppings": ["mozzarella", "basil", "pepperoni"] }
    ]
  }'
```

### GET /orders/:id

Get an order by ID.

```bash
curl http://localhost:3000/orders/<order-id>
```

### GET /orders

List all orders.

```bash
curl http://localhost:3000/orders
```

## Domain rules

1. A pizza must have exactly one size: `small`, `medium`, or `large`
2. A pizza must have between 1 and 5 toppings
3. **Pineapple is NOT allowed.** Attempting to add it returns a `422` with: _"Nice try. Pineapple is not welcome here."_
4. Orders must contain between 1 and 10 pizzas
5. Available toppings: mozzarella, pepperoni, mushrooms, onions, peppers, olives, basil, ham, salami, jalapeños

## Pricing

| Size   | Base price |
|--------|-----------|
| Small  | 8€        |
| Medium | 10€       |
| Large  | 12€       |

Each topping adds **1.50€**.

## Running tests

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

## Project structure

```
src/
├── domain/
│   ├── models/          # Pizza, Order types and constants
│   ├── ports/           # Repository interfaces
│   └── services/        # Validation, pricing, order orchestration
├── infrastructure/
│   ├── persistence/     # In-memory repository implementation
│   └── http/
│       ├── controllers/ # Express route handlers
│       └── routes/      # Express router definitions
└── index.ts             # App entry point
```

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + Supertest


## Demo Flow
1. Show GHCP Chat window in VS Code: where to select agents, where to select models, where to select tools
2. Explain and execute `.github/prompts/copilot-instructions-creation.prompt.md` to create `.github/copilot-instructions.md` and show the result when it is done
3. Explain agent skills and show skills in the repo: `convert-svg-to-png`, `run-tests`, and `lint-and-typecheck`
4. Show `gh skill search terraform` in the terminal. Point to the importance of verifying skill providers and content.
5. Switch to spec-kit branch and show the `specs/001-loyalty-points-system` folder with the plan, research, data model, quickstart, contracts, and tasks files.