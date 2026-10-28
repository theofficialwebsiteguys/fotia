import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';

import { GeolocationService } from '../../core/browser/geolocation.service';
import { StrainService } from '../../core/catalog/strain.service';
import { loadState } from '../../core/load-state';
import type { GeoCoordinates, RetailerQuery, RetailerSearchResult } from '../../core/models/retailer.model';
import { RetailerDirectory } from '../../core/retailers/retailer-directory';
import { SITE_CONFIG } from '../../core/site.config';
import { IconComponent } from '../../shared/icon/icon.component';
import { RetailerCardComponent } from '../../shared/retailer-card/retailer-card.component';

type SearchView =
  | { status: 'idle'; query: RetailerQuery }
  | { status: 'loading'; query: RetailerQuery }
  | { status: 'done'; query: RetailerQuery; result: RetailerSearchResult };

const GEO_MESSAGES = {
  unsupported: 'Your browser doesn’t share location. Enter a city or ZIP code instead.',
  denied: 'Location access was declined. Enter a city or ZIP code instead.',
  unavailable: 'Your location couldn’t be determined. Enter a city or ZIP code instead.',
  timeout: 'Finding your location took too long. Enter a city or ZIP code instead.',
} as const;

@Component({
  selector: 'app-find-fotia',
  imports: [RouterLink, IconComponent, RetailerCardComponent],
  templateUrl: './find-fotia.component.html',
  styleUrl: './find-fotia.component.scss',
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindFotiaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly directory = inject(RetailerDirectory);
  private readonly geolocation = inject(GeolocationService);
  /** Coordinates stay in memory only; they are never written to the URL. */
  private readonly coords$ = new BehaviorSubject<GeoCoordinates | null>(null);

  protected readonly capabilities = this.directory.capabilities;
  protected readonly mapProvider = SITE_CONFIG.integrations.mapProvider;
  protected readonly locating = signal(false);
  protected readonly geoMessage = signal('');

  protected readonly params = toSignal(
    this.route.queryParamMap.pipe(map((p) => ({ location: p.get('location')?.trim() ?? '', strain: p.get('strain') ?? '' }))),
    { requireSync: true },
  );
  protected readonly catalog = toSignal(loadState(inject(StrainService).all()), { requireSync: true });
  protected readonly strains = computed(() => {
    const state = this.catalog();
    return state.status === 'ready' ? state.value : [];
  });
  protected readonly selectedStrain = computed(() => this.strains().find((s) => s.slug === this.params().strain));

  protected readonly search = toSignal(
    combineLatest([this.route.queryParamMap, this.coords$]).pipe(
      map(([p, coords]): RetailerQuery => ({
        location: p.get('location')?.trim() || undefined,
        strainSlug: p.get('strain') || undefined,
        coords: coords ?? undefined,
      })),
      switchMap((query) => {
        if (!query.location && !query.coords) {
          // Nothing to search yet. Without a directory, say so up front.
          return this.capabilities.connected
            ? of<SearchView>({ status: 'idle', query })
            : of<SearchView>({ status: 'done', query, result: { kind: 'not-connected' } });
        }
        return this.directory.search(query).pipe(
          map((result): SearchView => ({ status: 'done', query, result })),
          startWith<SearchView>({ status: 'loading', query }),
          catchError(() => of<SearchView>({ status: 'done', query, result: { kind: 'error' } })),
        );
      }),
    ),
    { requireSync: true },
  );

  protected submit(event: Event, location: string, strain: string): void {
    event.preventDefault();
    this.coords$.next(null);
    this.geoMessage.set('');
    this.navigate({ location: location.trim() || null, strain: strain || null });
  }

  protected onStrainChange(strain: string): void {
    this.navigate({ strain: strain || null }, true);
  }

  protected async useMyLocation(): Promise<void> {
    this.locating.set(true);
    this.geoMessage.set('');
    const outcome = await this.geolocation.locate();
    this.locating.set(false);

    if (outcome.ok) {
      this.geoMessage.set('Showing results near your current location.');
      this.navigate({ location: null });
      this.coords$.next(outcome.coords);
    } else {
      this.geoMessage.set(GEO_MESSAGES[outcome.reason]);
    }
  }

  protected retry(): void {
    this.coords$.next(this.coords$.value);
  }

  private navigate(queryParams: Record<string, string | null>, replaceUrl = false): void {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl });
  }
}
