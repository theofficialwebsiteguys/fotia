import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { markNotFound } from '../../core/server-response';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="page-intro container">
      <p class="eyebrow">Page not found</p>
      <h1 class="title-page">This page couldn’t be found.</h1>
      <p class="lead">The link may be out of date, or the page may have moved. These will get you back on track.</p>
      <ul role="list" class="links">
        <li><a class="text-link" routerLink="/strains">Explore strains <app-icon name="arrow-right" [size]="16" /></a></li>
        <li><a class="text-link" routerLink="/find-fotia">Find Fotia <app-icon name="arrow-right" [size]="16" /></a></li>
        <li><a class="text-link" routerLink="/lab-results">Lab results <app-icon name="arrow-right" [size]="16" /></a></li>
        <li><a class="text-link" routerLink="/">Home <app-icon name="arrow-right" [size]="16" /></a></li>
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 70vh;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 0 2rem;
      margin-top: 2rem;
    }
  `,
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  constructor() {
    markNotFound();
  }
}
