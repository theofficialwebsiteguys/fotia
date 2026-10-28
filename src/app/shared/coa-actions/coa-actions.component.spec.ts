import { TestBed } from '@angular/core/testing';

import { CoaViewerService } from '../../core/browser/coa-viewer.service';
import type { Batch } from '../../core/models/lab.model';
import { CoaActionsComponent } from './coa-actions.component';

const strain = { slug: 'test-strain', name: 'Test Strain' };

function create(batch: Batch) {
  const fixture = TestBed.createComponent(CoaActionsComponent);
  fixture.componentRef.setInput('strain', strain);
  fixture.componentRef.setInput('batch', batch);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const pdfResponse = () =>
  new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  });

describe('CoaActionsComponent', () => {
  it('says “COA not yet available” and renders no document links without a file', () => {
    const { el } = create({ id: 'TS-001' });
    expect(el.textContent).toContain('COA not yet available');
    expect(el.querySelector('a')).toBeNull();
  });

  it('refuses unsafe document URLs', () => {
    const { el } = create({ id: 'TS-001', coa: { url: 'javascript:alert(1)' } });
    expect(el.querySelector('a')).toBeNull();
  });

  it('links View PDF and Download PDF to the batch’s own document', () => {
    const { el } = create({ id: 'TS-002', coa: { url: '/test-coa/ts-002.pdf' } });
    const [view, download] = [...el.querySelectorAll('a')];
    expect(view.textContent).toContain('View PDF');
    expect(view.getAttribute('href')).toBe('/test-coa/ts-002.pdf');
    expect(view.getAttribute('target')).toBe('_blank');
    expect(download.textContent).toContain('Download PDF');
    expect(download.getAttribute('download')).toBe('Fotia-COA-test-strain-TS-002.pdf');
  });

  it('opens the in-page viewer when embedded PDFs are supported', () => {
    const viewer = TestBed.inject(CoaViewerService);
    spyOn(viewer, 'canEmbed').and.returnValue(true);
    const { el } = create({ id: 'TS-002', testDate: '2026-03-04', coa: { url: '/test-coa/ts-002.pdf' } });

    const click = new MouseEvent('click', { cancelable: true });
    el.querySelector('a')!.dispatchEvent(click);

    expect(click.defaultPrevented).toBeTrue();
    expect(viewer.current()).toEqual(
      jasmine.objectContaining({ strainName: 'Test Strain', batchId: 'TS-002', url: '/test-coa/ts-002.pdf' }),
    );
  });

  it('lets the link open the PDF directly where embedding is unsupported', () => {
    const viewer = TestBed.inject(CoaViewerService);
    spyOn(viewer, 'canEmbed').and.returnValue(false);
    const { el } = create({ id: 'TS-002', coa: { url: '/test-coa/ts-002.pdf' } });

    const click = new MouseEvent('click', { cancelable: true });
    el.querySelector('a')!.addEventListener('click', (e) => e.preventDefault(), { once: true });
    el.querySelector('a')!.dispatchEvent(click);
    expect(viewer.current()).toBeNull();
  });

  describe('download', () => {
    async function clickDownload(response: Promise<Response>) {
      spyOn(window, 'fetch').and.returnValue(response);
      const anchorClick = spyOn(HTMLAnchorElement.prototype, 'click');
      const { fixture, el } = create({ id: 'TS-002', coa: { url: '/test-coa/ts-002.pdf' } });
      const event = new MouseEvent('click', { cancelable: true });
      el.querySelectorAll('a')[1].dispatchEvent(event);
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
      return { el, event, anchorClick };
    }

    it('saves the fetched PDF as a file', async () => {
      const { el, event, anchorClick } = await clickDownload(Promise.resolve(pdfResponse()));
      expect(event.defaultPrevented).toBeTrue();
      expect(anchorClick).toHaveBeenCalledTimes(1);
      expect(el.textContent).toContain('Download started');
    });

    it('reports a missing file', async () => {
      const { el, anchorClick } = await clickDownload(Promise.resolve(new Response('', { status: 404 })));
      expect(anchorClick).not.toHaveBeenCalled();
      expect(el.textContent).toContain('unavailable right now');
    });

    it('treats an HTML fallback page as a missing file', async () => {
      const html = new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } });
      const { el } = await clickDownload(Promise.resolve(html));
      expect(el.textContent).toContain('unavailable right now');
    });

    it('offers the file in a new tab when cross-origin rules block the download', async () => {
      const { el } = await clickDownload(Promise.reject(new TypeError('Failed to fetch')));
      const fallback = [...el.querySelectorAll('a')].find((a) => a.textContent?.includes('Open the PDF'));
      expect(fallback?.getAttribute('href')).toBe('/test-coa/ts-002.pdf');
      expect(fallback?.getAttribute('target')).toBe('_blank');
    });
  });
});
