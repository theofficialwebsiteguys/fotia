import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { classificationsOf, filterStrains } from '../../core/catalog/catalog-search';
import { StrainService } from '../../core/catalog/strain.service';
import { loadState } from '../../core/load-state';
import { IconComponent } from '../../shared/icon/icon.component';
import { StrainCardComponent } from '../../shared/strain-card/strain-card.component';

@Component({
  selector: 'app-strain-directory',
  imports: [StrainCardComponent, IconComponent],
  templateUrl: './strain-directory.component.html',
  styleUrl: './strain-directory.component.scss',
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrainDirectoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryInput = new Subject<string>();
  /** The `q` value most recently written to (or read from) the URL. */
  private urlQuery = '';

  protected readonly query = signal('');
  protected readonly type = signal('');
  protected readonly catalog = toSignal(loadState(inject(StrainService).all()), { requireSync: true });

  protected readonly strains = computed(() => {
    const state = this.catalog();
    return state.status === 'ready' ? state.value : [];
  });
  /** The type filter exists only when the data has more than one classification. */
  protected readonly types = computed(() => classificationsOf(this.strains()));
  protected readonly results = computed(() =>
    filterStrains(this.strains(), {
      query: this.query(),
      classification: this.types().length > 1 ? this.type() : '',
    }),
  );
  protected readonly hasDemo = computed(() => this.strains().some((s) => s.demo));
  protected readonly filtered = computed(() => !!this.query().trim() || !!this.type());

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const q = params.get('q') ?? '';
      // Ignore the echo of our own debounced URL update so typing is never overwritten.
      if (q !== this.urlQuery) {
        this.urlQuery = q;
        this.query.set(q);
      }
      this.type.set(params.get('type') ?? '');
    });

    this.queryInput.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed()).subscribe((q) => {
      this.urlQuery = q;
      this.updateUrl({ q: q.trim() || null });
    });
  }

  protected onQueryInput(value: string): void {
    this.query.set(value);
    this.queryInput.next(value);
  }

  protected onTypeChange(value: string): void {
    this.type.set(value);
    this.updateUrl({ type: value || null });
  }

  protected clearFilters(): void {
    this.urlQuery = '';
    this.query.set('');
    this.type.set('');
    this.updateUrl({ q: null, type: null });
  }

  private updateUrl(queryParams: Record<string, string | null>): void {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
