import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map, take } from 'rxjs';

import { StrainService } from '../../core/catalog/strain.service';
import type { Strain } from '../../core/models/strain.model';

const strainFor = (slug: string | null) => inject(StrainService).bySlug(slug ?? '').pipe(take(1));

export const strainResolver: ResolveFn<Strain | null> = (route) =>
  strainFor(route.paramMap.get('slug')).pipe(map((strain) => strain ?? null));

export const strainTitleResolver: ResolveFn<string> = (route) =>
  strainFor(route.paramMap.get('slug')).pipe(map((strain) => strain?.name ?? 'Strain not found'));

export const strainDescriptionResolver: ResolveFn<string> = (route) =>
  strainFor(route.paramMap.get('slug')).pipe(map((strain) => strain?.summary ?? ''));
