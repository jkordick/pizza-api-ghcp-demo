import { LoyaltyService, LoyaltyError } from "../../src/domain/services/loyalty-service";
import { InMemoryLoyaltyRepository } from "../../src/infrastructure/persistence/in-memory-loyalty-repository";

describe("LoyaltyService", () => {
  let loyaltyService: LoyaltyService;
  let loyaltyRepo: InMemoryLoyaltyRepository;

  beforeEach(() => {
    loyaltyRepo = new InMemoryLoyaltyRepository();
    loyaltyService = new LoyaltyService(loyaltyRepo);
  });

  describe("earnPoints", () => {
    it("awards 1 point per EUR spent, rounded down", () => {
      const points = loyaltyService.earnPoints("cust-1", "order-1", 23.50);
      expect(points).toBe(23);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(23);
    });

    it("rounds down fractional EUR amounts", () => {
      const points = loyaltyService.earnPoints("cust-1", "order-1", 9.99);
      expect(points).toBe(9);
    });

    it("awards 0 points for a 0 EUR order", () => {
      const points = loyaltyService.earnPoints("cust-1", "order-1", 0);
      expect(points).toBe(0);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(0);
    });

    it("accumulates points across multiple orders", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 20);
      loyaltyService.earnPoints("cust-1", "order-2", 30);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(50);
    });

    it("creates an earned transaction", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 15);
      const txns = loyaltyRepo.getTransactions("cust-1");
      expect(txns).toHaveLength(1);
      expect(txns[0].type).toBe("earned");
      expect(txns[0].amount).toBe(15);
      expect(txns[0].orderId).toBe("order-1");
    });
  });

  describe("redeemPoints", () => {
    it("deducts 100 points and returns 5 EUR discount when balance >= 100", () => {
      // Setup: give customer 150 points
      loyaltyService.earnPoints("cust-1", "order-1", 150);
      const discount = loyaltyService.redeemPoints("cust-1", "order-2");
      expect(discount).toBe(5);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(50); // 150 - 100
    });

    it("throws LoyaltyError when balance < 100", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 99);
      expect(() => loyaltyService.redeemPoints("cust-1", "order-2")).toThrow(LoyaltyError);
    });

    it("deducts exactly 100 even when balance is 200", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 200);
      loyaltyService.redeemPoints("cust-1", "order-2");
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(100); // 200 - 100
    });

    it("creates a redeemed transaction", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 150);
      loyaltyService.redeemPoints("cust-1", "order-2");
      const txns = loyaltyRepo.getTransactions("cust-1");
      const redeemTxn = txns.find(t => t.type === "redeemed");
      expect(redeemTxn).toBeDefined();
      expect(redeemTxn!.amount).toBe(100);
      expect(redeemTxn!.orderId).toBe("order-2");
    });
  });

  describe("reverseOrderPoints", () => {
    it("returns redeemed points on cancellation", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 150);
      loyaltyService.redeemPoints("cust-1", "order-2");
      // Balance is now 50 (150 - 100)
      loyaltyService.reverseOrderPoints("cust-1", "order-2", 0, 100);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(150); // 50 + 100 returned
    });

    it("revokes earned points on cancellation", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 25);
      loyaltyService.reverseOrderPoints("cust-1", "order-1", 25, 0);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBe(0);
    });

    it("caps revocation at current balance to prevent negative", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 50);
      // Simulate the balance being reduced (e.g., from other redemptions)
      const account = loyaltyRepo.getAccount("cust-1");
      account.balance = 20;
      loyaltyRepo.saveAccount(account);
      // Now try to revoke 50 earned points, but only 20 available
      loyaltyService.reverseOrderPoints("cust-1", "order-1", 50, 0);
      const updated = loyaltyRepo.getAccount("cust-1");
      expect(updated.balance).toBe(0); // capped at 0, not -30
    });

    it("creates returned and revoked transactions", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 150);
      loyaltyService.redeemPoints("cust-1", "order-1");
      // Balance = 50. Now cancel order-1 (earned 150, redeemed 100)
      loyaltyService.reverseOrderPoints("cust-1", "order-1", 150, 100);
      const txns = loyaltyRepo.getTransactions("cust-1");
      const returned = txns.find(t => t.type === "returned");
      const revoked = txns.find(t => t.type === "revoked");
      expect(returned).toBeDefined();
      expect(returned!.amount).toBe(100);
      expect(revoked).toBeDefined();
      // After returning 100, balance = 150, then revoke min(150, 150) = 150
      expect(revoked!.amount).toBe(150);
    });

    it("balance never goes negative", () => {
      loyaltyService.earnPoints("cust-1", "order-1", 10);
      loyaltyService.reverseOrderPoints("cust-1", "order-1", 10, 0);
      const account = loyaltyRepo.getAccount("cust-1");
      expect(account.balance).toBeGreaterThanOrEqual(0);
    });
  });
});
