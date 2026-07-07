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
