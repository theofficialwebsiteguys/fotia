import type { Strain } from './strain.model';

export interface AnalyteResult {
  analyte: string;
  value: number;
  unit: '%' | 'mg/g';
}

/** The certificate of analysis PDF for exactly one batch. */
export interface CoaDocument {
  /** Absolute https URL or a site-relative path to the PDF. */
  url: string;
  /**
   * Optional URL that serves the same file with `Content-Disposition: attachment`.
   * When present, downloads use it directly and skip the in-browser fetch.
   */
  downloadUrl?: string;
  /** Suggested file name for downloads. */
  fileName?: string;
}

export interface Batch {
  /** Batch or lot identifier exactly as printed on the package. */
  id: string;
  /** ISO 8601 date (YYYY-MM-DD) the lab tested this batch. */
  testDate?: string;
  labName?: string;
  /** Summary values copied from this batch's COA. The COA itself remains the source of truth. */
  cannabinoids?: AnalyteResult[];
  terpenes?: AnalyteResult[];
  /** Omitted until the COA file exists. */
  coa?: CoaDocument;
}

/** One batch together with its strain: the unit of a lab-results search. */
export interface BatchMatch {
  strain: Strain;
  batch: Batch;
  /** True when the search query is this batch's exact identifier. */
  exactBatch: boolean;
}
