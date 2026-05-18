import { PointsTransaction } from "../models";
import { LoyaltyRepository } from "../ports";
import { randomUUID } from "crypto";

/** Error thrown when a loyalty operation fails. */
export class LoyaltyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoyaltyError";
  }
}

/**
 * Domain service for loyalty points operations.
 * Handles earning, redemption, balance queries, and reversal.
 */
export class LoyaltyService {
  constructor(private readonly loyaltyRepository: LoyaltyRepository) {}

  /**
   * Award points to a customer based on the order total.
   * Points = floor(orderTotal). Creates an 'earned' transaction.
   */
  earnPoints(customerId: string, orderId: string, orderTotal: number): number {
    const points = Math.floor(orderTotal);
    if (points <= 0) return 0;

    const account = this.loyaltyRepository.getAccount(customerId);
    account.balance += points;
    this.loyaltyRepository.saveAccount(account);

    const transaction: PointsTransaction = {
      id: randomUUID(),
      customerId,
      type: "earned",
      amount: points,
      orderId,
      createdAt: new Date().toISOString(),
    };
    this.loyaltyRepository.addTransaction(transaction);

    return points;
  }

  /**
   * Attempt to redeem 100 points for a 5 EUR discount.
   * @returns The discount amount (5) if successful.
   * @throws LoyaltyError if balance < 100.
   */
  redeemPoints(customerId: string, orderId: string): number {
    const account = this.loyaltyRepository.getAccount(customerId);
    if (account.balance < 100) {
      throw new LoyaltyError(
        `Insufficient points for redemption. Required: 100, available: ${account.balance}`
      );
    }

    account.balance -= 100;
    this.loyaltyRepository.saveAccount(account);

    const transaction: PointsTransaction = {
      id: randomUUID(),
      customerId,
      type: "redeemed",
      amount: 100,
      orderId,
      createdAt: new Date().toISOString(),
    };
    this.loyaltyRepository.addTransaction(transaction);

    return 5;
  }

  /**
   * Get a customer's current balance and transaction history.
   * Returns balance 0 and empty transactions for unknown customers.
   */
  getCustomerPoints(customerId: string): { customerId: string; balance: number; transactions: PointsTransaction[] } {
    const account = this.loyaltyRepository.getAccount(customerId);
    const transactions = this.loyaltyRepository.getTransactions(customerId);
    return {
      customerId: account.customerId,
      balance: account.balance,
      transactions,
    };
  }

  /**
   * Reverse all points operations for a cancelled order.
   * Returns redeemed points and revokes earned points (capped at current balance).
   */
  reverseOrderPoints(customerId: string, orderId: string, pointsEarned: number, pointsRedeemed: number): void {
    const account = this.loyaltyRepository.getAccount(customerId);
    const now = new Date().toISOString();

    // Return redeemed points
    if (pointsRedeemed > 0) {
      account.balance += pointsRedeemed;
      const returnTx: PointsTransaction = {
        id: randomUUID(),
        customerId,
        type: "returned",
        amount: pointsRedeemed,
        orderId,
        createdAt: now,
      };
      this.loyaltyRepository.addTransaction(returnTx);
    }

    // Revoke earned points (cap at current balance to prevent negative)
    if (pointsEarned > 0) {
      const revokeAmount = Math.min(pointsEarned, account.balance);
      account.balance -= revokeAmount;
      if (revokeAmount > 0) {
        const revokeTx: PointsTransaction = {
          id: randomUUID(),
          customerId,
          type: "revoked",
          amount: revokeAmount,
          orderId,
          createdAt: now,
        };
        this.loyaltyRepository.addTransaction(revokeTx);
      }
    }

    this.loyaltyRepository.saveAccount(account);
  }
}
