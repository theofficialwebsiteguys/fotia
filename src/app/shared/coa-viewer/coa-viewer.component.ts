import { DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { CoaViewerService } from '../../core/browser/coa-viewer.service';
import { DocumentDownloadService } from '../../core/browser/document-download.service';
import { DownloadButtonComponent } from '../download-button/download-button.component';
import { IconComponent } from '../icon/icon.component';

/** The single COA document dialog, rendered once in the app shell. */
@Component({
  selector: 'app-coa-viewer',
  imports: [DatePipe, IconComponent, DownloadButtonComponent],
  templateUrl: './coa-viewer.component.html',
  styleUrl: './coa-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoaViewerComponent {
  private readonly viewer = inject(CoaViewerService);
  private readonly downloader = inject(DocumentDownloadService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private returnFocus: HTMLElement | null = null;

  protected readonly request = this.viewer.current;
  protected readonly availability = signal<'checking' | 'ok' | 'missing' | 'unknown'>('checking');
  protected readonly frameUrl = computed(() => {
    const request = this.request();
    // URLs are validated by isSafeDocumentUrl before a request can be opened.
    return request ? this.sanitizer.bypassSecurityTrustResourceUrl(`${request.url}#view=FitH`) : null;
  });

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    effect(() => {
      const request = this.request();
      if (!isBrowser) return;
      const dialog = this.dialog().nativeElement;

      if (request) {
        this.availability.set('checking');
        this.downloader.probe(request.url).then((result) => {
          if (this.request() === request) this.availability.set(result);
        });
        // Open after the dialog content has rendered so autofocus lands on Close.
        afterNextRender(
          () => {
            if (!dialog.open) {
              this.returnFocus = this.document.activeElement as HTMLElement | null;
              dialog.showModal();
            }
          },
          { injector: this.injector },
        );
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  protected close(): void {
    this.viewer.close();
  }

  protected onClosed(): void {
    this.viewer.close();
    this.returnFocus?.focus();
    this.returnFocus = null;
  }
}
