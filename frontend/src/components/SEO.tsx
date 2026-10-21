import React, { useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import { useSiteMetadata } from '../context/SiteMetadataContext';

/**
 * Per-page document metadata.
 *
 * Values come from the administrator-managed settings (favicon, page titles,
 * meta descriptions, Open Graph and Twitter cards), so editing them in the admin
 * panel updates every page without a redeploy. Explicit props still win, which
 * keeps per-entity overrides for listings and seller profiles.
 *
 * The component deliberately does not touch `document.head` itself: it publishes
 * its overrides to `SiteMetadataProvider`, which owns the document head and
 * keeps server-rendered and client-rendered tags identical.
 */
export const SEO: React.FC<{
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
}> = ({ title, description, image, type = 'website' }) => {
  const { setPageOverrides } = useSiteMetadata();
  const { siteSettings } = useSealify();

  const descriptionOverride =
    description ||
    (title ? undefined : siteSettings?.siteDescription || undefined);

  useEffect(() => {
    if (!title && !descriptionOverride && !image) {
      setPageOverrides(null);
      return;
    }

    setPageOverrides({ title, description: descriptionOverride, image, type });
    return () => setPageOverrides(null);
  }, [setPageOverrides, title, descriptionOverride, image, type]);

  return null;
};

export default SEO;
