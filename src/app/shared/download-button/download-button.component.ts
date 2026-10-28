import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

import { DocumentDownloadService, DownloadOutcome } from '../../core/browser/document-download.service';
import { IconComponent } from '../icon/icon.component';

type Status = 'idle' | 'working' | 'done' | Extract<DownloadOutcome, { ok: false }>['reason'];

/**
 * "Download PDF". A real link to the file (so it still works before the app
 * hydrates); with JavaScript it saves the file as a download and reports
 * failures in place.
 */
@Component({
  selector: 'app-download-button',
  imports: [IconComponent],
  template: `
    <a
      class="btn btn--sm"
      [href]="downloadUrl() ?? url()"
      [attr.download]="fileName()"
      [attr.aria-disabled]="status() === 'working' || null"
      (click)="onClick($event)"
    >
      <app-icon name="download" [size]="16" />
      {{ status() === 'working' ? 'Preparing…' : 'Download PDF' }}
      @if (context()) {
        <span class="visually-hidden">: {{ context() }}</span>
      }
    </a>
    <p class="message" role="status">
      @switch (status()) {
        @case ('done') {
          Download started.
        }
        @case ('missing') {
          This COA file is unavailable right now. Please try again later.
        }
        @case ('failed') {
          The download didn’t complete. Please try again.
        }
        @case ('blocked') {
          This file can’t be saved directly from here.
          <a [href]="url()" target="_blank" rel="noopener">Open the PDF in a new tab</a> and save it from there.
        }
      }
    </p>
  `,
  styles: `
    :host {
      display: contents;
    }

    .message {
      flex-basis: 100%;
      color: var(--color-text-muted);
      font-size: 0.875rem;

      &:empty {
        display: none;
      }

      a {
        color: var(--color-gold);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadButtonComponent {
  readonly url = input.required<string>();
  readonly downloadUrl = input<string>();
  readonly fileName = input.required<string>();
  /** Visually hidden context for screen readers, e.g. "Strain, batch X". */
  readonly context = input<string>();

  private readonly downloader = inject(DocumentDownloadService);
  protected readonly status = signal<Status>('idle');

  protected async onClick(event: MouseEvent): Promise<void> {
    // A dedicated attachment URL downloads natively; let the browser handle it.
    if (this.downloadUrl()) return;

    event.preventDefault();
    if (this.status() === 'working') return;

    this.status.set('working');
    const outcome = await this.downloader.download(this.url(), this.fileName());
    this.status.set(outcome.ok ? 'done' : outcome.reason);
  }
}
