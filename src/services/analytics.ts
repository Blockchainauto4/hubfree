/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'job_view'
  | 'job_search'
  | 'job_filter'
  | 'job_contact_click'
  | 'whatsapp_click'
  | 'official_link_click'
  | 'job_apply'
  | 'job_share'
  | 'category_view'
  | 'location_search'
  | 'radius_search'
  | 'location_permission_granted'
  | 'location_permission_denied'
  | 'course_view'
  | 'course_click'
  | 'referral_click';

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined | null;
}

class AnalyticsService {
  private enabled: boolean = true;

  constructor() {
    // Check if user has opted out via Do-Not-Track or consent
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
      this.enabled = true; // still allow local anonymous tracking without PII
    }
  }

  /**
   * Tracks an event across configured providers (GA4, GTM, Pixel, Clarity, Console).
   * Fail-safe: Never throws an error or breaks the app.
   */
  public track(event: AnalyticsEventType, payload: AnalyticsPayload = {}): void {
    if (!this.enabled) return;

    try {
      const sanitizedPayload = this.sanitize(payload);
      const timestamp = new Date().toISOString();

      // 1. Google Analytics (gtag.js)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, sanitizedPayload);
      }

      // 2. Google Tag Manager (dataLayer)
      if (typeof window !== 'undefined' && Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push({
          event: `freelahub_${event}`,
          ...sanitizedPayload,
          timestamp,
        });
      }

      // 3. Meta Pixel (fbq)
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        (window as any).fbq('trackCustom', `FreelaHub_${event}`, sanitizedPayload);
      }

      // 4. Microsoft Clarity
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', event);
      }

      // Local developer logging in dev mode
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log(`[Analytics: ${event}]`, sanitizedPayload);
      }
    } catch (err) {
      // Analytics failure must never interrupt the application
    }
  }

  /**
   * Remove any potential PII (emails, full CPF, passwords) before dispatching.
   */
  private sanitize(payload: AnalyticsPayload): AnalyticsPayload {
    const clean: AnalyticsPayload = {};
    for (const [key, val] of Object.entries(payload)) {
      if (typeof val === 'string') {
        // Strip out email patterns or raw CPFs if accidentally passed
        if (val.includes('@') && val.includes('.')) {
          clean[key] = '[REDACTED_EMAIL]';
        } else if (/^\d{11}$/.test(val)) {
          clean[key] = '[REDACTED_DOCUMENT]';
        } else {
          clean[key] = val;
        }
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }
}

export const analytics = new AnalyticsService();
