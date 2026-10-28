import { DOCUMENT, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, computed, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';

import { AgeVerificationService } from './core/browser/age-verification.service';
import { AgeGateComponent } from './shared/age-gate/age-gate.component';
import { CoaViewerComponent } from './shared/coa-viewer/coa-viewer.component';
import { SiteFooterComponent } from './shared/site-footer/site-footer.component';
import { SiteHeaderComponent } from './shared/site-header/site-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgeGateComponent, SiteHeaderComponent, SiteFooterComponent, CoaViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ageVerification = inject(AgeVerificationService);

  /**
   * Content is inert only in the browser while the age gate is open. Server
   * HTML never carries `inert`, so returning visitors can use the page
   * straight away (the gate itself is hidden before paint by index.html).
   */
  protected readonly behindGate = computed(() => this.isBrowser && !this.ageVerification.verified());

  constructor() {
    const router = inject(Router);
    const scroller = inject(ViewportScroller);
    const document = inject(DOCUMENT);

    // Anchor targets land below the fixed header.
    scroller.setOffset(() => [0, (document.defaultView?.innerWidth ?? 0) >= 860 ? 88 : 80]);
    scroller.setHistoryScrollRestoration('manual');

    // Scroll to top and move focus only when the page itself changes. Query
    // changes (batch selection, search terms) keep the reader where they are.
    let currentPath: string | null = null;
    router.events
      .pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const path = router.url.split(/[?#]/)[0];
        const firstNavigation = currentPath === null;
        const pathChanged = path !== currentPath;
        currentPath = path;

        if (event.position) {
          scroller.scrollToPosition(event.position);
        } else if (event.anchor) {
          scroller.scrollToAnchor(event.anchor);
          document.getElementById(event.anchor)?.focus({ preventScroll: true });
          return;
        } else if (pathChanged) {
          scroller.scrollToPosition([0, 0]);
        }

        if (pathChanged && !firstNavigation) {
          this.main().nativeElement.focus({ preventScroll: true });
        }
      });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    const main = this.main().nativeElement;
    main.focus();
    main.scrollIntoView();
  }
}
