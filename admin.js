/* Gulf Coast Greetings owner admin panel.
   Signs in with Supabase Auth; Row Level Security (supabase/migrations/2026-11-07_admin.sql) lets only users
   listed in gcg_admins read orders, branding, logos, messages and reviews. */
(function(){
  const GCG_URL = 'https://ubdnxnpptqvyijswjyju.supabase.co', GCG_KEY = 'sb_publishable_2R1cCTNlNE1qqg00llGBdQ_xeBIQwHL';
  const sb = window.supabase.createClient(GCG_URL, GCG_KEY);
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = c => '$' + ((c || 0) / 100).toFixed(2);
  const when = t => new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const views = ['loginView', 'pwView', 'denyView', 'appView'];
  const show = v => views.forEach(id => { $(id).hidden = id !== v; });
  const flash = (el, kind, text) => { el.className = 'form-msg ' + kind; el.textContent = text; };

  /* ---------- Sign in / out ---------- */
  async function start(){
    const { data: { session } } = await sb.auth.getSession();
    if(!session){ $('userBar').hidden = true; show('loginView'); return; }
    $('userBar').hidden = false; $('userEmail').textContent = session.user.email;
    const { data: isAdmin, error } = await sb.rpc('gcg_is_admin');
    if(error || !isAdmin){ show('denyView'); return; }
    show('appView'); loadOrders(); loadReviews(true);
  }
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('loginBtn'); btn.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: $('lEmail').value.trim(), password: $('lPass').value });
    btn.disabled = false;
    if(error){ flash($('loginMsg'), 'err', 'That email and password didn\'t work. Please try again.'); return; }
    $('lPass').value = ''; $('loginMsg').className = 'form-msg'; start();
  });
  $('signOut').onclick = async () => { await sb.auth.signOut(); start(); };
  $('pwBtn').onclick = () => { $('pwMsg').className = 'form-msg'; show('pwView'); };
  $('pwCancel').onclick = start;
  $('pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const a = $('pNew').value, b = $('pNew2').value;
    if(a.length < 10){ flash($('pwMsg'), 'err', 'Please use at least 10 characters.'); return; }
    if(a !== b){ flash($('pwMsg'), 'err', 'The two passwords don\'t match.'); return; }
    const { error } = await sb.auth.updateUser({ password: a });
    if(error){ flash($('pwMsg'), 'err', error.message); return; }
    $('pwForm').reset(); flash($('pwMsg'), 'ok', 'Password changed.');
  });

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    ({ orders: loadOrders, messages: loadMessages, reviews: () => loadReviews() })[b.dataset.tab]();
  });
  let status = 'pending';
  document.querySelectorAll('[data-status]').forEach(b => b.onclick = () => {
    status = b.dataset.status;
    document.querySelectorAll('[data-status]').forEach(x => x.classList.toggle('on', x === b));
    loadOrders();
  });
  $('refresh').onclick = () => loadOrders();
  const fail = err => { console.error(err); flash($('appMsg'), 'err', 'Something went wrong loading this list. Please refresh the page.'); };

  /* ---------- Orders ---------- */
  async function loadOrders(){
    const el = $('orders'); el.innerHTML = '<p class="adm-empty">Loading…</p>';
    const { data: orders, error } = await sb.from('gcg_orders').select('*').eq('status', status).order('created_at', { ascending: status === 'pending' });
    if(error){ fail(error); el.innerHTML = ''; return; }
    if(status === 'pending') $('cOrders').textContent = orders.length || '';
    if(!orders.length){ el.innerHTML = `<p class="adm-empty">No ${status} orders.</p>`; return; }
    const refs = orders.map(o => o.ref).filter(Boolean);
    const brands = {};
    if(refs.length){
      const { data, error: bErr } = await sb.from('gcg_branding').select('*').in('ref', refs);
      if(bErr) console.error(bErr); else data.forEach(b => { brands[b.ref] = b; });
    }
    const logos = {};
    await Promise.all(Object.values(brands).filter(b => b.logo_path).map(async b => {
      const view = await sb.storage.from('logos').createSignedUrl(b.logo_path, 3600);
      const dl = await sb.storage.from('logos').createSignedUrl(b.logo_path, 3600, { download: true });
      logos[b.ref] = { view: view.data && view.data.signedUrl, dl: dl.data && dl.data.signedUrl, pdf: /\.pdf$/i.test(b.logo_path) };
    }));
    el.innerHTML = orders.map(o => orderCard(o, brands[o.ref], logos[o.ref])).join('');
    el.querySelectorAll('[data-set]').forEach(b => b.onclick = async () => {
      b.disabled = true;
      const next = b.dataset.set;
      const { error: uErr } = await sb.from('gcg_orders').update({ status: next, fulfilled_at: next === 'fulfilled' ? new Date().toISOString() : null }).eq('id', +b.dataset.id);
      if(uErr){ b.disabled = false; fail(uErr); return; }
      loadOrders();
    });
  }
  function orderCard(o, brand, logo){
    const name = (brand && brand.business_name) || o.customer_name || 'Website order';
    const items = (o.items || []).map(i => `<li>${esc(i.quantity)} × ${esc(i.name)} <span style="color:var(--muted)">${money(i.total_cents)}</span></li>`).join('');
    let branding;
    if(brand){
      const logoHtml = logo && logo.view
        ? `<div class="logo">${logo.pdf ? '<span class="chip">PDF logo</span>' : `<img src="${esc(logo.view)}" alt="Logo for ${esc(brand.business_name)}">`}
             <a class="btn btn-ghost" href="${esc(logo.dl || logo.view)}">Download logo</a></div>`
        : brand.email_later ? '<p class="warn">Logo not uploaded: the customer said they\'ll email it.</p>' : '<p class="warn">Logo file not found.</p>';
      branding = `<p><b>${esc(brand.business_name)}</b></p>${brand.card_info ? `<p class="card-info">${esc(brand.card_info)}</p>` : ''}${logoHtml}`;
    } else {
      branding = o.ref ? '<p class="warn">Branding details not found.</p>' : '<p style="color:var(--muted)">No branding entered in the cart. For welcome bags, check the business info on the Square order.</p>';
    }
    const contact = [
      o.customer_name ? esc(o.customer_name) : '',
      o.customer_email ? `<a href="mailto:${esc(o.customer_email)}">${esc(o.customer_email)}</a>` : '',
      o.customer_phone ? `<a href="tel:${esc(o.customer_phone.replace(/[^\d+]/g, ''))}">${esc(o.customer_phone)}</a>` : ''
    ].filter(Boolean).join('<br>') || '<span style="color:var(--muted)">No contact details</span>';
    const action = o.status === 'pending'
      ? `<button class="btn btn-teal" data-set="fulfilled" data-id="${o.id}">Mark fulfilled</button>`
      : `<button class="btn btn-ghost" data-set="pending" data-id="${o.id}">Move back to pending</button>`;
    return `<article class="ord">
      <div class="ord-top"><h3>${esc(name)}</h3><span class="when">${when(o.created_at)}${o.fulfilled_at ? ' · fulfilled ' + when(o.fulfilled_at) : ''}</span></div>
      <div><h4>Items</h4><ul>${items}</ul><p class="total">Total ${money(o.total_cents)}</p>${o.ref ? `<p>Ref <span class="ref">${esc(o.ref)}</span></p>` : ''}</div>
      <div><h4>Customer</h4><p>${contact}</p><h4 style="margin-top:12px">Branding</h4>${branding}</div>
      <div class="ord-actions">${action}</div>
    </article>`;
  }

  /* ---------- Messages (contact form) ---------- */
  async function loadMessages(){
    const el = $('messages'); el.innerHTML = '<p class="adm-empty">Loading…</p>';
    const { data, error } = await sb.from('gcg_inquiries').select('*').order('created_at', { ascending: false }).limit(200);
    if(error){ fail(error); el.innerHTML = ''; return; }
    el.innerHTML = data.length ? data.map(m => `<article class="msg-item">
      <p class="meta">${when(m.created_at)} · ${esc(m.inquiry_type)}${m.units ? ' · ' + esc(m.units) : ''}</p>
      <p><b>${esc(m.name)}</b>${m.company ? ' · ' + esc(m.company) : ''}<br>
        <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` · <a href="tel:${esc(m.phone.replace(/[^\d+]/g, ''))}">${esc(m.phone)}</a>` : ''}</p>
      ${m.message ? `<p style="margin-top:8px">${esc(m.message)}</p>` : ''}
    </article>`).join('') : '<p class="adm-empty">No messages yet.</p>';
  }

  /* ---------- Reviews ---------- */
  async function loadReviews(countOnly){
    const { data, error } = await sb.from('gcg_reviews').select('*').order('created_at', { ascending: false });
    if(error){ fail(error); return; }
    const waiting = data.filter(r => !r.approved).length;
    $('cReviews').textContent = waiting || '';
    if(countOnly) return;
    const el = $('reviews');
    el.innerHTML = data.length ? data.map(r => `<article class="msg-item">
      <p class="meta">${when(r.created_at)} · ${r.approved ? '<span class="chip">Showing on site</span>' : '<span class="chip wait">Waiting for approval</span>'}</p>
      <p><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span> <b>${esc(r.name)}</b>${r.org ? ' · ' + esc(r.org) : ''}</p>
      <p style="margin-top:6px">${esc(r.body)}</p>
      <div class="ord-actions" style="border:0;padding-top:8px">
        ${r.approved ? `<button class="btn btn-ghost" data-rv="unapprove" data-id="${r.id}">Hide from site</button>`
                     : `<button class="btn btn-teal" data-rv="approve" data-id="${r.id}">Approve</button>`}
        <button class="btn btn-ghost" data-rv="delete" data-id="${r.id}">Delete</button>
      </div>
    </article>`).join('') : '<p class="adm-empty">No reviews yet.</p>';
    el.querySelectorAll('[data-rv]').forEach(b => b.onclick = async () => {
      const id = +b.dataset.id, act = b.dataset.rv;
      if(act === 'delete' && !confirm('Delete this review for good?')) return;
      b.disabled = true;
      const q = sb.from('gcg_reviews');
      const { error: e2 } = act === 'delete' ? await q.delete().eq('id', id) : await q.update({ approved: act === 'approve' }).eq('id', id);
      if(e2){ b.disabled = false; fail(e2); return; }
      loadReviews();
    });
  }

  sb.auth.onAuthStateChange(ev => { if(ev === 'SIGNED_OUT') show('loginView'); });
  start();
})();
