import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { ASSETS } from '../../core/assets';
import { StrainService } from '../../core/catalog/strain.service';
import { loadState } from '../../core/load-state';
import { IconComponent } from '../../shared/icon/icon.component';
import { StrainCardComponent } from '../../shared/strain-card/strain-card.component';
import { HomeHeroComponent } from './home-hero/home-hero.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HomeHeroComponent, StrainCardComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);

  protected readonly flame = ASSETS.flame;
  protected readonly featured = toSignal(loadState(inject(StrainService).featured(3)), { requireSync: true });
  protected readonly allDemo = computed(() => {
    const state = this.featured();
    return state.status === 'ready' && state.value.length > 0 && state.value.every((s) => s.demo);
  });

  protected findRetailers(event: Event, location: string): void {
    event.preventDefault();
    this.router.navigate(['/find-fotia'], { queryParams: { location: location.trim() || null } });
  }

  protected findCoa(event: Event, query: string): void {
    event.preventDefault();
    this.router.navigate(['/lab-results'], { queryParams: { q: query.trim() || null } });
  }
}
