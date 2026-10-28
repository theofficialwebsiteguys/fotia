import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { DEMO_STRAINS } from '../data/demo-fixtures';
import type { Strain } from '../models/strain.model';

/**
 * Where strain, batch and COA data comes from. Provide a different
 * implementation in app.config.ts (a CMS, a JSON file, or your backend) to
 * replace the demo fixtures; nothing in the UI needs to change.
 */
export abstract class CatalogSource {
  abstract strains(): Observable<Strain[]>;
}

@Injectable()
export class DemoCatalogSource extends CatalogSource {
  strains(): Observable<Strain[]> {
    return of(DEMO_STRAINS);
  }
}
