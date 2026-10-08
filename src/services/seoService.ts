/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task } from '../types';
import { getTaskCanonicalPath } from '../utils/slugify';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredDataJson?: object[];
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://freelahub.com.br';

/**
 * Updates DOM head tags dynamically for client-side navigation.
 * Updates <title>, <meta description>, canonical, og:tags, and JSON-LD scripts.
 */
export function applySeoMetadata(meta: SeoMetadata): void {
  if (typeof document === 'undefined') return;

  // Title
  document.title = meta.title;

  // Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', meta.description);

  // Canonical
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', meta.canonicalUrl);

  // Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);

  // Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);

  // Open Graph URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', meta.canonicalUrl);

  // Open Graph Image
  let ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg && meta.ogImage) ogImg.setAttribute('content', meta.ogImage);

  // Injected JSON-LD
  // Clean prior dynamic LD+JSON tags
  const existingDynamic = document.querySelectorAll('script[data-dynamic-seo="true"]');
  existingDynamic.forEach((el) => el.remove());

  if (meta.structuredDataJson && meta.structuredDataJson.length > 0) {
    meta.structuredDataJson.filter(Boolean).forEach((dataObj) => {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-dynamic-seo', 'true');
      script.textContent = JSON.stringify(dataObj);
      document.head.appendChild(script);
    });
  }
}

/**
 * Checks if a task is already expired or slots full.
 */
export function isTaskExpired(task: Task): boolean {
  if (task.expiresAt) {
    const expTime = new Date(task.expiresAt).getTime();
    if (!isNaN(expTime) && expTime < Date.now()) {
      return true;
    }
  }
  if (task.slotsTotal > 0 && task.slotsFilled >= task.slotsTotal) {
    return true;
  }
  return false;
}

/**
 * Generates Google Jobs compliant JobPosting JSON-LD for an individual job page ONLY.
 * Never used on home or feed.
 * When a task is expired, returns null so it is not indexed as an active job by Google.
 */
export function generateJobPostingSchema(task: Task): object | null {
  // If the task has expired or slots are full, do not emit an active JobPosting schema
  if (isTaskExpired(task)) {
    return null;
  }

  const isRemote = task.locationType === 'home';
  const canonicalUrl = `${BASE_URL}${getTaskCanonicalPath(task)}`;

  // Parse posted ISO date or default
  const postedISO = task.postedDate?.includes('T') ? task.postedDate : new Date().toISOString();
  const validThrough = task.expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: task.title,
    description: task.description,
    datePosted: postedISO,
    validThrough: validThrough,
    employmentType: 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: task.company || 'FreelaHub',
      sameAs: 'https://freelahub.com.br',
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'FreelaHub',
      value: task.id,
    },
    url: canonicalUrl,
  };

  // Base Pay
  if (task.basePay) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: {
        '@type': 'QuantitativeValue',
        value: task.basePay,
        unitText: task.payType === 'hora' ? 'HOUR' : 'DAY',
      },
    };
  }

  // Location
  if (isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'Brasil',
    };
  } else {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: task.city || 'São Paulo',
        addressRegion: task.state || 'SP',
        addressCountry: 'BR',
        postalCode: task.postalCode || '01000-000',
        streetAddress: task.neighborhood ? `Bairro ${task.neighborhood}` : undefined,
      },
    };

    if (task.latitude && task.longitude) {
      schema.jobLocation.geo = {
        '@type': 'GeoCoordinates',
        latitude: task.latitude,
        longitude: task.longitude,
      };
    }
  }

  return schema;
}

/**
 * Generates BreadcrumbList Schema.org
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Organization Schema.org
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FreelaHub',
    url: BASE_URL,
    logo: `${BASE_URL}/logo-freelahub.png`,
    description: 'Plataforma de oportunidades profissionais e postagens freelancer diárias com suporte e pagamentos via PIX.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-99127-1914',
      contactType: 'customer support',
      areaServed: 'BR',
      availableLanguage: ['Portuguese'],
    },
    sameAs: [
      'https://instagram.com/freelahub',
      'https://wa.me/5511991271914',
    ],
  };
}

/**
 * WebSite Schema.org with search action
 */
export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FreelaHub',
    url: BASE_URL,
    description: 'Encontre oportunidades de freelancer no Brasil com remuneração transparente e saques via PIX.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/vagas?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
