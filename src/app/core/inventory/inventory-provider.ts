import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import type { StrainAvailability } from '../models/inventory.model';

/**
 * Strain-level availability. A real implementation should call Fotia's own
 * backend (for example GET /api/strains/:slug/availability), which holds any
 * dispensary API credentials. Never put provider keys in this frontend.
 */
export abstract class InventoryProvider {
  abstract readonly connected: boolean;
  abstract strainAvailability(slug: string): Observable<StrainAvailability>;
}

/** Default until a backend exists: availability is reported as unknown, never as zero. */
@Injectable()
export class NotConnectedInventoryProvider extends InventoryProvider {
  readonly connected = false;

  strainAvailability(): Observable<StrainAvailability> {
    return of({ kind: 'not-connected' });
  }
}
