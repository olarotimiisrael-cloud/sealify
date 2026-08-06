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

  const finalTitle = title ? `${title} | ${siteSettings?.siteName ?? 'Sealify Nigeria'}` : (siteSettings?.siteName ?? 'Sealify Nigeria');
  const finalDescription = (description ?? siteSettings?.siteDescription ?? 'Nigeria\'s Trusted Local Marketplace.').substring(0, 160);
  
  // Use absolute URL for image previews (essential for WhatsApp/X crawlers)
  const finalImage = image?.startsWith('http') 
    ? image 
    : `${window.location.origin}${image ?? siteSettings?.ogImage ?? '/og-image.png'}`;

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

    setMetaTag('name', 'description', finalDescription);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:site_name', siteSettings?.siteName ?? 'Sealify Nigeria');
    setMetaTag('property', 'og:locale', 'en_NG');
    
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', finalImage);
    setMetaTag('name', 'twitter:url', url);
    
    setMetaTag('name', 'theme-color', '#10b981');
  }, [finalTitle, finalDescription, finalImage, url, type, siteSettings?.siteName]);

  return null;
};

export default SEO;