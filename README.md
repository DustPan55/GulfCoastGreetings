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
  `V=$(date +%Y%m%d%H%M); sed -i -E "s#(site\.css|catalog\.js|site\.js|admin\.css|admin\.js)\?v=[0-9]+#\1?v=$V#g" *.html`
- Short print addresses: `/realtor/` and `/rentals/` forward to the realtor and vacation-rental pages (used on brochures).
- The shop used to live under `/v2/`; the pages in `v2/` now only redirect to the root.
  The original single-page site is tagged `v1-original`.

## Square checkout
The cart's Checkout button calls the Supabase Edge Function `square-checkout`
(`supabase/functions/square-checkout/`). It re-prices the cart from the live `catalog.js`
(the browser only sends product ids, quantities and add-ons: wrap, Capri Sun), enforces the welcome-bag minimum,
adds the catalog's `salesTaxPct`, and returns a Square hosted-checkout link. Square redirects back
to `thank-you.html`, which clears the cart. If the function is unreachable the button says to email instead.

## Branding, paid orders and the admin panel
- **Branding (welcome bags):** when the cart has welcome bags, the cart drawer asks for the business name (required),
  card details and a logo (PNG/JPG/WebP/GIF/PDF, up to 10 MB, or "I'll email my logo later"). At checkout the logo is
  uploaded to the private `logos` storage bucket as `GCG-XXXXXX/<file>`, a `gcg_branding` row is saved with the same
  reference, and the reference goes to `square-checkout`, which puts it on the Square order (`reference_id` and a note
  on the first welcome-bag line). If the details can't be saved, checkout continues and Square's payment page asks for
  the business info instead. The thank-you page confirms the logo, or shows the email-your-logo step.
- **Paid orders:** Square calls the `square-webhook` function (`supabase/functions/square-webhook/`) when a payment
  completes. It checks Square's signature, reads the order and customer from Square, saves one `gcg_orders` row per
  Square order (retries never duplicate) and emails the owner once through Resend, with the logo attached.
- **Admin panel:** `admin.html` (not linked anywhere, not indexed). The owner signs in with email and password and sees
  pending/fulfilled orders with customer contact, items, branding and the logo (preview + download), contact-form
  messages, and reviews to approve, hide or delete. Access is enforced by Row Level Security: only users listed in
  `gcg_admins` can read any of it.

Setup, once (database, storage, owner account): run `supabase/migrations/2026-11-07_admin.sql` in the SQL Editor
(after `schema.sql`). Then in the dashboard:
1. Authentication -> Users -> Add user: `Welcome@gulfcoastgreetingstx.com` with a temporary password (auto-confirm).
2. Run the commented `insert into public.gcg_admins ...` at the end of the migration.
3. Authentication -> Sign In / Providers: turn off "Allow new users to sign up".
4. The owner signs in at `/admin.html` and uses "Change password".

Webhook and email:
```
supabase secrets set SQUARE_WEBHOOK_SIGNATURE_KEY=... \
  NOTIFICATION_URL=https://ubdnxnpptqvyijswjyju.supabase.co/functions/v1/square-webhook \
  RESEND_API_KEY=... ALERT_FROM="Gulf Coast Greetings <orders@gulfcoastgreetingstx.com>" \
  ALERT_TO=Welcome@gulfcoastgreetingstx.com
supabase functions deploy square-webhook --no-verify-jwt
```
In Square's developer site (the GCG app, Production): Webhooks -> Subscriptions -> Add, URL = the `NOTIFICATION_URL`
above, events `payment.created` and `payment.updated`; copy its signature key into `SQUARE_WEBHOOK_SIGNATURE_KEY`.
In Resend, verify `gulfcoastgreetingstx.com` (DNS records go in Namecheap; leave the Private Email MX records alone).

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
