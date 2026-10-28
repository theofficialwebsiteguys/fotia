import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { InventoryState, VerifiedQuantity } from '../../core/models/inventory.model';

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

interface StatusView {
  tone: Tone;
  label: string;
  detail?: string;
  quantity?: VerifiedQuantity;
  updatedAt?: string;
}

const REPORTED_LABEL = { 'in-stock': 'in stock', 'low-stock': 'low stock', 'sold-out': 'sold out' } as const;

export function describeInventory(state: InventoryState): StatusView {
  switch (state.kind) {
    case 'not-connected':
      return { tone: 'neutral', label: 'Availability unknown', detail: 'Live inventory isn’t connected yet.' };
    case 'unknown':
      return { tone: 'neutral', label: 'Availability unknown', detail: 'Not reported by this retailer.' };
    case 'loading':
      return { tone: 'neutral', label: 'Checking availability…' };
    case 'in-stock':
      return { tone: 'good', label: 'In stock', quantity: state.quantity, updatedAt: state.updatedAt };
    case 'low-stock':
      return { tone: 'warn', label: 'Low stock', quantity: state.quantity, updatedAt: state.updatedAt };
    case 'sold-out':
      return { tone: 'bad', label: 'Sold out', updatedAt: state.updatedAt };
    case 'stale':
      return {
        tone: 'neutral',
        label: `Last reported ${REPORTED_LABEL[state.lastReported]}`,
        detail: 'This report may be out of date.',
        updatedAt: state.updatedAt,
      };
    case 'error':
      return {
        tone: 'bad',
        label: 'Availability temporarily unavailable',
        detail: state.message ?? 'Please try again later.',
      };
  }
}

@Component({
  selector: 'app-inventory-status',
  imports: [DatePipe],
  template: `
    @let v = view();
    <span class="dot" [attr.data-tone]="v.tone" [class.is-loading]="state().kind === 'loading'" aria-hidden="true"></span>
    <span class="text">
      <span class="label">{{ v.label }}</span>
      @if (v.quantity; as q) {
        <span class="detail">{{ q.units }} {{ q.units === 1 ? 'unit' : 'units' }} available · {{ q.packageSize }}</span>
      }
      @if (v.detail) {
        <span class="detail">{{ v.detail }}</span>
      }
      @if (v.updatedAt) {
        <span class="detail">Updated <time [attr.datetime]="v.updatedAt">{{ v.updatedAt | date: 'MMM d, h:mm a' }}</time></span>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: 0.625rem;
      font-size: 0.9375rem;
    }

    .dot {
      flex: none;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      border: 1px solid var(--color-text-subtle);
      transform: translateY(-1px);

      &[data-tone='good'] {
        border-color: var(--color-status-good);
        background: var(--color-status-good);
      }

      &[data-tone='warn'] {
        border-color: var(--color-status-warn);
        background: var(--color-status-warn);
      }

      &[data-tone='bad'] {
        border-color: var(--color-status-bad);
      }

      &.is-loading {
        animation: pulse 1.2s ease-in-out infinite;
      }
    }

    .text {
      display: grid;
      gap: 0.125rem;
    }

    .label {
      color: var(--color-text);
      font-weight: 600;
    }

    .detail {
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }

    @keyframes pulse {
      50% {
        opacity: 0.3;
      }
    }
  `,
  host: { '[attr.aria-busy]': "state().kind === 'loading' || null" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryStatusComponent {
  readonly state = input.required<InventoryState>();
  protected readonly view = computed(() => describeInventory(this.state()));
}
