import type { Batch, BatchMatch } from '../models/lab.model';
import type { Strain } from '../models/strain.model';

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Batch identifiers compare without spaces or punctuation: "demo-0101" matches "DEMO 0101". */
function compactId(value: string): string {
  return normalizeText(value).replace(/ /g, '');
}

export function classificationsOf(strains: readonly Strain[]): string[] {
  const values = strains.map((s) => s.classification).filter((c): c is string => !!c);
  return [...new Set(values)].sort();
}

export function filterStrains(
  strains: readonly Strain[],
  { query = '', classification = '' }: { query?: string; classification?: string },
): Strain[] {
  const q = normalizeText(query);
  return strains.filter(
    (s) => (!classification || s.classification === classification) && (!q || normalizeText(s.name).includes(q)),
  );
}

/** Every batch whose strain name or batch identifier matches; exact batch matches first. */
export function searchBatches(
  strains: readonly Strain[],
  { query = '', strainSlug = '' }: { query?: string; strainSlug?: string },
): BatchMatch[] {
  const q = normalizeText(query);
  const qId = compactId(query);
  const matches: BatchMatch[] = [];

  for (const strain of strains) {
    if (strainSlug && strain.slug !== strainSlug) continue;
    const strainMatches = !q || normalizeText(strain.name).includes(q);

    for (const batch of strain.batches) {
      const id = compactId(batch.id);
      const exactBatch = !!qId && id === qId;
      if (strainMatches || (!!qId && id.includes(qId))) {
        matches.push({ strain, batch, exactBatch });
      }
    }
  }

  return matches.sort((a, b) => Number(b.exactBatch) - Number(a.exactBatch));
}

export function findBatch(strain: Strain, batchId: string | null | undefined): Batch | undefined {
  if (!batchId) return undefined;
  const id = compactId(batchId);
  return strain.batches.find((b) => compactId(b.id) === id);
}
