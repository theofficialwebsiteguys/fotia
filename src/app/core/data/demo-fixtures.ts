import type { Strain } from '../models/strain.model';

/*
 * ─── DEMO FIXTURES ──────────────────────────────────────────────────────────
 * Placeholder entries so the layout can be reviewed before real data exists.
 * Every entry is flagged `demo: true` and labeled "Demo" in the UI.
 *
 * Deliberately absent: genetics, potency, test dates, laboratories and COA
 * files. Nothing here describes a real product. Replace this file (or the
 * CatalogSource provider in app.config.ts) with approved data.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const DEMO_STRAINS: Strain[] = [
  {
    slug: 'strain-preview-01',
    name: 'Strain Preview 01',
    classification: 'Hybrid',
    genetics: 'Placeholder lineage',
    summary: 'Placeholder copy. Approved aroma and flavor notes for this strain will appear here.',
    description:
      'Placeholder copy. This space holds the approved description of the strain: how it looks, how it smells and what sets it apart.',
    aroma: ['Aroma note placeholder'],
    flavor: ['Flavor note placeholder'],
    featured: true,
    demo: true,
    batches: [{ id: 'DEMO-0102' }, { id: 'DEMO-0101' }],
  },
  {
    slug: 'strain-preview-02',
    name: 'Strain Preview 02',
    classification: 'Indica',
    summary: 'Placeholder copy. A short, approved description of this strain’s aroma and flavor goes here.',
    featured: true,
    demo: true,
    batches: [{ id: 'DEMO-0201' }],
  },
  {
    slug: 'strain-preview-03',
    name: 'Strain Preview 03',
    classification: 'Sativa',
    genetics: 'Placeholder lineage',
    summary: 'Placeholder copy. Approved tasting notes will replace this line.',
    featured: true,
    demo: true,
    batches: [{ id: 'DEMO-0302' }, { id: 'DEMO-0301' }],
  },
  {
    slug: 'strain-preview-04',
    name: 'Strain Preview 04',
    classification: 'Hybrid',
    summary: 'Placeholder copy. Shown without batches to preview the “no lab results yet” state.',
    demo: true,
    batches: [],
  },
  {
    slug: 'strain-preview-05',
    name: 'Strain Preview 05',
    classification: 'Indica',
    summary: 'Placeholder copy. Approved aroma and flavor notes for this strain will appear here.',
    demo: true,
    batches: [{ id: 'DEMO-0501' }],
  },
  {
    slug: 'strain-preview-06',
    name: 'Strain Preview 06',
    classification: 'Sativa',
    summary: 'Placeholder copy. A short, approved description of this strain goes here.',
    demo: true,
    batches: [{ id: 'DEMO-0601' }],
  },
];
