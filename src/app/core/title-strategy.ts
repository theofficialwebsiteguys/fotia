import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const DEFAULT_TITLE = 'Fotia · Fire of the Gods';
const DEFAULT_DESCRIPTION =
  'Fotia premium indoor cannabis flower. Explore our strains, find Fotia at a retailer, and view the certificate of analysis for your batch.';

/** "Page · Fotia" titles, plus a per-route meta description from `data.description`. */
@Injectable()
export class FotiaTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} · Fotia` : DEFAULT_TITLE);

    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const description = route.data['description'];
    this.meta.updateTag({
      name: 'description',
      content: typeof description === 'string' && description ? description : DEFAULT_DESCRIPTION,
    });
  }
}
