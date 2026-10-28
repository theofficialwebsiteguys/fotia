import type { InventoryState } from './inventory.model';

export interface PostalAddress {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country?: string;
}

export interface Retailer {
  id: string;
  name: string;
  address: PostalAddress;
  phone?: string;
  website?: string;
}

/** One Fotia product a retailer reports, with its display state. */
export interface RetailerStrainStock {
  strainSlug: string;
  strainName: string;
  packageSize?: string;
  inventory: InventoryState;
}

export interface RetailerListing {
  retailer: Retailer;
  /** Present only when a configured location service calculated it. */
  distance?: { value: number; unit: 'mi' | 'km' };
  strains: RetailerStrainStock[];
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface RetailerQuery {
  /** Free-text city or ZIP code. */
  location?: string;
  coords?: GeoCoordinates;
  strainSlug?: string;
}

export type RetailerSearchResult =
  | { kind: 'not-connected' }
  | { kind: 'results'; listings: RetailerListing[] }
  | { kind: 'error'; message?: string };

export interface RetailerDirectoryCapabilities {
  /** A real retailer data source is connected. */
  connected: boolean;
  /** Searching by city/ZIP is supported (requires a geocoding service). */
  locationSearch: boolean;
  /** Searching by the visitor's coordinates is supported. */
  coordinateSearch: boolean;
}
