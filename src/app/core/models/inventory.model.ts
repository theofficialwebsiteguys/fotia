/**
 * A unit count the inventory provider has verified for one product, in one
 * package size, at one retailer. Never derived, summed or estimated.
 */
export interface VerifiedQuantity {
  units: number;
  retailerId: string;
  strainSlug: string;
  productId: string;
  /** Package size the count applies to, e.g. "3.5 g". */
  packageSize: string;
}

/**
 * What the UI shows for one product at one retailer. "Unknown" states are
 * deliberately separate from "sold-out": missing data is never shown as zero.
 */
export type InventoryState =
  | { kind: 'not-connected' }
  | { kind: 'unknown' }
  | { kind: 'loading' }
  | { kind: 'in-stock'; updatedAt?: string; quantity?: VerifiedQuantity }
  | { kind: 'low-stock'; updatedAt?: string; quantity: VerifiedQuantity }
  | { kind: 'sold-out'; updatedAt?: string }
  | { kind: 'stale'; lastReported: 'in-stock' | 'low-stock' | 'sold-out'; updatedAt: string }
  | { kind: 'error'; message?: string };

/** A raw report from an inventory backend, before display rules are applied. */
export interface InventoryReport {
  retailerId: string;
  strainSlug: string;
  productId: string;
  packageSize: string;
  status: 'in-stock' | 'sold-out' | 'unknown';
  /** Set only when the provider verifies the exact count for this product, package size and retailer. */
  verifiedUnits?: number;
  /** ISO 8601 timestamp supplied by the provider. Never generated client-side. */
  updatedAt?: string;
}

export interface InventoryRules {
  /** Reports older than this are shown as stale. */
  staleAfterMinutes: number;
  /** "Low stock" is shown only when this is configured and a verified count exists. */
  lowStockAtOrBelow?: number;
}

/** Strain-level availability for the strain detail page. */
export type StrainAvailability =
  | { kind: 'not-connected' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | {
      kind: 'reported';
      /** Number of retailers currently reporting this strain in stock. A store count, not a unit count. */
      retailersInStock: number;
      updatedAt?: string;
    };
