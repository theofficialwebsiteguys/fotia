import type { Batch } from './lab.model';

/** A flower photograph. Supply natural-color photos; 4:5 portrait or 1:1 frames best. */
export interface StrainPhoto {
  src: string;
  /** Optional responsive candidates, e.g. "assets/strains/x-800.webp 800w, assets/strains/x-1200.webp 1200w". */
  srcset?: string;
  /** Intrinsic pixel size, used to reserve space and prevent layout shift. */
  width: number;
  height: number;
  alt: string;
  /** CSS object-position for photos whose subject isn't centered. */
  focus?: string;
}

export interface Strain {
  slug: string;
  name: string;
  /** e.g. "Hybrid". Shown, and filterable, only when supplied. */
  classification?: string;
  /** Lineage as approved, e.g. "Parent A × Parent B". Shown only when supplied. */
  genetics?: string;
  /** One or two sentences of aroma/flavor copy for cards. */
  summary: string;
  /** Longer copy for the detail page. Falls back to `summary`. */
  description?: string;
  aroma?: string[];
  flavor?: string[];
  photo?: StrainPhoto;
  featured?: boolean;
  /** Every published batch, newest first. Lab data always belongs to a batch, never to the strain. */
  batches: Batch[];
  /** Marks placeholder fixtures; the UI labels them "Demo". */
  demo?: boolean;
}
