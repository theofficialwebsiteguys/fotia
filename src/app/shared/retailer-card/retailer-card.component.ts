import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { RetailerListing } from '../../core/models/retailer.model';
import { directionsUrl } from '../../core/retailers/retailer-directory';
import { IconComponent } from '../icon/icon.component';
import { InventoryStatusComponent } from '../inventory-status/inventory-status.component';

@Component({
  selector: 'app-retailer-card',
  imports: [DecimalPipe, RouterLink, IconComponent, InventoryStatusComponent],
  templateUrl: './retailer-card.component.html',
  styleUrl: './retailer-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetailerCardComponent {
  readonly listing = input.required<RetailerListing>();
  protected readonly retailer = computed(() => this.listing().retailer);
  protected readonly directions = computed(() => directionsUrl(this.retailer().address));
}
