import React, { useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url = window.location.href,
  type = "website",
}) => {
  const { siteSettings } = useSealify();

  const finalTitle = title ? `${title} | ${siteSettings.siteName}` : siteSettings.siteName;
  const finalDescription = description || siteSettings.siteDescription;
  const finalImage = image || siteSettings.ogImage;

  useEffect(() => {
    document.title = finalTitle;

    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary Metadata
    setMetaTag('name', 'description', finalDescription);

    // Open Graph / Facebook / WhatsApp
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:site_name', siteSettings.siteName);

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', finalImage);
  }, [finalTitle, finalDescription, finalImage, url, type, siteSettings.siteName, siteSettings.siteDescription]);

  return null;
};

export default SEO;