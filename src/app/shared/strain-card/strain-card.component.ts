import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Strain } from '../../core/models/strain.model';
import { IconComponent } from '../icon/icon.component';
import { StrainPhotoComponent } from '../strain-photo/strain-photo.component';

@Component({
  selector: 'app-strain-card',
  imports: [RouterLink, IconComponent, StrainPhotoComponent],
  templateUrl: './strain-card.component.html',
  styleUrl: './strain-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrainCardComponent {
  readonly strain = input.required<Strain>();
  /** 3 under a section heading, 2 directly under the page's h1. */
  readonly headingLevel = input<2 | 3>(3);

  protected readonly link = computed(() => ['/strains', this.strain().slug]);
  protected readonly meta = computed(() =>
    [this.strain().classification, this.strain().genetics].filter(Boolean).join(' · '),
  );
  /** "View COA" opens the strain's lab section on its latest batch. */
  protected readonly coaQuery = computed(() => {
    const latest = this.strain().batches[0];
    return latest ? { batch: latest.id } : null;
  });
}
