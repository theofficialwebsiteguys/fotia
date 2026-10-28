import { TestBed } from '@angular/core/testing';

import { CoaViewerService } from '../../core/browser/coa-viewer.service';
import { CoaViewerComponent } from './coa-viewer.component';

const request = {
  strainName: 'Test Strain',
  batchId: 'TS-002',
  testDate: '2026-03-04',
  labName: 'Test Lab',
  url: '/test-coa/ts-002.pdf',
  fileName: 'Fotia-COA-test-strain-TS-002.pdf',
};

async function open(probeResponse: Response) {
  spyOn(window, 'fetch').and.resolveTo(probeResponse);
  const fixture = TestBed.createComponent(CoaViewerComponent);
  fixture.detectChanges();
  TestBed.inject(CoaViewerService).open(request);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('CoaViewerComponent', () => {
  afterEach(() => TestBed.inject(CoaViewerService).close());

  it('opens a modal with the batch’s metadata, the PDF and an “Open in new tab” fallback', async () => {
    const { el } = await open(new Response(null, { status: 200, headers: { 'content-type': 'application/pdf' } }));
    const dialog = el.querySelector('dialog')!;

    expect(dialog.open).toBeTrue();
    expect(dialog.textContent).toContain('Test Strain');
    expect(dialog.textContent).toContain('Batch TS-002');
    expect(dialog.textContent).toContain('Mar 4, 2026');
    expect(dialog.textContent).toContain('Test Lab');
    expect(dialog.querySelector('iframe')?.getAttribute('src')).toContain('/test-coa/ts-002.pdf');
    const newTab = [...dialog.querySelectorAll('a')].find((a) => a.textContent?.includes('Open in new tab'));
    expect(newTab?.getAttribute('href')).toBe('/test-coa/ts-002.pdf');
    expect(document.activeElement?.classList).toContain('viewer__close');
  });

  it('shows a visible error instead of the frame when the file is missing', async () => {
    const { el } = await open(new Response(null, { status: 404 }));
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.textContent).toContain('This COA file is unavailable.');
  });

  it('closes when the service closes', async () => {
    const { fixture, el } = await open(new Response(null, { status: 200, headers: { 'content-type': 'application/pdf' } }));
    TestBed.inject(CoaViewerService).close();
    fixture.detectChanges();
    expect(el.querySelector('dialog')!.open).toBeFalse();
  });
});
