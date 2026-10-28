export interface NavItem {
  label: string;
  path: string;
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface SiteConfig {
  contact: { email?: string; phone?: string };
  social: ExternalLink[];
  legal: { notices: string[]; links: ExternalLink[] };
  integrations: {
    /** Set when a map provider is configured; the retailer list works without one. */
    mapProvider: { name: string } | null;
  };
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Strains', path: '/strains' },
  { label: 'Find Fotia', path: '/find-fotia' },
  { label: 'Lab Results', path: '/lab-results' },
  { label: 'Our Story', path: '/our-story' },
];

/**
 * Site-wide content that must come from Fotia. Anything left empty is omitted
 * from the UI rather than shown as a placeholder or dead link.
 */
export const SITE_CONFIG: SiteConfig = {
  // Approved contact details, e.g. { email: 'hello@…', phone: '+1 …' }.
  contact: {},
  // Approved profiles, e.g. { label: 'Instagram', url: 'https://www.instagram.com/<handle>' }.
  social: [],
  // Approved legal copy (age requirement, license numbers, required warnings) and policy links.
  legal: { notices: [], links: [] },
  integrations: { mapProvider: null },
};
