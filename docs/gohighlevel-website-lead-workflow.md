# GoHighLevel: website lead workflow (owner alert + customer thank-you)

Sub-account: **Eurostyle Landscape**. Every quote request from eurostylelandscape.com arrives as a contact
tagged `website-lead` (plus `service-…` and `source-website` / `source-ad-landing-page`), with a note and
a **New Lead** opportunity in **Marketing Pipeline**. This workflow emails the owner and thanks the customer.

---

## Part 1: create 3 contact custom fields (one time, ~3 minutes)

The website fills these so the emails can say what the customer wants.

**Settings → Custom Fields → + Add Field**, for each of these:

| Field type | Name (type exactly) | Object | Field key GoHighLevel should show |
|---|---|---|---|
| Single Line | `Service Requested` | Contact | `contact.service_requested` |
| Single Line | `Budget Range` | Contact | `contact.budget_range` |
| Single Line | `Lead Page` | Contact | `contact.lead_page` |
| Single Line | `Start Timeline` | Contact | `contact.start_timeline` |
| Multi Line | `Project Description` | Contact | `contact.project_description` |

Put them in any folder (e.g. "Additional Info"). If GoHighLevel shows a **different key** than the last
column, the website needs a one-line change, so check before moving on.

---

## Part 2: build the workflow (~10 minutes)

**Automation → Workflows → Create workflow → Start from scratch.**
Name it **Website lead – owner alert + thank-you**.

### Trigger
- **Add New Trigger → Contact Tag**
- Filter: **Tag Added** → `website-lead`
- Save trigger.

### Action 1: email the owner
**+ → Send Internal Notification → Type: Email**
- **Send to:** Custom email → `seannachajski@eurostylelandscape.com`
- **Subject:** `New quote request: {{contact.service_requested}} – {{contact.name}}`
- **Message:**

```
New quote request from the website.

Name: {{contact.name}}
Phone: {{contact.phone}}
Email: {{contact.email}}
ZIP: {{contact.postal_code}}
Service: {{contact.service_requested}}
Ready to start: {{contact.start_timeline}}
Budget: {{contact.budget_range}}
Project: {{contact.project_description}}
Page: {{contact.lead_page}}

Open the contact in GoHighLevel to see the full note and the opportunity.
```

Tip: insert the `{{…}}` fields with the **tag / custom values picker** in the editor rather than typing
them, so the names always match.

### Action 2: thank the customer
**+ → Send Email**
- **From name:** `Euro Style Landscape`
- **Reply-to:** `seannachajski@eurostylelandscape.com`
- **Subject:** `Thanks, {{contact.first_name}} – we got your request`
- **Message:**

```
Hi {{contact.first_name}},

Thanks for contacting Euro Style Landscape about {{contact.service_requested}}.
We'll call you to book a time to visit for your free, no-obligation consultation.

If you'd like to talk sooner, call us at (732) 803-9646.

Euro Style Landscape
Sayreville, NJ · serving Middlesex County
```

### Action 3: reset the tag
**+ → Remove Contact Tag** → `website-lead`

The website adds `website-lead` on every submission, so removing it here means a second request from the
same person triggers the workflow again.

### Settings and publish
- Workflow **Settings → Allow re-entry: ON** (same reason as Action 3).
- Toggle **Draft → Publish**, then **Save**.

---

## Part 3: test

1. Submit the form on https://eurostylelandscape.com/contact with your own email address and the name
   "Test Lead – please delete".
2. Within a minute: the owner email arrives at seannachajski@eurostylelandscape.com, and the thank-you
   arrives in your inbox (check spam the first time).
3. In GoHighLevel the contact should show Service Requested / Budget Range / Lead Page filled in.
4. Delete the test contact and its opportunity afterwards.

---

## Later (optional)

- **Owner SMS alert:** after a phone number is added (Settings → Phone System) and A2P 10DLC registration
  is approved, add **Send Internal Notification → Type: SMS** next to Action 1.
- **Texting customers:** needs the same registration, plus an SMS consent line on the website form and in
  the privacy policy. Ask the developer before switching it on.
- **Better email deliverability:** set up a dedicated sending domain (Settings → Email Services), e.g.
  `mail.eurostylelandscape.com`. Its DNS records go in Cloudflare (DNS for the domain lives there now).
- **Follow-up reminder:** after Action 3, add **Wait 2 hours → If/Else: opportunity still in "New Lead"**
  → **Send Internal Notification** "Lead not contacted yet: {{contact.name}} {{contact.phone}}".
