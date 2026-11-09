// POST /api/lead: validates a quote request and delivers it.
//   1. GoHighLevel (primary): upsert the contact with tags, add a note with the
//      request details, and open an opportunity in the configured pipeline.
//   2. Google Apps Script backup: only if GoHighLevel isn't configured or fails;
//      emails the lead and logs it to a Google Sheet.
// Also sends a Meta Conversions API Lead event when configured.
import type { APIRoute } from 'astro';
import {
  GHL_API_BASE,
  GHL_LOCATION_ID,
  GHL_PIPELINE_NAME,
  GHL_TOKEN,
  LEAD_BACKUP_SECRET,
  LEAD_BACKUP_URL,
  META_API_VERSION,
  META_CAPI_TOKEN,
  META_TEST_EVENT_CODE,
} from 'astro:env/server';
import { PUBLIC_META_PIXEL_ID } from 'astro:env/client';
import { BUDGETS, PROPERTY_TYPES, TIMELINES } from '../../lib/site';
import { quoteServiceValues } from '../../lib/services';
import { CAMPAIGN_SERVICES, CAMPAIGN_SOURCES } from '../../lib/campaigns';
import { TOWN_SOURCES } from '../../lib/towns';
import { SERVICE_SOURCES } from '../../lib/servicePages';

/** Older service names still accepted, so a page cached before Update 4 can still send a lead. */
const LEGACY_SERVICES = ['Lawn mowing'];

export const prerender = false;

type Lead = {
  name: string;
  phone: string;
  email: string;
  service: string;
  /** "Home" or "Commercial property": required on the main site's forms; the campaign forms don't ask. */
  propertyType: string;
  zip: string;
  budget: string;
  timeline: string;
  message: string;
  page: string;
  /** First page of the visit that carried ad params (remembered by Tracking.astro), if any. */
  adLandingUrl: string;
  formId: string;
  eventId: string;
  /** Set on the ad campaign pages (src/pages/lp/): which page, ad headline and choice the lead came from. */
  source: string;
  adHeadline: string;
  offer: string;
  projectChoice: string;
  /** Set on the town and service pages, e.g. service-area-sayreville or service-fencing. */
  pageSource: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(raw: Record<string, unknown>): { lead?: Lead; error?: string } {
  const lead: Lead = {
    name: str(raw.name, 120),
    phone: str(raw.phone, 30),
    email: str(raw.email, 200),
    service: str(raw.service, 60),
    propertyType: str(raw.property_type, 30),
    zip: str(raw.zip, 10),
    budget: str(raw.budget, 30),
    timeline: str(raw.timeline, 30),
    message: str(raw.message, 1000),
    page: str(raw.page, 500),
    adLandingUrl: str(raw.ad_landing_url, 500),
    formId: str(raw.form_id, 30),
    eventId: str(raw.event_id, 80),
    source: (CAMPAIGN_SOURCES as readonly string[]).includes(str(raw.source, 60)) ? str(raw.source, 60) : '',
    adHeadline: str(raw.ad_headline, 20),
    offer: str(raw.offer, 60),
    projectChoice: ['rebuild', 'refresh'].includes(str(raw.project_choice, 10)) ? str(raw.project_choice, 10) : '',
    pageSource: [...TOWN_SOURCES, ...SERVICE_SOURCES].includes(str(raw.source, 60)) ? str(raw.source, 60) : '',
  };
  if (lead.name.length < 2) return { error: 'Please enter your name.' };
  if (lead.phone.replace(/\D/g, '').length < 10) return { error: 'Please enter a valid phone number.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { error: 'Please enter a valid email address.' };
  const services: readonly string[] = lead.source
    ? [...quoteServiceValues, ...CAMPAIGN_SERVICES, ...LEGACY_SERVICES]
    : [...quoteServiceValues, ...LEGACY_SERVICES];
  if (!services.includes(lead.service)) return { error: 'Please choose a service.' };
  const propertyOk = (PROPERTY_TYPES as readonly string[]).includes(lead.propertyType);
  // Required in the form, but not here: a page cached from before the field existed must still get its lead through.
  if (lead.propertyType && !propertyOk) return { error: 'Please choose a property type.' };
  if (!/^\d{5}(-\d{4})?$/.test(lead.zip)) return { error: 'Please enter a valid ZIP code.' };
  if (lead.budget && !(BUDGETS as readonly string[]).includes(lead.budget)) return { error: 'Please choose a budget range.' };
  if (!(TIMELINES as readonly string[]).includes(lead.timeline)) return { error: 'Please tell us when you are ready to start.' };
  return { lead };
}

/** US numbers to E.164 (+17325550100); anything else keeps its digits with a leading +. */
function e164(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return `+${d}`;
}

const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const AD_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

function adParams(href: string) {
  let url: URL;
  try { url = new URL(href); } catch { return []; }
  return AD_PARAMS.filter((k) => url.searchParams.has(k)).map((k) => `${k}=${url.searchParams.get(k)}`);
}

/**
 * Where the lead came from: an ad landing page or the main site, plus any ad click IDs / UTMs.
 * Uses the form page's own params, else the ones remembered from an earlier page of the visit.
 */
function attribution(page: string, adLandingUrl: string) {
  let url: URL | undefined;
  try { url = new URL(page); } catch { url = undefined; }
  const landing = /^\/(free-design-consultation|lp\/)/.test(url?.pathname ?? '');
  const own = adParams(page);
  const params = own.length ? own : adParams(adLandingUrl);
  return { landing, path: url?.pathname ?? '', params };
}

// ---------------------------------------------------------------- GoHighLevel

const ghlConfigured = () => Boolean(GHL_TOKEN && GHL_LOCATION_ID);

async function ghl(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`${GHL_API_BASE}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${GHL_TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GoHighLevel ${init.method ?? 'GET'} ${path} failed: ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// Pipeline + first stage IDs, looked up by name once per Worker instance.
let pipelineCache: { pipelineId: string; stageId: string } | null | undefined;

async function findPipeline() {
  if (pipelineCache !== undefined) return pipelineCache;
  if (!GHL_PIPELINE_NAME) return (pipelineCache = null);
  const data = await ghl(`/opportunities/pipelines?locationId=${encodeURIComponent(GHL_LOCATION_ID!)}`);
  const wanted = GHL_PIPELINE_NAME.trim().toLowerCase();
  const p = (data.pipelines ?? []).find((x: { name?: string }) => x.name?.trim().toLowerCase() === wanted);
  const stage = p?.stages?.slice().sort((a: { position?: number }, b: { position?: number }) => (a.position ?? 0) - (b.position ?? 0))[0];
  if (!p || !stage) throw new Error(`GoHighLevel pipeline "${GHL_PIPELINE_NAME}" (or its first stage) not found`);
  return (pipelineCache = { pipelineId: p.id, stageId: stage.id });
}

async function sendToGhl(lead: Lead) {
  const [firstName, ...rest] = lead.name.split(/\s+/);
  const src = attribution(lead.page, lead.adLandingUrl);
  const tags = [
    'website-lead',
    `service-${slug(lead.service)}`,
    src.landing ? 'source-ad-landing-page' : 'source-website',
    `timeline-${slug(lead.timeline)}`,
    ...(lead.propertyType ? [`property-${lead.propertyType === 'Home' ? 'home' : 'commercial'}`] : []),
    ...(lead.pageSource ? [lead.pageSource] : []),
    ...(lead.source ? [`campaign-${slug(lead.source)}`] : []),
    ...(lead.projectChoice ? [`choice-${lead.projectChoice}`] : []),
  ];

  const contact = {
    locationId: GHL_LOCATION_ID,
    firstName,
    lastName: rest.join(' '),
    name: lead.name,
    email: lead.email,
    phone: e164(lead.phone),
    postalCode: lead.zip,
    country: 'US',
    source: lead.source
      ? 'Website – ad campaign page'
      : src.landing ? 'Website – free design consultation page' : lead.pageSource.startsWith('service-area-')
        ? 'Website – service area page'
        : lead.pageSource ? 'Website – service page' : 'Website quote form',
    tags,
  };
  // Contact custom fields (created in GoHighLevel: Service Requested, Budget Range, Lead Page,
  // Start Timeline, Project Description) so workflow emails can insert them.
  // If GoHighLevel rejects them, retry without: the lead matters more.
  const customFields = [
    { key: 'service_requested', field_value: lead.service },
    { key: 'budget_range', field_value: lead.budget || 'Not given' },
    { key: 'lead_page', field_value: src.path || lead.page || '—' },
    { key: 'start_timeline', field_value: lead.timeline },
    { key: 'project_description', field_value: lead.message || 'Not given' },
  ];
  let upsert;
  try {
    upsert = await ghl('/contacts/upsert', { method: 'POST', body: { ...contact, customFields } });
  } catch (err) {
    console.error('[lead] GoHighLevel upsert with custom fields failed; retrying without them:', err);
    upsert = await ghl('/contacts/upsert', { method: 'POST', body: contact });
  }
  const contactId: string | undefined = upsert.contact?.id;
  if (!contactId) throw new Error('GoHighLevel upsert returned no contact id');
  console.log(
    `[lead] GoHighLevel contact ${contactId}${upsert.new ? ' (new)' : ''}; custom fields on contact: ${upsert.contact?.customFields?.length ?? 0}; tracking: ${src.params.join(', ') || 'none'}`,
  );

  // The contact exists now, so the lead is safe. Note and opportunity are extras.
  const extras: Promise<unknown>[] = [];
  const note = [
    'Website quote request',
    `Service: ${lead.service}`,
    ...(lead.propertyType ? [`Property type: ${lead.propertyType}`] : []),
    `Budget: ${lead.budget || 'Not given'}`,
    `Ready to start: ${lead.timeline}`,
    `Project: ${lead.message || 'Not given'}`,
    `ZIP: ${lead.zip}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Page: ${src.path || lead.page || '—'}${src.params.length ? `\nTracking: ${src.params.join(', ')}` : ''}`,
    `Form: ${lead.formId || '—'}`,
    ...(lead.source ? [`Campaign: ${lead.source}`] : []),
    ...(lead.pageSource ? [`Page source: ${lead.pageSource}`] : []),
    ...(lead.adHeadline ? [`Ad headline: ${lead.adHeadline}`] : []),
    ...(lead.projectChoice ? [`Choice: ${lead.projectChoice}`] : []),
    ...(lead.offer && lead.offer !== 'none' ? [`Offer: ${lead.offer}`] : []),
  ].join('\n');
  extras.push(ghl(`/contacts/${contactId}/notes`, { method: 'POST', body: { body: note } }));
  extras.push(
    findPipeline().then((p) =>
      p &&
      ghl('/opportunities/', {
        method: 'POST',
        body: {
          locationId: GHL_LOCATION_ID,
          pipelineId: p.pipelineId,
          pipelineStageId: p.stageId,
          contactId,
          name: `${lead.name} – ${lead.service}`,
          status: 'open',
          source: 'Website quote form',
        },
      }),
    ),
  );
  for (const r of await Promise.allSettled(extras)) {
    if (r.status !== 'rejected') continue;
    // A returning customer already has an open opportunity; GoHighLevel refuses a second one.
    if (String(r.reason).includes('OPPORTUNITY_NO_DUPLICATE')) console.log('[lead] Contact already has an opportunity; kept the existing one.');
    else console.error('[lead] GoHighLevel extra step failed:', r.reason);
  }
  return contactId;
}

// ---------------------------------------------------------------- Google backup

async function sendToBackup(lead: Lead, reason: string) {
  const res = await fetch(LEAD_BACKUP_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // The web app URL itself is the key (it lives only in Cloudflare). LEAD_BACKUP_SECRET is an
    // optional extra check, used only if it is also set in the script.
    body: JSON.stringify({ secret: LEAD_BACKUP_SECRET ?? '', reason, ...lead }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) throw new Error(`Lead backup failed: ${res.status} ${JSON.stringify(out).slice(0, 200)}`);
}

// ---------------------------------------------------------------- Meta CAPI

async function sha256(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendCapiLead(lead: Lead, request: Request, ip: string | undefined) {
  const cookies = Object.fromEntries(
    (request.headers.get('cookie') ?? '').split(';').map((c) => c.trim().split('=').map(decodeURIComponent)),
  );
  const user_data: Record<string, unknown> = {
    em: [await sha256(lead.email.toLowerCase())],
    ph: [await sha256(e164(lead.phone).slice(1))],
    zp: [await sha256(lead.zip.slice(0, 5))],
    country: [await sha256('us')],
    client_user_agent: request.headers.get('user-agent') ?? undefined,
    client_ip_address: ip,
    fbp: cookies._fbp,
    fbc: cookies._fbc,
  };
  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${PUBLIC_META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_TOKEN!)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: lead.eventId || undefined, // matches the browser Pixel event for deduplication
            action_source: 'website',
            event_source_url: lead.page || undefined,
            user_data,
            custom_data: { content_name: lead.service },
          },
        ],
        test_event_code: META_TEST_EVENT_CODE?.trim() || undefined,
      }),
    },
  );
  if (!res.ok) throw new Error(`Meta CAPI failed: ${res.status} ${await res.text()}`);
  const out = await res.json().catch(() => ({}));
  console.log(`[lead] Meta CAPI Lead sent; events_received: ${out.events_received ?? '?'}${META_TEST_EVENT_CODE ? ' (test mode)' : ''}`);
  if (out.messages?.length) console.warn('[lead] Meta CAPI messages:', JSON.stringify(out.messages));
}

// ---------------------------------------------------------------- Route

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
  let raw: Record<string, unknown>;
  try {
    raw = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot filled in: pretend success so bots learn nothing.
  if (str(raw.website, 200)) return json({ ok: true });

  const { lead, error } = validate(raw);
  if (!lead) return json({ ok: false, error }, 422);

  let delivered = false;
  let ghlError = 'GoHighLevel not configured';
  if (ghlConfigured()) {
    try {
      await sendToGhl(lead);
      delivered = true;
    } catch (err) {
      ghlError = String(err);
      console.error('[lead]', err);
    }
  }
  if (!delivered && LEAD_BACKUP_URL) {
    try {
      await sendToBackup(lead, ghlError);
      delivered = true;
    } catch (err) {
      console.error('[lead]', err);
    }
  }
  if (!delivered) {
    if (import.meta.env.DEV) {
      console.info('[lead] No delivery configured; lead logged only (dev):', lead);
    } else {
      console.error('[lead] Lead could not be delivered:', JSON.stringify(lead));
      return json({ ok: false, error: 'Could not send your request.' }, 502);
    }
  }

  // Conversion tracking never blocks a lead that was already delivered.
  let ip: string | undefined;
  try { ip = clientAddress; } catch { ip = undefined; }
  if (PUBLIC_META_PIXEL_ID && META_CAPI_TOKEN) {
    try {
      await sendCapiLead(lead, request, ip);
    } catch (err) {
      console.error('[lead]', err);
    }
  }

  if (!isJson) {
    // No-JS fallback: send the visitor back to the page they came from.
    const back = request.headers.get('referer') || '/contact';
    return Response.redirect(new URL(back, request.url).href, 303); // Workers need an absolute URL
  }
  return json({ ok: true });
};
