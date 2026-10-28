import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { ASSETS } from '../../core/assets';
import { AgeVerificationService } from '../../core/browser/age-verification.service';

/**
 * Full-screen 21+ gate. Rendered on the server for every page so content
 * never shows first; the app shell makes everything else inert while it's open.
 */
@Component({
  selector: 'app-age-gate',
  templateUrl: './age-gate.component.html',
  styleUrl: './age-gate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeGateComponent {
  private readonly ageVerification = inject(AgeVerificationService);
  private readonly document = inject(DOCUMENT);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly logo = ASSETS.logo;
  protected readonly verified = this.ageVerification.verified;
  protected readonly denied = signal(false);

  constructor() {
    // Start screen readers and keyboard focus on the question.
    afterNextRender(() => this.panel()?.nativeElement.focus());
  }

  protected confirm(): void {
    this.ageVerification.confirm();
    this.document.getElementById('main')?.focus({ preventScroll: true });
  }
}
