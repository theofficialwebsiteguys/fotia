import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';
import { TEST_DATA_PROVIDERS } from '../../testing/test-catalog';

async function visit(url: string) {
  TestBed.configureTestingModule({ providers: [provideRouter(routes), ...TEST_DATA_PROVIDERS] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  harness.detectChanges();
  return { harness, el: harness.routeNativeElement as HTMLElement };
}

const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

describe('StrainDetailComponent', () => {
  it('defaults to the latest batch and its own results and COA', async () => {
    const { el } = await visit('/strains/test-strain');
    expect((el.querySelector('#coa select') as HTMLSelectElement).value).toBe('TS-002');
    expect(text(el.querySelector('.data-table'))).toContain('batch TS-002');
    expect(text(el.querySelector('.data-table'))).toContain('2%');
    expect(text(el.querySelector('app-coa-actions'))).toContain('View PDF');
  });

  it('selects the batch named in ?batch= and associates lab data with it', async () => {
    const { el } = await visit('/strains/test-strain?batch=TS-001');
    expect((el.querySelector('#coa select') as HTMLSelectElement).value).toBe('TS-001');
    expect(text(el.querySelector('.data-table'))).toContain('batch TS-001');
    expect(text(el.querySelector('.data-table'))).toContain('1%');
    expect(text(el.querySelector('app-coa-actions'))).toContain('COA not yet available');
  });

  it('updates the URL when another batch is chosen', async () => {
    const { harness, el } = await visit('/strains/test-strain');
    const select = el.querySelector('#coa select') as HTMLSelectElement;
    select.value = 'TS-001';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/strains/test-strain?batch=TS-001');
    expect(text(el.querySelector('.data-table'))).toContain('batch TS-001');
  });

  it('explains when a requested batch does not exist', async () => {
    const { el } = await visit('/strains/test-strain?batch=NOPE');
    expect(text(el)).toContain('We couldn’t find batch NOPE');
    expect((el.querySelector('#coa select') as HTMLSelectElement).value).toBe('TS-002');
  });

  it('labels strain-level availability as unknown, not sold out', async () => {
    const { el } = await visit('/strains/test-strain');
    expect(text(el)).toContain('Availability unknown');
    expect(text(el)).toContain('doesn’t mean it’s sold out');
    expect(text(el)).not.toContain('Sold out');
  });

  it('shows a not-found state for unknown strains', async () => {
    const { el } = await visit('/strains/missing?batch=TS-001');
    expect(text(el)).toContain('We couldn’t find that strain.');
  });
});
