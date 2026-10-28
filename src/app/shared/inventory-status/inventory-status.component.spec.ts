import { TestBed } from '@angular/core/testing';

import type { InventoryState } from '../../core/models/inventory.model';
import { InventoryStatusComponent } from './inventory-status.component';

function render(state: InventoryState): string {
  const fixture = TestBed.createComponent(InventoryStatusComponent);
  fixture.componentRef.setInput('state', state);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('InventoryStatusComponent', () => {
  it('describes each state distinctly', () => {
    expect(render({ kind: 'not-connected' })).toContain('Availability unknown');
    expect(render({ kind: 'not-connected' })).toContain('isn’t connected');
    expect(render({ kind: 'unknown' })).toContain('Not reported by this retailer');
    expect(render({ kind: 'loading' })).toContain('Checking availability');
    expect(render({ kind: 'in-stock' })).toBe('In stock');
    expect(render({ kind: 'sold-out', updatedAt: '2026-10-27T11:30:00Z' })).toContain('Sold out');
    expect(render({ kind: 'error' })).toContain('temporarily unavailable');
    expect(render({ kind: 'stale', lastReported: 'in-stock', updatedAt: '2026-10-26T08:00:00Z' })).toContain(
      'Last reported in stock',
    );
  });

  it('never presents unknown availability as zero or sold out', () => {
    for (const kind of ['not-connected', 'unknown'] as const) {
      const text = render({ kind });
      expect(text).not.toMatch(/sold out|0 units/i);
    }
  });

  it('shows units only for a verified quantity, labeled with its package size', () => {
    const text = render({
      kind: 'low-stock',
      updatedAt: '2026-10-27T11:30:00Z',
      quantity: { units: 3, retailerId: 'r', strainSlug: 's', productId: 'p', packageSize: '3.5 g' },
    });
    expect(text).toContain('Low stock');
    expect(text).toContain('3 units available · 3.5 g');
    expect(text).toContain('Updated');
  });
});
