# Euro Style Landscape website: notes for Claude

The live site is https://eurostylelandscape.com. This repo's `main` branch is the real source and matches what is
deployed. Read `README.md` for the structure, lead flow and tracking. This file covers how to work on it safely,
including from a cloud session.

## Setup

- **Node 22.22 or newer** (Astro 7 requires it). Check `node -v` first; if it is older, install Node 24 before
  anything else.
- `npm ci`
- Create `.env` (git-ignored) with the two public tracking IDs listed in `README.md` → Tracking:
  `PUBLIC_META_PIXEL_ID` and `PUBLIC_GA4_ID`. Without them the build silently drops the Meta Pixel and GA4 from
  every page, so never deploy a build made without `.env`.
- Secrets (`GHL_TOKEN`, `LEAD_BACKUP_URL`, `META_CAPI_TOKEN`) exist only in Cloudflare. They are never in this
  repo, `.env` or chat, and you don't need them to build.

## Commands

| Task | Command |
| --- | --- |
| Build | `npm run build` |
| Type check | `npm i --no-save @astrojs/check typescript`, then `npx astro check` (expect 0 errors) |
| Run the built Worker locally | `npx wrangler dev --config dist/server/wrangler.json --port 8788` |
| Deploy | `npx wrangler deploy` (needs `CLOUDFLARE_API_TOKEN` set in the environment; see below) |

On Windows PowerShell use `npm.cmd` / `npx.cmd`.

## Rules

1. **Keep the live setup.** When handoff notes or designs conflict with what is live, the live setup wins:
   - leads go to GoHighLevel, with the Google Apps Script sheet as backup (not Brevo or other form services)
   - every quote form requires **email** and **"When are you ready to start?"** (`timeline`); the GoHighLevel
     thank-you email and Meta match quality depend on email
   - phone taps send GA4 `click_to_call` (a key event) and Meta `Contact`
   - the bot trap field is `website`
   - the header and footer use the client's own logo (`src/assets/logo/euro-style-landscape-logo.jpg`)
2. **Ask before deploying** and before pushing to `main`. Deploys go live immediately.
3. **Never send a valid lead to the live site without asking.** It creates a real GoHighLevel contact, emails the
   client an owner alert, and counts as a real Lead in Meta. Test against a local Worker with a fake backup:
   `wrangler dev ... --var LEAD_BACKUP_URL:http://127.0.0.1:8799/` plus a tiny server that answers `{"ok":true}`.
4. **Keep test traffic out of real analytics.** Local pages built with the real `.env` send real GA4 hits. Env
   overrides don't beat `.env` here, so for tests swap the IDs in the build output only
   (`sed -i 's/<GA4 id>/G-TEST000000/g; s/<pixel id>/1234567890/g'` over `dist/client` and `dist/server`), and
   run a clean `npm run build` before any deploy. The Meta dataset only accepts events from
   eurostylelandscape.com.
5. **This repo is public.** Don't commit `.env`, tokens, the client's street address (not approved for
   publishing) or anyone's account login email.
6. Check results yourself before reporting them (open the live page, read the Worker log with
   `npx wrangler tail euro-style-landscape`).

## Deploying from a cloud session

`wrangler deploy` needs a Cloudflare API token in the environment as `CLOUDFLARE_API_TOKEN`. The site owner creates
it in the Cloudflare dashboard (My Profile → API Tokens → "Edit Cloudflare Workers" template, limited to this
account) and adds it to the cloud environment's settings. Never paste it into chat or commit it. Without the
token, build and push, and the owner deploys from their computer.

## Ad campaign pages (`src/pages/lp/`)

- Eight `noindex` pages for the fall cleanup and rebuild-or-refresh ads, kept out of the sitemap. They use
  `src/layouts/CampaignLayout.astro`, not the site header and footer.
- They were converted from the `lp-*.dc.html` design files in the client handoff folder (not in this repo). The
  converter was a one-off, so edit the `.astro` files directly.
- `src/lib/campaigns.ts` holds each form's `source`, the extra service options `/api/lead` accepts from those
  sources, and `OFFER_ON` (the "first month free" offer, off until the client confirms it in writing).
- **20% new client offer** (handoff `UPDATE-3-OFFERS.md`, matches the running ads): `NEW_CLIENT_OFFER_ON` in
  `src/lib/campaigns.ts` turns it on or off on all eight pages. Off hides every offer piece and the offer FAQ, puts
  back the regular wording, and makes the forms send `offer: none`. The client ends it after the season. The
  pieces are in `src/components/campaign/offer/` and `src/styles/campaign-offer.css`; keep the offer copy word for
  word. The lead forms send `offer: new-client-20-off` (on `/lp/rebuild-or-refresh` only with the Refresh choice),
  which shows in the GoHighLevel note, and the Lead / `generate_lead` events carry `offer: new_client_20` or `none`.
- `?h=` swaps the headline on `/lp/landscape-cleanup-quote` (`fall`, `overgrown`, `offer`) and the hero on
  `/lp/rebuild-or-refresh` (`2027`, `fall`).

## Open items (as of 2026-11-06)

- Client to confirm: haul-away and whether they need to be home for the estimate, the town list, 2027 start
  timing, and the privacy policy text. ("Licensed & insured" was confirmed by the client in handoff update 3.) Remove the privacy page's
  `noindex` only after they approve it.
- No ads point at the campaign pages yet.
- Real lead delivery from a campaign page has been tested once (GoHighLevel and Meta received it), but it updated
  an existing test contact, so the GoHighLevel thank-you and owner-alert emails are not yet confirmed for these
  pages.
- Lighthouse mobile 90+ on the campaign pages is unmeasured. On large desktops four hero photos are 219–406 KB,
  over the ~200 KB target; on phones they are 25–41 KB.
