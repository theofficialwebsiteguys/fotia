import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CatalogSource, DemoCatalogSource } from './core/catalog/catalog-source';
import { InventoryProvider, NotConnectedInventoryProvider } from './core/inventory/inventory-provider';
import { NotConnectedRetailerDirectory, RetailerDirectory } from './core/retailers/retailer-directory';
import { FotiaTitleStrategy } from './core/title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Scrolling is handled in AppComponent so query-only changes don't jump to the top.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled' })),
    provideClientHydration(withEventReplay()),
    { provide: TitleStrategy, useClass: FotiaTitleStrategy },
    // Data sources. Swap these for real implementations; see README → Integrations.
    { provide: CatalogSource, useClass: DemoCatalogSource },
    { provide: RetailerDirectory, useClass: NotConnectedRetailerDirectory },
    { provide: InventoryProvider, useClass: NotConnectedInventoryProvider },
  ],
};
