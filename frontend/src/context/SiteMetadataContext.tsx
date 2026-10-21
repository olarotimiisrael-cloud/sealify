import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_SITE_METADATA,
  applyMetadataToDocument,
  resolveMetadataForBrowser,
  type DocumentMetadataOverrides,
  type ResolvedMetadata,
  type SiteMetadata,
} from '@/lib/siteMetadata';

interface SiteMetadataContextValue {
  settings: SiteMetadata;
  resolved: ResolvedMetadata;
  loading: boolean;
  error: string | null;
  /** Re-fetch from `/api/site-metadata` (used after admin saves). */
  refresh: () => Promise<void>;
  /**
   * Page-level overrides (listing title, description, image). Pages publish
   * their entity metadata here instead of writing to `document.head`
   * themselves, so the provider stays the single writer of the document head.
   */
  setPageOverrides: (overrides: DocumentMetadataOverrides | null) => void;
}

const SiteMetadataContext = createContext<SiteMetadataContextValue>({
  settings: DEFAULT_SITE_METADATA,
  resolved: resolveMetadataForBrowser(DEFAULT_SITE_METADATA, '/'),
  loading: false,
  error: null,
  refresh: async () => {},
  setPageOverrides: () => {},
});

async function fetchSiteMetadata(path: string): Promise<SiteMetadata> {
  const response = await fetch(`/api/site-metadata?path=${encodeURIComponent(path)}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Site metadata request failed');
  }

  const payload = (await response.json()) as { settings?: SiteMetadata } | null;
  return payload?.settings || DEFAULT_SITE_METADATA;
}

/**
 * Hydrates administrator-managed metadata for the whole app and keeps the
 * document head in sync across client-side route changes. The edge middleware
 * renders the same tags server-side for crawlers; this keeps the live document
 * identical after SPA navigation and reflects admin edits within one fetch.
 */
export const SiteMetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteMetadata>(DEFAULT_SITE_METADATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<DocumentMetadataOverrides | null>(null);
  const [resolved, setResolved] = useState<ResolvedMetadata>(() =>
    resolveMetadataForBrowser(DEFAULT_SITE_METADATA, '/'),
  );

  const load = useCallback(async (path: string) => {
    try {
      const next = await fetchSiteMetadata(path);
      setSettings(next);
      setError(null);
    } catch {
      // Non-fatal: compiled defaults and the static tags in index.html stay in
      // place, so a metadata outage never breaks the marketplace.
      setError('Using built-in defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await load(location.pathname);
  }, [load, location.pathname]);

  useEffect(() => {
    void load(location.pathname);
  }, [load, location.pathname]);

  // Pick up admin edits made in another tab.
  useEffect(() => {
    const onFocus = () => {
      void fetchSiteMetadata(location.pathname)
        .then((next) => setSettings(next))
        .catch(() => undefined);
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [location.pathname]);

  useEffect(() => {
    const next = resolveMetadataForBrowser(settings, location.pathname, overrides || {});
    setResolved(next);
    applyMetadataToDocument(next, overrides || {});
  }, [settings, location.pathname, overrides]);

  const value = useMemo<SiteMetadataContextValue>(
    () => ({ settings, resolved, loading, error, refresh, setPageOverrides: setOverrides }),
    [settings, resolved, loading, error, refresh],
  );

  return <SiteMetadataContext.Provider value={value}>{children}</SiteMetadataContext.Provider>;
};

export function useSiteMetadata(): SiteMetadataContextValue {
  return useContext(SiteMetadataContext);
}

/**
 * Publish entity metadata (listing detail, seller profile) on top of the
 * administrator-managed defaults.
 */
export function usePageMetadata(options: {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
}): void {
  const { setPageOverrides } = useSiteMetadata();
  const { title, description, image, type } = options;

  useEffect(() => {
    if (!title && !description && !image) {
      setPageOverrides(null);
      return;
    }

    setPageOverrides({ title, description, image, type });
    return () => setPageOverrides(null);
  }, [setPageOverrides, title, description, image, type]);
}

export default SiteMetadataProvider;
