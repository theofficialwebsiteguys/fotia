import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { Batch } from '../../core/models/lab.model';

let nextId = 0;

/** Chooses which batch's lab information is shown. Batches arrive newest first. */
@Component({
  selector: 'app-batch-selector',
  imports: [DatePipe],
  template: `
    @if (batches().length > 1) {
      <div class="field">
        <label class="field__label" [for]="id">Batch</label>
        <select class="select" [id]="id" [attr.aria-describedby]="id + '-hint'" (change)="onChange($event)">
          @for (batch of batches(); track batch.id; let first = $first) {
            <option [value]="batch.id" [selected]="batch.id === selectedId()" [attr.selected]="batch.id === selectedId() ? '' : null">
              {{ batch.id }}@if (batch.testDate) { · Tested {{ batch.testDate | date: 'MMM d, y' : 'UTC' }}}@if (first) { · Latest}
            </option>
          }
        </select>
        <p class="field__hint" [id]="id + '-hint'">Match this to the batch number printed on your package.</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchSelectorComponent {
  readonly batches = input.required<Batch[]>();
  readonly selectedId = input<string>();
  readonly selectedIdChange = output<string>();

  protected readonly id = `batch-select-${nextId++}`;

  protected onChange(event: Event): void {
    this.selectedIdChange.emit((event.target as HTMLSelectElement).value);
  }
}
