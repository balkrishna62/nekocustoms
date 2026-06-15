import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';

const SchemaMarkup = ({ title, description, keywords, faqData, isLocalBusiness = false }) => {
  const { settings } = useSettings();
  const { language } = useTranslation();

  useEffect(() => {
    // 1. Update document title
    const activeSiteName = language === 'np' ? settings.site_name_np || 'नेको भन्सार' : settings.site_name;
    const defaultTitle = settings.seo_meta_title || 'Custom Clearance Agent Biratnagar';
    document.title = title ? `${title} | ${activeSiteName}` : defaultTitle;

    // 2. Update description tag
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = description || settings.seo_meta_desc || '';

    // 3. Update keywords tag
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.content = keywords || settings.seo_meta_keywords || '';

    // 4. Set up Schema.org JSON-LD scripts
    const scriptIds = [];

    // Inject LocalBusiness Schema (GEO / Search Engine)
    if (isLocalBusiness) {
      const businessSchemaId = 'seo-local-business-schema';
      scriptIds.push(businessSchemaId);
      
      let businessScript = document.getElementById(businessSchemaId);
      if (!businessScript) {
        businessScript = document.createElement('script');
        businessScript.type = 'application/ld+json';
        businessScript.id = businessSchemaId;
        document.head.appendChild(businessScript);
      }

      // Coordinates for ICD Biratnagar
      const localBusinessData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": language === 'np' ? settings.site_name_np || 'नेको भन्सार' : settings.site_name,
        "image": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
        "@id": window.location.origin,
        "url": window.location.origin,
        "telephone": settings.site_phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Dry Port Road, ICD Biratnagar",
          "addressLocality": "Biratnagar",
          "addressRegion": "Morang, Koshi Province",
          "postalCode": "56600",
          "addressCountry": "NP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 26.398670,
          "longitude": 87.269094
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "09:00",
          "closes": "17:00"
        },
        "sameAs": [
          "https://www.facebook.com",
          "https://www.linkedin.com"
        ]
      };
      businessScript.text = JSON.stringify(localBusinessData);
    }

    // Inject FAQ Schema (AEO / Answer Engines)
    if (faqData && faqData.length > 0) {
      const faqSchemaId = 'seo-faq-schema';
      scriptIds.push(faqSchemaId);

      let faqScript = document.getElementById(faqSchemaId);
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.id = faqSchemaId;
        document.head.appendChild(faqScript);
      }

      const formattedFaq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
      faqScript.text = JSON.stringify(formattedFaq);
    }

    // Cleanup scripts on component unmount
    return () => {
      scriptIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [title, description, keywords, faqData, isLocalBusiness, settings]);

  return null; // This component is pure side-effect, rendering nothing to DOM
};

export default SchemaMarkup;
