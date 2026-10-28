import { Injectable, Provider } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CatalogSource } from '../core/catalog/catalog-source';
import { InventoryProvider, NotConnectedInventoryProvider } from '../core/inventory/inventory-provider';
import type { Strain } from '../core/models/strain.model';
import { NotConnectedRetailerDirectory, RetailerDirectory } from '../core/retailers/retailer-directory';

/** Test-only data with batch-specific results and documents. Never shipped. */
export const TEST_STRAINS: Strain[] = [
  {
    slug: 'test-strain',
    name: 'Test Strain',
    classification: 'Hybrid',
    summary: 'Test summary.',
    batches: [
      {
        id: 'TS-002',
        testDate: '2026-03-04',
        labName: 'Test Lab',
        cannabinoids: [{ analyte: 'Analyte A', value: 2, unit: '%' }],
        coa: { url: '/test-coa/ts-002.pdf' },
      },
      {
        id: 'TS-001',
        testDate: '2026-01-10',
        labName: 'Test Lab',
        cannabinoids: [{ analyte: 'Analyte A', value: 1, unit: '%' }],
      },
    ],
  },
  { slug: 'other-strain', name: 'Other Strain', summary: 'Other summary.', batches: [] },
];

@Injectable()
class TestCatalogSource extends CatalogSource {
  strains(): Observable<Strain[]> {
    return of(TEST_STRAINS);
  }
}

export const TEST_DATA_PROVIDERS: Provider[] = [
  { provide: CatalogSource, useClass: TestCatalogSource },
  { provide: RetailerDirectory, useClass: NotConnectedRetailerDirectory },
  { provide: InventoryProvider, useClass: NotConnectedInventoryProvider },
];
