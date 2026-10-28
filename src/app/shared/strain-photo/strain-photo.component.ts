import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ASSETS } from '../../core/assets';
import type { StrainPhoto } from '../../core/models/strain.model';

/** A flower photo at its natural color, or an intentional placeholder when none is supplied. */
@Component({
  selector: 'app-strain-photo',
  template: `
    @if (photo(); as p) {
      <img
        class="photo"
        [src]="p.src"
        [attr.srcset]="p.srcset ?? null"
        [attr.sizes]="p.srcset ? sizes() : null"
        [width]="p.width"
        [height]="p.height"
        [alt]="p.alt"
        [attr.loading]="priority() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="priority() ? 'high' : null"
        decoding="async"
        [style.object-position]="p.focus ?? null"
      />
    } @else {
      <div class="placeholder" aria-hidden="true">
        <picture>
          <source type="image/webp" [attr.srcset]="flame.srcWebp" />
          <img [src]="flame.src" [width]="flame.width" [height]="flame.height" alt="" loading="lazy" />
        </picture>
        <span>Photo coming soon</span>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      aspect-ratio: 1;
      overflow: hidden;
      background: #0b0b0b;
    }

    :host(.is-portrait) {
      aspect-ratio: 4 / 5;
    }

    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 1.25rem;
      background: radial-gradient(65% 55% at 50% 45%, #1b1813 0%, #0c0c0c 65%, #080808 100%);

      img {
        width: auto;
        height: clamp(3rem, 22%, 5rem);
        opacity: 0.4;
      }

      span {
        color: var(--color-text-subtle);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }
    }
  `,
  host: { '[class.is-portrait]': "ratio() === 'portrait'" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrainPhotoComponent {
  readonly photo = input<StrainPhoto | undefined>();
  readonly ratio = input<'square' | 'portrait'>('square');
  readonly priority = input(false);
  readonly sizes = input('(min-width: 980px) 400px, (min-width: 600px) 50vw, 100vw');
  protected readonly flame = ASSETS.flame;
}
