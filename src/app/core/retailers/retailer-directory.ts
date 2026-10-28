import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import type {
  RetailerDirectoryCapabilities,
  RetailerQuery,
  RetailerSearchResult,
} from '../models/retailer.model';

/**
 * Retailer search. A real implementation should call Fotia's backend (for
 * example GET /api/retailers?location=&lat=&lng=&strain=), which geocodes the
 * query, applies `classifyInventory` rules, and keeps provider credentials
 * server-side. Results must contain real stores only.
 */
export abstract class RetailerDirectory {
  abstract readonly capabilities: RetailerDirectoryCapabilities;
  abstract search(query: RetailerQuery): Observable<RetailerSearchResult>;
}

/** Default until retailer data is connected: every search reports that honestly. */
@Injectable()
export class NotConnectedRetailerDirectory extends RetailerDirectory {
  readonly capabilities: RetailerDirectoryCapabilities = {
    connected: false,
    locationSearch: false,
    coordinateSearch: false,
  };

  search(): Observable<RetailerSearchResult> {
    return of({ kind: 'not-connected' });
  }
}

/** A Google Maps directions link for a real street address. */
export function directionsUrl(address: { line1: string; city: string; region: string; postalCode: string }): string {
  const destination = [address.line1, address.city, `${address.region} ${address.postalCode}`].join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
