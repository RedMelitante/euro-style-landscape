# Euro Style Landscape website

Astro build of the approved designs in `../euro-style-landscape-website-handoff` (see its `HANDOFF.md`).

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static pages + the /api/lead Worker in dist/
npx wrangler deploy  # publish to Cloudflare (eurostylelandscape.com)
```

Hosted on Cloudflare Workers (Worker `euro-style-landscape`).
DNS for eurostylelandscape.com is on Cloudflare; the domain stays registered at Squarespace.
`www` redirects to the root via a Cloudflare Redirect Rule; "Always Use HTTPS" is on.
HSTS is on (SSL/TLS → Edge Certificates): max-age 6 months, includeSubDomains, no preload, so any new
subdomain must serve HTTPS. Turn HSTS off and wait out the max-age before ever moving off HTTPS.
`docs/dns-snapshot-before-cloudflare.txt` holds the DNS records from before the move.

## Structure

| Path | What |
|---|---|
| `src/pages/` | `/`, `/about`, `/services`, `/our-work`, `/contact`, `/free-design-consultation` (ad landing, noindex), `/privacy-policy`, `api/lead.ts` |
| `src/pages/lp/` | Ad campaign pages (noindex, not in the sitemap), built from `design/lp-*.dc.html` in the handoff. They use `CampaignLayout`, not the site header or footer. `src/lib/campaigns.ts` holds their form sources, service options, the `OFFER_ON` flag and the `NEW_CLIENT_OFFER_ON` switch for the 20% new client offer (pieces in `src/components/campaign/offer/`). Forms post to `/api/lead` like the main form, with the same required email and timeline. |
| `src/layouts/BaseLayout.astro` | Head/SEO/OG, fonts, tracking, header/footer/sticky bar. `landing` prop switches to the ad-landing header and footer. |
| `src/components/` | Header, LandingHeader, Footer, MobileStickyBar, QuoteForm, BeforeAfter, SectionHeader, PageBanner, TrustTiles, HowItWorks, CommitmentCards, CheckList, CtaBand, PhotoMosaic, GalleryGrid, ProjectCard, Logo, Icon, Photo, Tracking |
| `src/styles/tokens.css` | Design tokens from the handoff (`global.css` imports it) |
| `src/data/projects.json` | Our Work gallery data |
| `src/data/services.json` | All service copy: `/services` cards, home chips, footer links, quote form options (read via `src/lib/services.ts`). When the client sends photos for Concrete, Outdoor kitchens, Stone veneer or Asphalt, add `image` + `alt` there and the icon card becomes a photo card. |
| `src/assets/images/` | Project photos, served as AVIF/WebP via `<Photo>` |

## Leads

`POST /api/lead` validates the form server-side and drops honeypot submissions, then delivers the lead:

1. **GoHighLevel** (sub-account "Eurostyle Landscape"): upserts the contact with tags `website-lead`,
   `service-<name>`, `timeline-<right-now|just-looking>` and `source-website` / `source-ad-landing-page`,
   adds a note with the request and any UTM / click IDs, and opens an opportunity in the first stage of
   `GHL_PIPELINE_NAME` (a returning contact keeps their existing opportunity).
   It also fills contact custom fields `service_requested`, `budget_range`, `lead_page`, `start_timeline`
   and `project_description` (retrying without them if GoHighLevel rejects them). Owner alerts and customer auto-replies are a GoHighLevel workflow
   triggered by the `website-lead` tag: see `docs/gohighlevel-website-lead-workflow.md`.
2. **Google Apps Script backup**, only if GoHighLevel isn't configured or fails: emails the lead and logs
   it to a Google Sheet (`docs/google-apps-script-lead-backup.gs` has the script and setup steps).
3. If both fail the visitor is asked to call, and the full lead is written to the Worker logs.

It also sends a Meta CAPI `Lead` event when configured (deduplicated with the browser Pixel via `event_id`).
Non-secret settings are in `wrangler.jsonc`; secrets are set with `npx wrangler secret put GHL_TOKEN`
(and `LEAD_BACKUP_URL`, optional `LEAD_BACKUP_SECRET`, `META_CAPI_TOKEN`).

## Tracking

Meta Pixel, GA4 and Google Ads load only when their `PUBLIC_*` IDs are set. `Lead` / Ads lead
conversion fire after the server accepts a submission; `Contact` / Ads call conversion fire on any
`tel:` click.

A page opened with UTMs / `fbclid` / `gclid` is remembered for 30 days (`localStorage` key `es_ad_landing`),
so a form sent later from another page still carries the ad's params into the GoHighLevel note.

`PUBLIC_*` IDs are baked in at build time from `.env` (not committed). Current values:
`PUBLIC_META_PIXEL_ID=2933979290297621` (Events Manager dataset "Euro Style Landscape website",
business 657269950785249) and `PUBLIC_GA4_ID=G-FCTH58CDRZ` (GA4 property "eurostylelandscape.com",
account 413250340 / property 560512081, owned by seannachajski@eurostylelandscape.com). Rebuilding
without those `.env` lines removes the tags from the site.

GA4 sends `generate_lead` (form accepted) and `click_to_call` (any `tel:` click); both are marked as key
events in Admin → Data display → Events (done 2026-10-26). Google Search Console: Domain property
`eurostylelandscape.com` in the same Google account, verified by a `google-site-verification=…` TXT record
on the root in Cloudflare DNS (keep it), sitemap `https://eurostylelandscape.com/sitemap-index.xml`
submitted, and linked to the GA4 property.

To check server (CAPI) events in Events Manager → Test events, temporarily store the code it shows,
then delete it so real leads count normally. Use Git Bash: PowerShell pipes add an invisible character.

    printf 'TEST12345' | npx.cmd wrangler secret put META_TEST_EVENT_CODE
    npx.cmd wrangler secret delete META_TEST_EVENT_CODE

## Before launch (HANDOFF §11)

- Client approves the draft text in `src/pages/privacy-policy.astro`, then remove its `noindex`.
- `GHL_TOKEN` set and a test lead confirmed in GoHighLevel; GoHighLevel kept on a paid plan after the trial.
- Optional: Google Apps Script backup deployed and its two secrets set.
- If leads will get automatic texts: SMS consent line on the form, A2P 10DLC registration, privacy policy updated.
- Tracking IDs: Meta Pixel and GA4 + Search Console done (2026-10-23); Google Ads still to come.
- Street address only if the client approves (then add `streetAddress` to the JSON-LD in `src/pages/index.astro`).
