// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Hosted on Cloudflare Workers. Pages are static assets; only /api/lead runs
// on demand (it sends each lead to GoHighLevel). Settings: wrangler.jsonc.
export default defineConfig({
  site: 'https://eurostylelandscape.com',
  output: 'static',
  trailingSlash: 'never', // keeps sitemap URLs identical to the canonical links
  // about.html (not about/index.html) so Cloudflare serves /about without redirecting to /about/
  build: { format: 'file' },
  adapter: cloudflare({
    // Optimise photos with Sharp at build time; no Cloudflare Images binding needed.
    imageService: 'compile',
  }),
  // The site doesn't use sessions, so no KV namespace is provisioned.
  session: false,
  integrations: [
    sitemap({
      // noindex pages stay out of the sitemap
      filter: (page) => !page.includes('/free-design-consultation') && !page.includes('/privacy-policy'),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-hanken',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
    },
  ],
  env: {
    schema: {
      // Lead delivery (server only, read at runtime).
      // Primary: GoHighLevel. Backup (used only if GoHighLevel fails): a Google Apps Script
      // web app that emails the lead and logs it to a Google Sheet (docs/google-apps-script-lead-backup.gs).
      GHL_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      GHL_LOCATION_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      // New leads become an opportunity in this pipeline's first stage. Empty = no opportunity.
      GHL_PIPELINE_NAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      GHL_API_BASE: envField.string({ context: 'server', access: 'secret', default: 'https://services.leadconnectorhq.com' }),
      LEAD_BACKUP_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      LEAD_BACKUP_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      META_CAPI_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      META_API_VERSION: envField.string({ context: 'server', access: 'secret', default: 'v21.0' }),
      // Only while testing: the code shown in Events Manager → Test events (e.g. TEST12345).
      META_TEST_EVENT_CODE: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Tracking IDs (public, inlined at build time). Leave empty to disable.
      PUBLIC_META_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GADS_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GADS_LEAD_LABEL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GADS_CALL_LABEL: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
