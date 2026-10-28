import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ASSETS } from '../../../core/assets';
import { IconComponent } from '../../../shared/icon/icon.component';

@Component({
  selector: 'app-home-hero',
  imports: [RouterLink, IconComponent],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroComponent {
  protected readonly hero = ASSETS.hero;
  /**
   * Rendered width of the image. Below 860px it is cropped toward the pouch
   * (object-fit: cover in a square or 4:3 frame), so it renders wider than the viewport.
   */
  protected readonly sizes = '(min-width: 860px) 100vw, (min-width: 560px) 136vw, 178vw';
}
