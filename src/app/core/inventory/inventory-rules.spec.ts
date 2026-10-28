import type { InventoryReport } from '../models/inventory.model';
import { classifyInventory } from './inventory-rules';

const now = new Date('2026-10-27T12:00:00Z');
const report = (overrides: Partial<InventoryReport>): InventoryReport => ({
  retailerId: 'r1',
  strainSlug: 's1',
  productId: 'p1',
  packageSize: '3.5 g',
  status: 'in-stock',
  updatedAt: '2026-10-27T11:30:00Z',
  ...overrides,
});

describe('classifyInventory', () => {
  it('keeps unknown availability unknown, never sold out', () => {
    expect(classifyInventory(report({ status: 'unknown', verifiedUnits: undefined }), undefined, now)).toEqual({
      kind: 'unknown',
    });
  });

  it('shows in stock without a quantity unless the count is verified', () => {
    const state = classifyInventory(report({}), { staleAfterMinutes: 240 }, now);
    expect(state).toEqual({ kind: 'in-stock', updatedAt: '2026-10-27T11:30:00Z', quantity: undefined });
  });

  it('attaches a verified quantity to the exact product, package size and retailer', () => {
    const state = classifyInventory(report({ verifiedUnits: 12 }), { staleAfterMinutes: 240 }, now);
    expect(state.kind).toBe('in-stock');
    expect(state.kind === 'in-stock' && state.quantity).toEqual({
      units: 12,
      retailerId: 'r1',
      strainSlug: 's1',
      productId: 'p1',
      packageSize: '3.5 g',
    });
  });

  it('shows low stock only when a rule is configured and a verified count exists', () => {
    expect(classifyInventory(report({ verifiedUnits: 2 }), { staleAfterMinutes: 240 }, now).kind).toBe('in-stock');
    expect(
      classifyInventory(report({ verifiedUnits: 2 }), { staleAfterMinutes: 240, lowStockAtOrBelow: 3 }, now).kind,
    ).toBe('low-stock');
    expect(classifyInventory(report({}), { staleAfterMinutes: 240, lowStockAtOrBelow: 3 }, now).kind).toBe('in-stock');
  });

  it('reports sold out only when the provider says so or verifies zero', () => {
    expect(classifyInventory(report({ status: 'sold-out' }), undefined, now).kind).toBe('sold-out');
    expect(classifyInventory(report({ verifiedUnits: 0 }), undefined, now).kind).toBe('sold-out');
  });

  it('marks old reports as stale while keeping what was last reported', () => {
    const state = classifyInventory(report({ updatedAt: '2026-10-26T08:00:00Z' }), { staleAfterMinutes: 240 }, now);
    expect(state).toEqual({ kind: 'stale', lastReported: 'in-stock', updatedAt: '2026-10-26T08:00:00Z' });
  });
});
