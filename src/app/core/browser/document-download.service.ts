import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type DownloadOutcome =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'failed'; status?: number }
  /** The browser refused the request, usually because the file host doesn't allow cross-origin (CORS) reads. */
  | { ok: false; reason: 'blocked' };

/** Accept only https/http URLs and site-relative paths for documents. */
export function isSafeDocumentUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return !url.startsWith('//');
  return /^https?:\/\//i.test(url);
}

export function coaFileName(strainSlug: string, batchId: string): string {
  const safe = (value: string) => value.replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '');
  return `Fotia-COA-${safe(strainSlug)}-${safe(batchId)}.pdf`;
}

/**
 * Downloads a PDF as a real file. The `download` attribute is ignored for
 * cross-origin URLs, so the file is fetched and saved from a blob instead.
 * That needs the host to allow CORS; when it doesn't, the caller is told so
 * it can offer the file in a new tab.
 */
@Injectable({ providedIn: 'root' })
export class DocumentDownloadService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async download(url: string, fileName: string): Promise<DownloadOutcome> {
    if (!this.isBrowser) return { ok: false, reason: 'failed' };

    let response: Response;
    try {
      response = await fetch(url, { credentials: 'omit' });
    } catch {
      return { ok: false, reason: 'blocked' };
    }

    if (response.status === 404 || response.status === 410) {
      return { ok: false, reason: 'missing', status: response.status };
    }
    if (!response.ok) return { ok: false, reason: 'failed', status: response.status };

    const blob = await response.blob();
    // An HTML response means a fallback page, not the document.
    if (/text\/html/i.test(blob.type || response.headers.get('content-type') || '')) {
      return { ok: false, reason: 'missing' };
    }

    const href = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = href;
    link.download = fileName;
    link.hidden = true;
    this.document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 60_000);
    return { ok: true };
  }

  /** Best-effort check that a document exists. "unknown" when the host can't be read (CORS, HEAD not allowed). */
  async probe(url: string): Promise<'ok' | 'missing' | 'unknown'> {
    if (!this.isBrowser) return 'unknown';
    try {
      const response = await fetch(url, { method: 'HEAD', credentials: 'omit' });
      if (response.status === 404 || response.status === 410) return 'missing';
      if (!response.ok) return 'unknown';
      return /text\/html/i.test(response.headers.get('content-type') ?? '') ? 'missing' : 'ok';
    } catch {
      return 'unknown';
    }
  }
}
