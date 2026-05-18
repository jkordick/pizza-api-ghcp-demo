import { PointsAccount, PointsTransaction } from "../models";

/**
 * Port for persisting and retrieving loyalty points data.
 * Infrastructure layer must implement this interface.
 */
export interface LoyaltyRepository {
  /** Get or create a points account for a customer. */
  getAccount(customerId: string): PointsAccount;
  /** Save an updated points account. */
  saveAccount(account: PointsAccount): void;
  /** Add a transaction to a customer's history. */
  addTransaction(transaction: PointsTransaction): void;
  /** Get all transactions for a customer, ordered by creation time. */
  getTransactions(customerId: string): PointsTransaction[];
}
