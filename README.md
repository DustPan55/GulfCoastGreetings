# Gulf Coast Greetings

Marketing site for **Gulf Coast Greetings** — curated, locally-inspired welcome gifts for
vacation rentals, realtor closing gifts, and new-tenant gift bags in Rockport, TX.

*Warm Welcomes. Lasting Memories.*

## Stack
- Static multi-page site at the repo root (no build step), deployed by GitHub Pages to
  **https://gulfcoastgreetingstx.com** (domain on Namecheap; `CNAME` file in the repo)
- Google Fonts (Playfair Display, Great Vibes, Mulish)
- Supabase for the contact form, reviews and the Square checkout function

## Local preview
```
python3 -m http.server 8000
```
then open http://localhost:8000/

## Backend (Supabase)
- Dedicated Gulf Coast Greetings project `ubdnxnpptqvyijswjyju` (free plan) · tables `gcg_inquiries`, `gcg_reviews`; schema in `supabase/schema.sql`
- Reviews show only after the owner sets `approved = true` in Table Editor
- Row Level Security: anonymous visitors may **insert** leads only; reads are private (owner only)
- Config lives at the top of `site.js` (project URL and publishable key, safe to expose)

## Viewing submitted leads
Leads are private by RLS. View them in the Supabase dashboard (Table editor → `gcg_inquiries`)
or via SQL. Consider adding an email/Slack notification via a Supabase Edge Function or Database Webhook.

## Contact
See the Contact page on https://gulfcoastgreetingstx.com

## Site files
- Pages share `site.css`, `site.js` and `catalog.js` (products, prices, contents).
- GitHub Pages caches files for 10 minutes. When publishing a change, bump the `?v=` stamp on those
  links in every page so browsers fetch the new copies:
  `V=$(date +%Y%m%d%H%M); sed -i -E "s#(site\.css|catalog\.js|site\.js)\?v=[0-9]+#\1?v=$V#g" *.html`
- The shop used to live under `/v2/`; the pages in `v2/` now only redirect to the root.
  The original single-page site is tagged `v1-original`.

## Square checkout
The cart's Checkout button calls the Supabase Edge Function `square-checkout`
(`supabase/functions/square-checkout/`). It re-prices the cart from the live `catalog.js`
(the browser only sends product ids, quantities and wrap yes/no), enforces the welcome-bag minimum,
adds the catalog's `salesTaxPct`, and returns a Square hosted-checkout link. Square redirects back
to `thank-you.html`, which clears the cart. If the function is unreachable the button says to email instead.

Setup (on the Gulf Coast Greetings Supabase project, `ubdnxnpptqvyijswjyju`):
```
supabase link --project-ref ubdnxnpptqvyijswjyju
supabase secrets set SQUARE_ENV=sandbox SQUARE_ACCESS_TOKEN=... SQUARE_LOCATION_ID=... \
  CATALOG_URL=https://gulfcoastgreetingstx.com/catalog.js \
  ALLOWED_ORIGINS=https://gulfcoastgreetingstx.com,https://www.gulfcoastgreetingstx.com,https://dustpan55.github.io
supabase functions deploy square-checkout --no-verify-jwt
```
Going live: set `SQUARE_ENV=production` with the production token and location id.
Changing domains: add the new origin to `ALLOWED_ORIGINS` and update `CATALOG_URL`.
