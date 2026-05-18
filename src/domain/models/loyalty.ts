/** Possible types of points transactions. */
export type PointsTransactionType = "earned" | "redeemed" | "returned" | "revoked";

/** Represents a customer's loyalty points balance. Created on first interaction. */
export interface PointsAccount {
  /** Externally-provided customer identifier. */
  customerId: string;
  /** Current point balance (always ≥ 0). */
  balance: number;
  /** ISO timestamp of when the account was first created. */
  createdAt: string;
}

/** Represents a single change to a customer's point balance. Immutable once created. */
export interface PointsTransaction {
  /** Unique transaction identifier. */
  id: string;
  /** Customer who owns this transaction. */
  customerId: string;
  /** Type of transaction. */
  type: PointsTransactionType;
  /** Points added or removed (always positive). */
  amount: number;
  /** Associated order ID. */
  orderId: string;
  /** ISO timestamp of when the transaction occurred. */
  createdAt: string;
}
