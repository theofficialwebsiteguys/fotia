import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { findBatch } from '../../core/catalog/catalog-search';
import { InventoryProvider } from '../../core/inventory/inventory-provider';
import type { InventoryState, StrainAvailability } from '../../core/models/inventory.model';
import type { Strain } from '../../core/models/strain.model';
import { markNotFound } from '../../core/server-response';
import { BatchSelectorComponent } from '../../shared/batch-selector/batch-selector.component';
import { CoaActionsComponent } from '../../shared/coa-actions/coa-actions.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { InventoryStatusComponent } from '../../shared/inventory-status/inventory-status.component';
import { StrainPhotoComponent } from '../../shared/strain-photo/strain-photo.component';

@Component({
  selector: 'app-strain-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    BatchSelectorComponent,
    CoaActionsComponent,
    IconComponent,
    InventoryStatusComponent,
    StrainPhotoComponent,
  ],
  templateUrl: './strain-detail.component.html',
  styleUrl: './strain-detail.component.scss',
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrainDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inventory = inject(InventoryProvider);

  protected readonly strain = toSignal(
    this.route.data.pipe(map((data) => (data['strain'] as Strain | null | undefined) ?? null)),
    { requireSync: true },
  );
  protected readonly requestedBatch = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('batch'))), {
    requireSync: true,
  });

  /** The batch named in ?batch=, or the latest batch when none (or an unknown one) is given. */
  protected readonly batch = computed(() => {
    const strain = this.strain();
    if (!strain) return undefined;
    return findBatch(strain, this.requestedBatch()) ?? strain.batches[0];
  });
  protected readonly batchNotFound = computed(() => {
    const strain = this.strain();
    const requested = this.requestedBatch();
    return !!strain && !!requested && !findBatch(strain, requested);
  });
  protected readonly batchQuery = computed(() => {
    const batch = this.batch();
    return batch ? { batch: batch.id } : {};
  });
  protected readonly resultGroups = computed(() => {
    const batch = this.batch();
    return [
      { title: 'Cannabinoids', rows: batch?.cannabinoids ?? [] },
      { title: 'Terpenes', rows: batch?.terpenes ?? [] },
    ].filter((group) => group.rows.length > 0);
  });

  protected readonly availability = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) =>
        this.inventory.strainAvailability(params.get('slug') ?? '').pipe(
          startWith<StrainAvailability>({ kind: 'loading' }),
          catchError(() => of<StrainAvailability>({ kind: 'error' })),
        ),
      ),
    ),
    { requireSync: true },
  );
  /** Strain-level availability expressed as a status for the shared indicator. */
  protected readonly availabilityStatus = computed((): InventoryState | null => {
    const availability = this.availability();
    return availability.kind === 'reported' ? null : availability;
  });

  constructor() {
    if (!this.strain()) markNotFound();
  }

  protected selectBatch(id: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { batch: id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      preserveFragment: true,
    });
  }
}
