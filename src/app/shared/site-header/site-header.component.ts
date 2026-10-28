import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ASSETS } from '../../core/assets';
import { NAV_ITEMS } from '../../core/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  protected readonly nav = NAV_ITEMS;
  protected readonly logo = ASSETS.logo;
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const update = () => this.scrolled.set(window.scrollY > 8);
      update();
      zone.runOutsideAngular(() => window.addEventListener('scroll', update, { passive: true }));
      destroyRef.onDestroy(() => window.removeEventListener('scroll', update));
    });
  }

  protected openMenu(): void {
    const dialog = this.menu().nativeElement;
    if (!dialog.open) {
      dialog.showModal();
      this.menuOpen.set(true);
    }
  }

  /** The native dialog returns focus to the Menu button when it closes. */
  protected closeMenu(): void {
    const dialog = this.menu().nativeElement;
    if (dialog.open) dialog.close();
  }

  protected onMenuClosed(): void {
    this.menuOpen.set(false);
  }
}
