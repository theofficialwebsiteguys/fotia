import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export interface CoaViewRequest {
  strainName: string;
  batchId: string;
  testDate?: string;
  labName?: string;
  url: string;
  downloadUrl?: string;
  fileName: string;
}

/** Opens the shared COA viewer dialog rendered in the app shell. */
@Injectable({ providedIn: 'root' })
export class CoaViewerService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly current = signal<CoaViewRequest | null>(null);

  /**
   * Embedded PDF viewing only where the browser has a built-in PDF viewer and
   * enough room. Elsewhere (most phones) the PDF opens directly instead.
   */
  canEmbed(): boolean {
    return (
      this.isBrowser && navigator.pdfViewerEnabled === true && window.matchMedia('(min-width: 768px)').matches
    );
  }

  open(request: CoaViewRequest): void {
    this.current.set(request);
  }

  close(): void {
    this.current.set(null);
  }
}
