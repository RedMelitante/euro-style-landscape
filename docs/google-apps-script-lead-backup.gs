/**
 * Euro Style Landscape — lead backup (Google Apps Script).
 *
 * The website sends a lead here ONLY when GoHighLevel can't be reached. The script
 * emails it from the Google account that deploys it and adds a row to the "Leads" sheet.
 *
 * Setup (about 10 minutes, signed in as seannachajski@eurostylelandscape.com):
 *  1. Create a Google Sheet called "Euro Style website leads".
 *  2. Extensions → Apps Script. Replace the code with this file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.   → Deploy, then approve the permissions.
 *  4. Copy the Web app URL (ends in /exec) and store it in Cloudflare, from the website folder:
 *       npx.cmd wrangler secret put LEAD_BACKUP_URL
 *
 * The long, random /exec URL is the key: it is stored only in Cloudflare, never in the website's
 * pages. Optional extra check: set SECRET below to a long random string and store the same value
 * with `npx.cmd wrangler secret put LEAD_BACKUP_SECRET`. Leave SECRET empty to skip the check.
 */
const SECRET = '';
const NOTIFY = 'seannachajski@eurostylelandscape.com';
const SHEET_NAME = 'Leads';
const COLUMNS = ['Received', 'Name', 'Phone', 'Email', 'Service', 'ZIP', 'Budget', 'Page', 'Form', 'Why backup was used', 'Ready to start', 'Project description'];

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: 'bad json' });
  }
  if (!data || (SECRET && data.secret !== SECRET)) return reply({ ok: false, error: 'unauthorized' });
  if (!data.name || !data.email || !data.phone) return reply({ ok: false, error: 'missing fields' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  // Header row is (re)written every time so columns added later appear in existing sheets too.
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  // Leading apostrophe keeps ZIPs as text so New Jersey's leading zero (08872) isn't dropped.
  sheet.appendRow([new Date(), data.name, data.phone, data.email, data.service, "'" + data.zip, data.budget || '', data.page || '', data.formId || '', data.reason || '', data.timeline || '', data.message || '']);

  const rows = [
    ['Name', data.name], ['Phone', data.phone], ['Email', data.email], ['Service', data.service],
    ['Ready to start', data.timeline || '—'], ['Project', data.message || 'Not given'],
    ['ZIP', data.zip], ['Budget', data.budget || 'Not given'], ['Page', data.page || '—'],
  ];
  MailApp.sendEmail({
    to: NOTIFY,
    replyTo: data.email,
    name: 'Euro Style website',
    subject: 'New quote request: ' + data.service + ' — ' + data.name,
    htmlBody: '<h2>New quote request</h2><table cellpadding="6">' +
      rows.map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td>' + escapeHtml(String(r[1])) + '</td></tr>'; }).join('') +
      '</table><p style="color:#777">Sent by the website backup because GoHighLevel was unavailable. Reply to answer the customer.</p>',
  });
  return reply({ ok: true });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
