import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ASSETS } from '../../core/assets';
import { NAV_ITEMS, SITE_CONFIG } from '../../core/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  protected readonly nav = NAV_ITEMS;
  protected readonly logo = ASSETS.logo;
  protected readonly flame = ASSETS.flame;
  protected readonly config = SITE_CONFIG;
  protected readonly hasContact = !!(SITE_CONFIG.contact.email || SITE_CONFIG.contact.phone || SITE_CONFIG.social.length);
  protected readonly year = new Date().getFullYear();
}
