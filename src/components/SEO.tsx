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
  const finalDescription = (description || siteSettings.siteDescription).substring(0, 160);
  
  // Use absolute URL for image previews (essential for X/Facebook crawlers)
  const finalImage = image?.startsWith('http') 
    ? image 
    : `${window.location.origin}${image || siteSettings.ogImage}`;

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

    // Open Graph / Facebook / LinkedIn / WhatsApp
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:site_name', siteSettings.siteName);
    setMetaTag('property', 'og:locale', 'en_NG');
    
    // Twitter / X
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', finalImage);
    setMetaTag('name', 'twitter:url', url);
    
    // Theme and Mobile
    setMetaTag('name', 'theme-color', '#10b981');
  }, [finalTitle, finalDescription, finalImage, url, type, siteSettings.siteName]);

  return null;
};

export default SEO;