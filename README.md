# Gulf Coast Greetings

Marketing site for **Gulf Coast Greetings** — curated, locally-inspired welcome gifts for
vacation rentals, realtor closing gifts, and new-tenant gift bags in Rockport, TX.

*Warm Welcomes. Lasting Memories.*

## Stack
- Single self-contained `index.html` (no build step) — deploy to GitHub Pages
- Google Fonts (Playfair Display, Great Vibes, Mulish)
- Supabase for the "Request a Consultation" lead form

## Local preview
Open `index.html` in a browser, or run a static server:
```
python3 -m http.server 8000
```

## Backend (Supabase)
- Original site (root `index.html`): Supabase **FieldAudit** (shared, work) · table `gcg_inquiries`
- v2 site: dedicated Gulf Coast Greetings project `ubdnxnpptqvyijswjyju` (free plan) · tables `gcg_inquiries`, `gcg_reviews`; schema in `supabase/schema.sql`
- Reviews show only after the owner sets `approved = true` in Table Editor
- Row Level Security: anonymous visitors may **insert** leads only; reads are private (owner only)
- Config lives in the `<script>` block at the bottom of `index.html`
  (`SUPABASE_URL`, `SUPABASE_KEY` — publishable key, safe to expose)

## Viewing submitted leads
Leads are private by RLS. View them in the Supabase dashboard (Table editor → `gcg_inquiries`)
or via SQL. Consider adding an email/Slack notification via a Supabase Edge Function or Database Webhook.

## Contact
979-743-5350 · Welcome@gulfcoastgreetingstx.com · GulfCoastGreetingsTX.com

## v2 (redesign, multi-page) at `/v2/`
- Pages share `v2/site.css`, `v2/site.js` and `v2/catalog.js` (products, prices, contents).
- GitHub Pages caches files for 10 minutes. When publishing a change, bump the `?v=` stamp on those
  links in every `v2/*.html` so browsers fetch the new copies:
  `V=$(date +%Y%m%d%H%M); sed -i -E "s#(site\.css|catalog\.js|site\.js)\?v=[0-9]+#\1?v=$V#g" v2/*.html`
- The original single-page site stays at the root; it is also tagged `v1-original`.

## Square checkout (v2)
The cart's Checkout button calls the Supabase Edge Function `square-checkout`
(`supabase/functions/square-checkout/`). It re-prices the cart from the live `v2/catalog.js`
(the browser only sends product ids, quantities and wrap yes/no), enforces the welcome-bag minimum,
adds the catalog's `salesTaxPct`, and returns a Square hosted-checkout link. Square redirects back
to `v2/thank-you.html`, which clears the cart. If the function is unreachable the button says to call or text.

Setup (on the Gulf Coast Greetings Supabase project, `ubdnxnpptqvyijswjyju`):
```
supabase link --project-ref ubdnxnpptqvyijswjyju
supabase secrets set SQUARE_ENV=sandbox SQUARE_ACCESS_TOKEN=... SQUARE_LOCATION_ID=... \
  CATALOG_URL=https://dustpan55.github.io/GulfCoastGreetings/v2/catalog.js \
  ALLOWED_ORIGINS=https://dustpan55.github.io
supabase functions deploy square-checkout --no-verify-jwt
```
Going live: set `SQUARE_ENV=production` with the production token and location id.
When the site moves to its own domain, add that origin to `ALLOWED_ORIGINS` and update `CATALOG_URL`.
