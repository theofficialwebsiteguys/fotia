import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { RetailerListing } from '../../core/models/retailer.model';
import { RetailerCardComponent } from './retailer-card.component';

const listing: RetailerListing = {
  retailer: {
    id: 'r1',
    name: 'Test Retailer',
    address: { line1: '1 Test St', city: 'Testville', region: 'NY', postalCode: '10001' },
  },
  strains: [
    { strainSlug: 'a', strainName: 'Strain A', packageSize: '3.5 g', inventory: { kind: 'in-stock' } },
    { strainSlug: 'b', strainName: 'Strain B', inventory: { kind: 'unknown' } },
  ],
};

describe('RetailerCardComponent', () => {
  function render(value: RetailerListing) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RetailerCardComponent);
    fixture.componentRef.setInput('listing', value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the address and a directions link built from it', () => {
    const el = render(listing);
    expect(el.querySelector('address')?.textContent).toContain('Testville, NY 10001');
    const directions = [...el.querySelectorAll('a')].find((a) => a.textContent?.includes('Directions'));
    expect(directions?.getAttribute('href')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=1%20Test%20St%2C%20Testville%2C%20NY%2010001',
    );
  });

  it('lists each reported strain with its own status and omits a distance it was not given', () => {
    const el = render(listing);
    const rows = [...el.querySelectorAll('.retailer__strains li')].map((li) => li.textContent ?? '');
    expect(rows[0]).toContain('In stock');
    expect(rows[1]).toContain('Availability unknown');
    expect(rows[1]).not.toContain('Sold out');
    expect(el.querySelector('.retailer__distance')).toBeNull();
  });
});
