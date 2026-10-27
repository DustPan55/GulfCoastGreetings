// Creates a Square hosted-checkout link for the shopper's cart and returns its URL.
// Secrets (set with `supabase secrets set`, never in the website):
//   SQUARE_ACCESS_TOKEN  Square access token (sandbox or production)
//   SQUARE_LOCATION_ID   Square location the sale belongs to
//   SQUARE_ENV           "sandbox" or "production"
//   CATALOG_URL          the live catalog.js, the single source of prices
//   ALLOWED_ORIGINS      comma-separated site origins allowed to start a checkout,
//                        e.g. "https://dustpan55.github.io,https://gulfcoastgreetingstx.com"
import { buildOrder, parseCatalog } from './order.js';

const env = (k: string) => Deno.env.get(k) ?? '';
const SQUARE_HOST = env('SQUARE_ENV') === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
const SQUARE_VERSION = '2025-01-23';
const allowed = env('ALLOWED_ORIGINS').split(',').map(s => s.trim()).filter(Boolean);

let cached: { at: number; catalog: any } | null = null;
async function catalog() {
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.catalog;
  const res = await fetch(env('CATALOG_URL') + '?t=' + Date.now());
  if (!res.ok) throw new Error('Catalog fetch failed: ' + res.status);
  cached = { at: Date.now(), catalog: parseCatalog(await res.text()) };
  return cached.catalog;
}

Deno.serve(async req => {
  const origin = req.headers.get('Origin') ?? '';
  const cors = {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey, authorization',
    'Vary': 'Origin',
  };
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return reply(405, { error: 'POST only' });
  if (!allowed.includes(origin)) return reply(403, { error: 'Checkout is not available from this site.' });

  let body: any;
  try { body = await req.json(); } catch { return reply(400, { error: 'Bad request.' }); }

  // The thank-you page must be on an allowed site, so a checkout can't bounce shoppers elsewhere.
  let returnUrl: URL;
  try { returnUrl = new URL(body.returnUrl); } catch { return reply(400, { error: 'Bad return address.' }); }
  if (!allowed.includes(returnUrl.origin)) return reply(400, { error: 'Bad return address.' });

  let order;
  try {
    const cat = await catalog();
    order = buildOrder(cat, body.cart, { locationId: env('SQUARE_LOCATION_ID'), salesTaxPct: cat.salesTaxPct });
  } catch (e) {
    return reply(400, { error: (e as Error).message });
  }

  const res = await fetch(`${SQUARE_HOST}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env('SQUARE_ACCESS_TOKEN')}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      order,
      checkout_options: { redirect_url: returnUrl.href, allow_tipping: false },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.payment_link?.url) {
    console.error('Square error', res.status, JSON.stringify(data.errors ?? data));
    return reply(502, { error: 'Checkout is unavailable right now. Please email us to order.' });
  }
  return reply(200, { url: data.payment_link.url });
});
