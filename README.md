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
- Project: **FieldAudit** (shared) · table `gcg_inquiries` (prefixed to stay isolated)
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
