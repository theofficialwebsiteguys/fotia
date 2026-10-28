import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CoaViewerService } from '../../core/browser/coa-viewer.service';
import { coaFileName, isSafeDocumentUrl } from '../../core/browser/document-download.service';
import type { Batch } from '../../core/models/lab.model';
import type { Strain } from '../../core/models/strain.model';
import { DownloadButtonComponent } from '../download-button/download-button.component';
import { IconComponent } from '../icon/icon.component';

/** View/Download for one batch's COA, or an explicit "not yet available". */
@Component({
  selector: 'app-coa-actions',
  imports: [IconComponent, DownloadButtonComponent],
  template: `
    @if (document(); as doc) {
      <a
        class="btn btn--primary btn--sm"
        [href]="doc.url"
        target="_blank"
        rel="noopener"
        (click)="onView($event)"
      >
        <app-icon name="file" [size]="16" />
        View PDF<span class="visually-hidden">: {{ context() }}</span>
      </a>
      <app-download-button
        [url]="doc.url"
        [downloadUrl]="doc.downloadUrl"
        [fileName]="fileName()"
        [context]="context()"
      />
    } @else {
      <p class="missing">
        <app-icon name="file" [size]="16" />
        COA not yet available
      </p>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.625rem;
    }

    .missing {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 2.75rem;
      color: var(--color-text-muted);
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoaActionsComponent {
  readonly strain = input.required<Pick<Strain, 'slug' | 'name'>>();
  readonly batch = input.required<Batch>();

  private readonly viewer = inject(CoaViewerService);

  protected readonly document = computed(() => {
    const coa = this.batch().coa;
    return coa && isSafeDocumentUrl(coa.url) ? coa : undefined;
  });
  protected readonly fileName = computed(
    () => this.document()?.fileName ?? coaFileName(this.strain().slug, this.batch().id),
  );
  protected readonly context = computed(() => `${this.strain().name}, batch ${this.batch().id}`);

  /** Opens the in-page viewer where embedded PDFs work; otherwise the link opens the PDF itself. */
  protected onView(event: MouseEvent): void {
    const doc = this.document();
    if (!doc || !this.viewer.canEmbed() || event.metaKey || event.ctrlKey || event.shiftKey) return;

    event.preventDefault();
    const batch = this.batch();
    this.viewer.open({
      strainName: this.strain().name,
      batchId: batch.id,
      testDate: batch.testDate,
      labName: batch.labName,
      url: doc.url,
      downloadUrl: doc.downloadUrl,
      fileName: this.fileName(),
    });
  }
}
