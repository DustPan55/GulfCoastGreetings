// Square calls this when a payment changes. For completed payments it records the paid order in
// gcg_orders (with the cart's branding reference) and emails the owner once per order.
// Secrets (set with `supabase secrets set`, never in the website):
//   SQUARE_WEBHOOK_SIGNATURE_KEY  signature key of the Square webhook subscription
//   NOTIFICATION_URL              the exact URL registered in Square, e.g.
//                                 https://ubdnxnpptqvyijswjyju.supabase.co/functions/v1/square-webhook
//   SQUARE_ACCESS_TOKEN           same token the checkout function uses (reads orders and customers)
//   SQUARE_ENV                    "sandbox" or "production"
//   RESEND_API_KEY                Resend API key for the order emails
//   ALERT_FROM                    sender, e.g. "Gulf Coast Greetings <orders@gulfcoastgreetingstx.com>"
//   ALERT_TO                      where order emails go, e.g. Welcome@gulfcoastgreetingstx.com
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
// Deploy with --no-verify-jwt: Square can't send a Supabase login, the signature check guards the endpoint.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { encodeBase64 } from 'jsr:@std/encoding@1/base64';

const env = (k: string) => Deno.env.get(k) ?? '';
const SQUARE_HOST = env('SQUARE_ENV') === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
const SQUARE_VERSION = '2025-01-23';
const MAX_ATTACH = 8 * 1024 * 1024;
const ADMIN_URL = 'https://gulfcoastgreetingstx.com/admin.html';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (c: number) => '$' + (c / 100).toFixed(2);

// Square signs NOTIFICATION_URL + raw body with HMAC-SHA256 and sends it base64-encoded.
async function validSignature(body: string, signature: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env('SQUARE_WEBHOOK_SIGNATURE_KEY')),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(env('NOTIFICATION_URL') + body)));
  const expected = new TextEncoder().encode(encodeBase64(mac));
  const given = new TextEncoder().encode(signature);
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
  return diff === 0;
}

async function square(path: string) {
  const res = await fetch(SQUARE_HOST + path, {
    headers: { 'Authorization': `Bearer ${env('SQUARE_ACCESS_TOKEN')}`, 'Square-Version': SQUARE_VERSION },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Square ${path} ${res.status}: ${JSON.stringify(data.errors ?? data)}`);
  return data;
}

async function sendEmail(row: Record<string, any>, branding: Record<string, any> | null) {
  const who = branding?.business_name || row.customer_name || 'website customer';
  const items = (row.items ?? []).map((i: any) => `<li>${esc(i.quantity)} × ${esc(i.name)} — ${money(i.total_cents ?? 0)}</li>`).join('');
  const attachments: { filename: string; content: string }[] = [];
  let logoLine = '';
  if (branding?.logo_path) {
    const { data: file, error } = await db.storage.from('logos').download(branding.logo_path);
    if (error || !file) { console.error('logo download', error); logoLine = 'Logo uploaded, but it could not be attached. Open the admin panel to download it.'; }
    else if (file.size > MAX_ATTACH) logoLine = 'Logo uploaded (too large to attach). Open the admin panel to download it.';
    else {
      attachments.push({ filename: branding.logo_path.split('/').pop(), content: encodeBase64(new Uint8Array(await file.arrayBuffer())) });
      logoLine = 'Logo attached.';
    }
  } else if (row.ref) logoLine = 'No logo uploaded: the customer will email it.';
  else logoLine = 'No branding was entered in the cart. Check the Square order for the business info.';

  const html = `
    <h2 style="font-family:Georgia,serif;color:#16324f">New paid order: ${esc(who)}</h2>
    <p><b>Total:</b> ${money(row.total_cents ?? 0)}${row.ref ? ` &nbsp;·&nbsp; <b>Branding ref:</b> ${esc(row.ref)}` : ''}</p>
    <h3>Items</h3><ul>${items}</ul>
    ${branding ? `<h3>Branding</h3><p><b>Business name:</b> ${esc(branding.business_name)}</p>
      ${branding.card_info ? `<p><b>Card details:</b><br>${esc(branding.card_info).replace(/\n/g, '<br>')}</p>` : ''}` : ''}
    <p>${esc(logoLine)}</p>
    <h3>Customer</h3>
    <p>${esc(row.customer_name || '(no name)')}<br>${row.customer_email ? `<a href="mailto:${esc(row.customer_email)}">${esc(row.customer_email)}</a>` : ''}
      ${row.customer_phone ? `<br>${esc(row.customer_phone)}` : ''}</p>
    <p><a href="${ADMIN_URL}">Open the admin panel</a> to see all pending orders.</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env('ALERT_FROM'), to: env('ALERT_TO').split(',').map(s => s.trim()).filter(Boolean),
      reply_to: row.customer_email || undefined,
      subject: `New order: ${who} — ${money(row.total_cents ?? 0)}`, html, attachments,
    }),
  });
  if (!res.ok) console.error('Resend', res.status, await res.text());
}

Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  const body = await req.text();
  if (!(await validSignature(body, req.headers.get('x-square-hmacsha256-signature') ?? ''))) {
    return new Response('Bad signature', { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(body); } catch { return new Response('Bad JSON', { status: 400 }); }
  const payment = event?.data?.object?.payment;
  if (!['payment.created', 'payment.updated'].includes(event?.type) || payment?.status !== 'COMPLETED' || !payment.order_id) {
    return new Response('ignored', { status: 200 });
  }

  try {
    const { order } = await square(`/v2/orders/${encodeURIComponent(payment.order_id)}`);
    let customer: any = null;
    if (payment.customer_id) {
      customer = (await square(`/v2/customers/${encodeURIComponent(payment.customer_id)}`).catch(e => { console.error(e); return {}; })).customer ?? null;
    }
    const ref = /^GCG-[A-Z0-9]{6}$/.test(order?.reference_id ?? '') ? order.reference_id : null;
    const row = {
      square_order_id: order.id,
      square_payment_id: payment.id,
      ref,
      customer_name: [customer?.given_name, customer?.family_name].filter(Boolean).join(' ') || null,
      customer_email: customer?.email_address || payment.buyer_email_address || null,
      customer_phone: customer?.phone_number || null,
      items: (order.line_items ?? []).map((l: any) => ({ name: l.name, quantity: Number(l.quantity), total_cents: l.total_money?.amount ?? 0 })),
      total_cents: order.total_money?.amount ?? payment.total_money?.amount ?? 0,
    };

    // Insert once per Square order. Retries and the created/updated pair return no rows, so they never re-email.
    const { data: inserted, error } = await db.from('gcg_orders')
      .upsert(row, { onConflict: 'square_order_id', ignoreDuplicates: true }).select('id');
    if (error) throw error;
    if (inserted && inserted.length) {
      const { data: branding } = ref
        ? await db.from('gcg_branding').select('business_name, card_info, logo_path, email_later').eq('ref', ref).maybeSingle()
        : { data: null };
      await sendEmail(row, branding).catch(e => console.error('email', e));
    }
  } catch (e) {
    // Not recorded: return an error so Square retries the notification later.
    console.error('webhook', e);
    return new Response('error', { status: 500 });
  }
  return new Response('ok', { status: 200 });
});
