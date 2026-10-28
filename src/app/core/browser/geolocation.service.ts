import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import type { GeoCoordinates } from '../models/retailer.model';

export type GeolocationOutcome =
  | { ok: true; coords: GeoCoordinates }
  | { ok: false; reason: 'unsupported' | 'denied' | 'unavailable' | 'timeout' };

/** Requests the visitor's position only when they ask for it. */
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get supported(): boolean {
    return this.isBrowser && 'geolocation' in navigator;
  }

  locate(): Promise<GeolocationOutcome> {
    if (!this.supported) return Promise.resolve({ ok: false, reason: 'unsupported' });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({ ok: true, coords: { latitude: position.coords.latitude, longitude: position.coords.longitude } }),
        (error) =>
          resolve({
            ok: false,
            reason:
              error.code === error.PERMISSION_DENIED
                ? 'denied'
                : error.code === error.TIMEOUT
                  ? 'timeout'
                  : 'unavailable',
          }),
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
      );
    });
  }
}
