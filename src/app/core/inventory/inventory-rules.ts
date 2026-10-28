import type { InventoryReport, InventoryRules, InventoryState } from '../models/inventory.model';

export const DEFAULT_INVENTORY_RULES: InventoryRules = {
  staleAfterMinutes: 240,
  // Leave unset until Fotia and the data provider agree on a low-stock rule.
  lowStockAtOrBelow: undefined,
};

/**
 * Turns a provider report into what the UI may claim. Missing data stays
 * "unknown"; only a verified count produces a quantity or "low stock".
 */
export function classifyInventory(
  report: InventoryReport,
  rules: InventoryRules = DEFAULT_INVENTORY_RULES,
  now: Date = new Date(),
): InventoryState {
  if (report.status === 'unknown') return { kind: 'unknown' };

  const verified = report.verifiedUnits;
  const quantity =
    verified === undefined
      ? undefined
      : {
          units: verified,
          retailerId: report.retailerId,
          strainSlug: report.strainSlug,
          productId: report.productId,
          packageSize: report.packageSize,
        };

  let current: InventoryState;
  if (report.status === 'sold-out' || verified === 0) {
    current = { kind: 'sold-out', updatedAt: report.updatedAt };
  } else if (quantity && rules.lowStockAtOrBelow !== undefined && quantity.units <= rules.lowStockAtOrBelow) {
    current = { kind: 'low-stock', updatedAt: report.updatedAt, quantity };
  } else {
    current = { kind: 'in-stock', updatedAt: report.updatedAt, quantity };
  }

  if (report.updatedAt) {
    const updated = Date.parse(report.updatedAt);
    if (!Number.isNaN(updated) && now.getTime() - updated > rules.staleAfterMinutes * 60_000) {
      return { kind: 'stale', lastReported: current.kind, updatedAt: report.updatedAt };
    }
  }
  return current;
}
