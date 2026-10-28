import { TEST_STRAINS } from '../../testing/test-catalog';
import { classificationsOf, filterStrains, findBatch, searchBatches } from './catalog-search';

describe('catalog search', () => {
  it('filters strains by name, ignoring case and punctuation', () => {
    expect(filterStrains(TEST_STRAINS, { query: 'TEST-strain' }).map((s) => s.slug)).toEqual(['test-strain']);
    expect(filterStrains(TEST_STRAINS, { query: 'nothing' })).toEqual([]);
  });

  it('only reports classifications present in the data', () => {
    expect(classificationsOf(TEST_STRAINS)).toEqual(['Hybrid']);
  });

  it('finds a batch by identifier regardless of formatting and ranks exact matches first', () => {
    const results = searchBatches(TEST_STRAINS, { query: 'ts 001' });
    expect(results.length).toBe(1);
    expect(results[0].batch.id).toBe('TS-001');
    expect(results[0].exactBatch).toBeTrue();
  });

  it('returns every batch of a strain when searching by strain name', () => {
    const results = searchBatches(TEST_STRAINS, { query: 'test strain' });
    expect(results.map((r) => r.batch.id)).toEqual(['TS-002', 'TS-001']);
    expect(results.every((r) => !r.exactBatch)).toBeTrue();
  });

  it('restricts results to the selected strain', () => {
    expect(searchBatches(TEST_STRAINS, { strainSlug: 'other-strain' })).toEqual([]);
  });

  it('resolves batches for deep links', () => {
    expect(findBatch(TEST_STRAINS[0], 'ts-002')?.id).toBe('TS-002');
    expect(findBatch(TEST_STRAINS[0], 'missing')).toBeUndefined();
    expect(findBatch(TEST_STRAINS[0], null)).toBeUndefined();
  });
});
