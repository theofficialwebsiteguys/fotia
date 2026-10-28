import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { searchBatches } from '../../core/catalog/catalog-search';
import { StrainService } from '../../core/catalog/strain.service';
import { loadState } from '../../core/load-state';
import { CoaActionsComponent } from '../../shared/coa-actions/coa-actions.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-lab-results',
  imports: [DatePipe, RouterLink, CoaActionsComponent, IconComponent],
  templateUrl: './lab-results.component.html',
  styleUrl: './lab-results.component.scss',
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly params = toSignal(
    this.route.queryParamMap.pipe(map((p) => ({ q: p.get('q')?.trim() ?? '', strain: p.get('strain') ?? '' }))),
    { requireSync: true },
  );
  protected readonly catalog = toSignal(loadState(inject(StrainService).all()), { requireSync: true });
  protected readonly strains = computed(() => {
    const state = this.catalog();
    return state.status === 'ready' ? state.value : [];
  });
  protected readonly strainsWithBatches = computed(() => this.strains().filter((s) => s.batches.length));
  protected readonly results = computed(() =>
    searchBatches(this.strains(), { query: this.params().q, strainSlug: this.params().strain }),
  );
  protected readonly filtered = computed(() => !!this.params().q || !!this.params().strain);
  protected readonly hasDemo = computed(() => this.strains().some((s) => s.demo));

  protected submit(event: Event, q: string): void {
    event.preventDefault();
    this.navigate({ q: q.trim() || null });
  }

  protected onStrainChange(strain: string): void {
    this.navigate({ strain: strain || null });
  }

  protected clear(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  private navigate(queryParams: Record<string, string | null>): void {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
