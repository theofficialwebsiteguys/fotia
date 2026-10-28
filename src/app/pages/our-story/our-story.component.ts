import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/icon/icon.component';

/*
 * Brand identity copy only. Company history, cultivation details, licensing
 * and locations belong here once Fotia supplies approved text.
 */
@Component({
  selector: 'app-our-story',
  imports: [RouterLink, IconComponent],
  template: `
    <header class="page-intro container">
      <p class="eyebrow">Our story</p>
      <h1 class="title-page">Fire of the Gods.</h1>
      <p class="lead">Rooted in myth. Grown with purpose.</p>
    </header>

    <div class="container story">
      <div class="greek-key" aria-hidden="true"></div>

      <section class="story__block" aria-labelledby="story-name">
        <h2 id="story-name">The name</h2>
        <p>Fotia — φωτιά — is the Greek word for fire.</p>
      </section>

      <section class="story__block" aria-labelledby="story-myth">
        <h2 id="story-myth">The myth</h2>
        <p>
          In the old Greek myths, fire belonged to the gods of Olympus before it was carried down to humankind: light,
          warmth and craft in a single flame. Fire of the Gods is our nod to that story.
        </p>
      </section>

      <section class="story__block" aria-labelledby="story-know">
        <h2 id="story-know">Know what you’re holding</h2>
        <p>
          Every Fotia strain has its own page, with lab results organized by batch. Look up the certificate of analysis
          for the package in your hand, and find Fotia at a retailer near you.
        </p>
        <div class="story__links">
          <a class="text-link" routerLink="/strains">Explore strains <app-icon name="arrow-right" [size]="16" /></a>
          <a class="text-link" routerLink="/lab-results">Lab results <app-icon name="arrow-right" [size]="16" /></a>
          <a class="text-link" routerLink="/find-fotia">Find Fotia <app-icon name="arrow-right" [size]="16" /></a>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .story {
      display: grid;
      gap: clamp(2.5rem, 5vw, 4rem);
      padding-bottom: var(--section-space);
    }

    .greek-key {
      max-width: 12rem;
    }

    .story__block {
      display: grid;
      gap: 1rem;
      max-width: 46rem;

      h2 {
        font-size: clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem);
      }

      p {
        color: var(--color-text-muted);
        font-size: 1.125rem;
        line-height: 1.7;
      }
    }

    .story__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0 1.75rem;
    }
  `,
  host: { class: 'page-glow' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurStoryComponent {}
