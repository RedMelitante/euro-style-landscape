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
| `src/pages/` | `/`, `/about`, `/services`, `/our-work`, `/contact`, `/who-we-serve`, `/free-design-consultation` (ad landing, noindex), `/privacy-policy`, `/terms`, `api/lead.ts`. Each website route sets the SEO values and JSON-LD and renders its body from `src/components/pages/`. |
| `src/pages/services/` | 9 indexable service pages (`/services/<key>`) from `[service].astro`: SEO values in `src/data/service-pages.json`, page bodies in `src/components/pages/service-<key>.astro`. |
| `src/pages/service-areas/` | 19 indexable town pages (`/service-areas/<town>`) from `[town].astro`: SEO values in `src/data/towns.json`, page bodies in `src/components/pages/town-<slug>.astro`; plus the `/service-areas` list. |
| `src/pages/lp/` | Ad campaign pages (noindex, not in the sitemap), built from `design/lp-*.dc.html` in the handoff. They use `CampaignLayout`, not the site header or footer. `src/lib/campaigns.ts` holds their form sources, the extra services `/api/lead` accepts from them and the offer switches. |
| `src/components/pages/` | The website page bodies, converted from the handoff's update 6–8 designs (`design/*.dc.html`, copied word for word). Edit these files for copy. |
| `src/components/site/` | Website pieces shared by every page: offer top bar, header (Services / Areas dropdowns), footer (social icons), mobile Call / Free consultation bar, sidebar, quote section, review cards, `Img` (image pipeline) and `Video`. |
| `src/layouts/BaseLayout.astro` | Website pages: head/SEO/OG, fonts, tracking, chat widget; `minimal` gives privacy and terms the "Back to website" header. `LandingLayout` is the free design consultation ad page; `CampaignLayout` the `/lp/*` pages. |
| `src/styles/site.css` | Website design system (update 6 §2–3: colours, Barlow / Barlow Condensed, all page sections). `tokens.css` + `global.css` are the older theme, still used by the quote form, the before/after slider and `/free-design-consultation`. |
| `src/data/reviews.json` | Google rating (4.9), review count (87), the "Read all on Google" link and the six featured reviews, word for word (`src/lib/reviews.ts`). No review/rating schema. |
| `src/data/faqs.json` | Each page's FAQ questions for the FAQPage JSON-LD (the same text as the page; `offer` items follow `NEW_CLIENT_OFFER_ON`). Change it together with the page body. |
| `src/data/services.json` | The quote form's "Service needed" options (read via `src/lib/services.ts`). |
| `src/assets/images/` | Project photos, served as AVIF/WebP via `<Img>` / `<Photo>`. `public/videos/` holds the six silent project videos (posters in `src/assets/images/*-poster.jpg`). |

## Leads

`POST /api/lead` validates the form server-side and drops honeypot submissions, then delivers the lead:

1. **GoHighLevel** (sub-account "Eurostyle Landscape"): upserts the contact with tags `website-lead`,
   `service-<name>`, `timeline-<right-now|just-looking>`, `property-<home|commercial>`, the page the form was on
   (`service-area-<town>`, `service-<key>` or `page-<home|about|contact|our-work|services|service-areas|who-we-serve>`)
   and `source-website` / `source-ad-landing-page`,
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

## Chat widget

A GoHighLevel chat widget loads when `GHL_CHAT_WIDGET_ID` in `src/lib/site.ts` is set (empty = no chat). It
shows on the main site and the town pages, not on `/lp/*` or `/free-design-consultation`, and its script is
fetched only after the page goes idle or on the first scroll, tap or key press. The privacy policy's
"Website chat" line appears only while it is set. The widget in use is GoHighLevel's "A2P Compliance Chat Widget
Marketing" (SMS / Email type, with the texting consent checkbox for the A2P 10DLC registration), so change its
consent text only together with the privacy policy's "Text messages" section. `ChatWidget.astro` adds two styles inside the widget's
shadow DOM: the closed widget's invisible box no longer swallows clicks on what's under it (such as the footer's
Privacy policy and Terms links), and below 1024px the bubble sits above the sticky Call / Free consultation bar. Chats go straight to GoHighLevel Conversations: they don't
pass through `/api/lead`, get the `website-lead` tag or fire Lead / `generate_lead`, so client alerts for chats
need their own GoHighLevel workflow.

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
- Street address only if the client approves (then add `streetAddress` to `business()` in `src/lib/schema.ts`).
