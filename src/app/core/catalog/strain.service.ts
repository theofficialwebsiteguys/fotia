import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

import type { Strain } from '../models/strain.model';
import { CatalogSource } from './catalog-source';

@Injectable({ providedIn: 'root' })
export class StrainService {
  private readonly strains$ = inject(CatalogSource).strains().pipe(shareReplay({ bufferSize: 1, refCount: false }));

  all(): Observable<Strain[]> {
    return this.strains$;
  }

  /** Strains marked `featured`, falling back to the first few. */
  featured(limit = 3): Observable<Strain[]> {
    return this.strains$.pipe(
      map((strains) => {
        const featured = strains.filter((s) => s.featured);
        return (featured.length ? featured : strains).slice(0, limit);
      }),
    );
  }

  bySlug(slug: string): Observable<Strain | undefined> {
    return this.strains$.pipe(map((strains) => strains.find((s) => s.slug === slug)));
  }
}
