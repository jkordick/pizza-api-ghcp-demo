import { PointsAccount, PointsTransaction } from "../../domain/models";
import { LoyaltyRepository } from "../../domain/ports";

/**
 * In-memory implementation of the LoyaltyRepository port.
 * Stores accounts in a Map and transactions in a Map of arrays.
 */
export class InMemoryLoyaltyRepository implements LoyaltyRepository {
  private readonly accounts = new Map<string, PointsAccount>();
  private readonly transactions = new Map<string, PointsTransaction[]>();

  getAccount(customerId: string): PointsAccount {
    const existing = this.accounts.get(customerId);
    if (existing) return existing;

    const account: PointsAccount = {
      customerId,
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    this.accounts.set(customerId, account);
    return account;
  }

  saveAccount(account: PointsAccount): void {
    this.accounts.set(account.customerId, account);
  }

  addTransaction(transaction: PointsTransaction): void {
    const list = this.transactions.get(transaction.customerId) ?? [];
    list.push(transaction);
    this.transactions.set(transaction.customerId, list);
  }

  getTransactions(customerId: string): PointsTransaction[] {
    return this.transactions.get(customerId) ?? [];
  }
}
