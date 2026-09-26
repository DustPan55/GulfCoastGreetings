/* Gulf Coast Greetings: shared behavior for every page.
   Each page provides <header id="siteHead">, <footer id="siteFoot"> and sets <body data-page="...">;
   this script fills in the header, footer and cart, then wires whatever sections the page contains. */
(function(){
  const CAT = window.GCG_CATALOG;
  /* Supabase backend. The publishable key is safe to expose; access is limited by Row Level Security
     (see supabase/schema.sql). REVIEWS_* point at the dedicated Gulf Coast Greetings project. */
  const LEADS_URL = 'https://gbrdnlnhushxfgkudcce.supabase.co', LEADS_KEY = 'sb_publishable_qgc0My9kI2jwbBVa6o03eA_bJHyA1U_';
  const REVIEWS_URL = '', REVIEWS_KEY = '';
  const sbClient = (url, key) => url && key && window.supabase ? window.supabase.createClient(url, key) : null;
  const PAGE = document.body.dataset.page || '';
  const money = n => '$' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ARROW = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const PAGES = [
    ['index.html', 'home', 'Home'],
    ['vacation-rental.html', 'vacation', 'Vacation Rental|Welcome Bags'],
    ['realtor-closing.html', 'realtor', 'Realtor|Closing Gifts'],
    ['gallery.html', 'gallery', 'Gallery'],
    ['reviews.html', 'reviews', 'Reviews'],
    ['contact.html', 'contact', 'Contact']
  ];
  const CAT_PAGE = { vacation: 'vacation-rental.html', realtor: 'realtor-closing.html' };

  /* ---------- Header / footer ---------- */
  document.getElementById('siteHead').innerHTML = `
    <div class="wrap head-inner">
      <a class="brand" href="index.html" aria-label="Gulf Coast Greetings home">
        <img class="mark" src="../assets/logo-mark.webp" alt="Gulf Coast Greetings logo" width="50" height="50" />
        <span class="txt"><span class="a">GULF COAST</span><span class="b">Greetings</span></span>
      </a>
      <nav class="main-nav" id="navLinks">${PAGES.map(([href, id, label]) => `<a href="${href}" class="${id === PAGE ? 'on' : ''}">${label.split('|').map(t => `<span>${t}</span>`).join(' ')}</a>`).join('')}</nav>
      <div class="head-right">
        <button class="cart-btn" id="cartBtn" aria-label="Open cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 016 0"/></svg>
          <span class="lbl">Cart</span><span class="cart-count" id="cartCount">0</span>
        </button>
        <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>`;
  document.getElementById('siteHead').classList.add('site-head');

  document.getElementById('siteFoot').innerHTML = `
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <div class="brand"><img class="mark" src="../assets/logo-mark.webp" alt="Gulf Coast Greetings logo" style="width:44px;height:44px" />
            <span class="txt"><span class="a" style="color:var(--cream)">GULF COAST</span><span class="b">Greetings</span></span></div>
          <p>Curated, locally-inspired welcome gifts for vacation rentals, realtors, and new residents across the Texas Coastal Bend.</p>
        </div>
        <div><h5>Explore</h5><ul>${PAGES.map(([href, , label]) => `<li><a href="${href}">${label.replace('|', ' ')}</a></li>`).join('')}</ul></div>
        <div><h5>Get in Touch</h5><ul><li><span data-cc="p">&nbsp;</span></li><li><span data-cc="e">&nbsp;</span></li><li>Rockport, Texas</li></ul></div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} Gulf Coast Greetings, LLC · Rockport, TX</span><span>Warm Welcomes. Lasting Memories.</span></div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="scrim" id="scrim"></div>
    <aside class="drawer" id="drawer" aria-label="Shopping cart" aria-hidden="true">
      <div class="drawer-head"><h3>Your Cart</h3><button class="x" id="cartClose" aria-label="Close cart">&times;</button></div>
      <div class="drawer-body" id="cartLines"></div>
      <div class="drawer-foot" id="cartFoot">
        <div class="pay">
          <label><span><input type="radio" name="pay" value="ach" checked>Bank transfer (ACH)</span><span class="fee">No fee</span></label>
          <label><span><input type="radio" name="pay" value="card">Credit / debit card</span><span class="fee">+${CAT.cardFeePct}%</span></label>
        </div>
        <div class="totals">
          <div><span>Subtotal</span><span id="tSub">$0.00</span></div>
          <div id="tFeeRow"><span>Card processing fee (${CAT.cardFeePct}%)</span><span id="tFee">$0.00</span></div>
          <div class="grand"><span>Total</span><span id="tTotal">$0.00</span></div>
        </div>
        <div class="form-msg" id="minMsg" role="status" style="margin:0 0 12px"></div>
        <button class="btn btn-primary" id="checkoutBtn" style="width:100%;justify-content:center">Checkout →</button>
        <div class="form-msg" id="checkoutMsg" role="status"></div>
        <p class="fine">A thank-you card is included with every basket. Please Note: Due to high order volume and customized orders, processing and delivery times may occasionally be delayed.</p>
      </div>
    </aside>
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button class="x" id="lbClose" aria-label="Close">&times;</button>
      <button class="car-arrow prev" id="lbPrev" aria-label="Previous photo">${ARROW('M15 18l-6-6 6-6')}</button>
      <img id="lbImg" alt="" />
      <button class="car-arrow next" id="lbNext" aria-label="Next photo">${ARROW('M9 18l6-6-6-6')}</button>
    </div>
    <div class="toast" id="toast"></div>`);

  /* ---------- Contact details (assembled at runtime so bots can't scrape plain text) ---------- */
  const _dec = a => a.map(c => String.fromCharCode(c)).join('');
  const EMAIL = _dec([87,101,108,99,111,109,101,64,103,117,108,102,99,111,97,115,116,103,114,101,101,116,105,110,103,115,116,120,46,99,111,109]);
  const PHONE_DIGITS = _dec([57,55,57,55,52,51,53,51,53,48]);
  const PHONE_FMT = PHONE_DIGITS.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  document.querySelectorAll('[data-cc="p"]').forEach(el => { el.innerHTML = `<a href="tel:${PHONE_DIGITS}" rel="nofollow">${PHONE_FMT}</a>`; });
  document.querySelectorAll('[data-cc="e"]').forEach(el => { el.innerHTML = `<a href="mailto:${EMAIL}" rel="nofollow">${EMAIL}</a>`; });

  /* ---------- Mobile nav ---------- */
  const links = document.getElementById('navLinks');
  document.getElementById('hamburger').addEventListener('click', () => links.classList.toggle('open'));

  /* ---------- Carousel: native swipe (scroll-snap) + arrows + dots ---------- */
  function makeCarousel(root){
    const track = root.querySelector('.car-track');
    const slides = [...track.children];
    if(slides.length < 2) return { go(){} };
    const prev = document.createElement('button'); prev.className = 'car-arrow prev'; prev.type = 'button'; prev.setAttribute('aria-label','Previous'); prev.innerHTML = ARROW('M15 18l-6-6 6-6');
    const next = document.createElement('button'); next.className = 'car-arrow next'; next.type = 'button'; next.setAttribute('aria-label','Next'); next.innerHTML = ARROW('M9 18l6-6-6-6');
    const dots = document.createElement('div'); dots.className = 'car-dots';
    slides.forEach((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (i+1)); b.onclick = () => go(i); dots.appendChild(b); });
    root.append(prev, next, dots);
    const step = () => (slides[1].offsetLeft - slides[0].offsetLeft) || track.clientWidth;
    const idx = () => Math.round(track.scrollLeft / step());
    const go = i => track.scrollTo({ left: Math.max(0, Math.min(slides.length-1, i)) * step() });
    const sync = () => {
      const i = idx();
      prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
    };
    prev.onclick = () => go(idx() - 1); next.onclick = () => go(idx() + 1);
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    sync();
    return { go };
  }
  const FALLBACK = `this.onerror=null;this.src='../assets/logo.webp';this.classList.add('contain')`;

  /* ---------- Home: banner crossfade + swipe strip of every basket ---------- */
  const bs = [...document.querySelectorAll('#bannerSlides .bs')];
  if(bs.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    let i = 0;
    setInterval(() => { bs[i].classList.remove('on'); i = (i + 1) % bs.length; bs[i].classList.add('on'); }, 5500);
  }
  const strip = document.getElementById('strip');
  if(strip){
    strip.querySelector('.car-track').innerHTML = CAT.products.map(p => `
      <a class="car-slide strip-card" href="${CAT_PAGE[p.category]}#${p.id}">
        <img src="${p.photos[0].src}" alt="${esc(p.photos[0].alt)}" loading="lazy" onerror="${FALLBACK}">
        <div class="t"><b>${esc(p.name)}</b><small>${p.price == null ? 'Price coming soon' : money(p.price)}</small></div>
      </a>`).join('');
    makeCarousel(strip);
  }
  document.querySelectorAll('.carousel[data-auto]').forEach(makeCarousel);

  /* ---------- Shop pages ---------- */
  const prodEl = document.getElementById('products');
  if(prodEl){
    const catId = prodEl.dataset.cat;
    const seg = document.getElementById('seg');
    let champOnly = location.hash === '#champagne';
    const render = () => {
      if(seg) [...seg.children].forEach(b => b.classList.toggle('on', (b.dataset.f === 'champagne') === champOnly));
      const list = CAT.products.filter(p => p.category === catId && (!champOnly || p.champagne))
        .sort((a, b) => (a.price == null) - (b.price == null) || (a.price - b.price) || ((a.num || 0) - (b.num || 0)));
      prodEl.innerHTML = list.map(productCard).join('');
      const cat = CAT.categories.find(c => c.id === catId);
      const perks = document.querySelector('.perks');
      if(cat && cat.minNote && perks && !perks.querySelector('.min')) perks.insertAdjacentHTML('afterbegin', `<span class="min">&#10022; ${esc(cat.minNote)}</span>`);
      prodEl.querySelectorAll('.product').forEach(wireCard);
    };
    if(seg) seg.querySelectorAll('button').forEach(b => b.onclick = () => { champOnly = b.dataset.f === 'champagne'; render(); });
    render();
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if(target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  }

  function productCard(p){
    const slides = p.photos.map(ph => `<div class="car-slide"><img src="${ph.src}" alt="${esc(ph.alt)}" class="${ph.fit === 'contain' ? 'contain' : ''}" loading="lazy" onerror="${FALLBACK}"></div>`).join('')
      + `<div class="car-slide contents-slide"><h4>What's inside</h4><ul class="bag-contents">${p.items.map(([n, q]) => `<li><b>${esc(n)}</b><span>${esc(q)}</span></li>`).join('')}</ul></div>`;
    const wrapOk = p.wrap !== false;
    return `<article class="product" id="${p.id}" data-id="${p.id}">
      <div class="carousel">${p.placeholder ? '<span class="ph-flag">Sample</span>' : ''}<div class="car-track">${slides}</div></div>
      <div class="p-body">
        ${p.num ? `<div class="p-num">Basket #${p.num}</div>` : ''}
        <div class="p-head"><h3>${esc(p.name)}</h3><span class="p-price">${p.price == null ? '<small style="font:700 .8rem Mulish,sans-serif;color:var(--muted)">Price coming soon</small>' : money(p.price)}</span></div>
        ${p.size ? `<div class="p-size">${esc(p.size)}</div>` : ''}
        <button type="button" class="p-link" data-contents>See what's inside →</button>
        ${p.champagne ? `<div class="champ"><b>CHAMPAGNE NOT INCLUDED</b>Feel free to drop your champagne off before pickup, or place the bottle inside the basket after pickup.</div>` : ''}
        ${wrapOk ? `<div class="addon">
          <label class="chk"><input type="checkbox" data-wrap> ${esc(CAT.wrapAddon.label)} (+$${CAT.wrapAddon.price})</label>
          <div class="ribbons">${CAT.wrapAddon.ribbons.map((r, i) => `<label><input type="radio" name="rb-${p.id}" value="${r}" ${i ? '' : 'checked'}> ${r}</label>`).join('')}</div>
        </div>` : ''}
        <div class="buy">
          <div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><input type="text" inputmode="numeric" value="1" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>
          <button type="button" class="btn btn-teal" data-add ${p.price == null ? 'disabled' : ''}>Add to Cart</button>
        </div>
      </div>
    </article>`;
  }
  function wireCard(card){
    const car = makeCarousel(card.querySelector('.carousel'));
    card.querySelector('[data-contents]').onclick = () => car.go(99);
    const wrap = card.querySelector('[data-wrap]');
    if(wrap) wrap.onchange = () => card.querySelector('.ribbons').classList.toggle('show', wrap.checked);
    const q = card.querySelector('.qty input');
    card.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { q.value = Math.max(1, (parseInt(q.value) || 1) + +b.dataset.q); });
    card.querySelector('[data-add]').onclick = () => {
      const ribbon = wrap && wrap.checked ? card.querySelector('.ribbons input:checked').value : null;
      addToCart(card.dataset.id, Math.max(1, parseInt(q.value) || 1), ribbon);
    };
  }

  /* ---------- Cart (kept in this browser, shared across pages) ---------- */
  const CART_KEY = 'gcg-cart-v2';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { cart = []; }
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {} };
  const product = id => CAT.products.find(p => p.id === id);
  const unitPrice = l => product(l.id).price + (l.ribbon ? CAT.wrapAddon.price : 0);
  function addToCart(id, qty, ribbon){
    const hit = cart.find(l => l.id === id && l.ribbon === ribbon);
    hit ? hit.qty += qty : cart.push({ id, qty, ribbon });
    save(); renderCart(); toast(`Added ${qty} × ${product(id).name}`);
  }
  const drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim');
  const openCart = () => { drawer.classList.add('open'); scrim.classList.add('open'); drawer.setAttribute('aria-hidden','false'); };
  const closeCart = () => { drawer.classList.remove('open'); scrim.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); };
  document.getElementById('cartBtn').onclick = openCart;
  document.getElementById('cartClose').onclick = closeCart; scrim.onclick = closeCart;
  document.querySelectorAll('input[name="pay"]').forEach(r => r.onchange = renderCart);
  function renderCart(){
    cart = cart.filter(l => product(l.id) && product(l.id).price != null);
    document.getElementById('cartCount').textContent = cart.reduce((n, l) => n + l.qty, 0);
    const linesEl = document.getElementById('cartLines'), foot = document.getElementById('cartFoot');
    if(!cart.length){ linesEl.innerHTML = '<p class="empty">Your cart is empty.</p>'; foot.style.display = 'none'; return; }
    foot.style.display = '';
    linesEl.innerHTML = cart.map((l, i) => { const p = product(l.id); return `<div class="line">
      <img src="${p.photos[0].src}" alt="" onerror="${FALLBACK}">
      <div><b>${esc(p.name)}</b><small>${money(p.price)} each${l.ribbon ? ` · Cellophane wrap, ${esc(l.ribbon)} (+${money(CAT.wrapAddon.price)})` : ''}</small>
        <div class="qty" style="margin-top:6px;transform:scale(.85);transform-origin:left"><button data-li="${i}" data-d="-1" aria-label="Decrease">−</button><input value="${l.qty}" readonly aria-label="Quantity"><button data-li="${i}" data-d="1" aria-label="Increase">+</button></div>
        <button class="rm" data-rm="${i}">Remove</button></div>
      <span class="amt">${money(unitPrice(l) * l.qty)}</span></div>`; }).join('');
    linesEl.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const l = cart[b.dataset.li]; l.qty = Math.max(1, l.qty + +b.dataset.d); save(); renderCart(); });
    linesEl.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { cart.splice(+b.dataset.rm, 1); save(); renderCart(); });
    const short = CAT.categories.filter(c => c.minQty).map(c => {
      const n = cart.filter(l => product(l.id).category === c.id).reduce((t, l) => t + l.qty, 0);
      return n && n < c.minQty ? `${c.minNote}. You have ${n}; add ${c.minQty - n} more to check out.` : null;
    }).filter(Boolean);
    const minEl = document.getElementById('minMsg');
    minEl.textContent = short.join(' '); minEl.className = short.length ? 'form-msg err' : 'form-msg';
    document.getElementById('checkoutBtn').disabled = short.length > 0;
    const sub = cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    const card = document.querySelector('input[name="pay"]:checked').value === 'card';
    const fee = card ? Math.round(sub * CAT.cardFeePct) / 100 : 0;
    document.getElementById('tSub').textContent = money(sub);
    document.getElementById('tFeeRow').style.display = card ? '' : 'none';
    document.getElementById('tFee').textContent = money(fee);
    document.getElementById('tTotal').textContent = money(sub + fee);
  }
  renderCart();
  document.getElementById('checkoutBtn').onclick = () => {
    const m = document.getElementById('checkoutMsg');
    m.className = 'form-msg err';
    m.textContent = 'Online checkout is coming soon (Square payments are being set up). To order now, call or text ' + PHONE_FMT + '.';
  };

  let toastT;
  function toast(t){ const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

  /* ---------- Gallery + lightbox ---------- */
  const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg');
  let pics = [], cur = 0;
  const show = i => { cur = (i + pics.length) % pics.length; lbImg.src = pics[cur].src; lbImg.alt = pics[cur].alt; };
  const closeLb = () => lb.classList.remove('open');
  document.getElementById('lbPrev').onclick = () => show(cur - 1);
  document.getElementById('lbNext').onclick = () => show(cur + 1);
  document.getElementById('lbClose').onclick = closeLb;
  lb.onclick = e => { if(e.target === lb) closeLb(); };
  let x0 = null;
  lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { if(x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if(Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ closeLb(); closeCart(); }
    if(lb.classList.contains('open') && e.key === 'ArrowLeft') show(cur - 1);
    if(lb.classList.contains('open') && e.key === 'ArrowRight') show(cur + 1);
  });
  const gal = document.getElementById('gal');
  if(gal){
    const seen = new Set();
    const add = ph => { if(!seen.has(ph.src)){ seen.add(ph.src); pics.push(ph); } };
    (CAT.gallery || []).forEach(add);
    CAT.products.filter(p => !p.placeholder).forEach(p => p.photos.forEach(add));
    gal.innerHTML = pics.map((ph, i) => `<button type="button" data-i="${i}" aria-label="Enlarge: ${esc(ph.alt)}"><img src="${ph.src}" alt="${esc(ph.alt)}" loading="lazy" onerror="this.closest('button').remove()"></button>`).join('');
    gal.querySelectorAll('button').forEach(b => b.onclick = () => { show(+b.dataset.i); lb.classList.add('open'); });
  }

  /* ---------- Reviews: show approved ones, submit new ones for approval ---------- */
  const rf = document.getElementById('reviewForm');
  if(rf){
    const sbr = sbClient(REVIEWS_URL, REVIEWS_KEY);
    const listEl = document.getElementById('reviewList'), m = document.getElementById('reviewMsg');
    const stars = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
    if(sbr) sbr.from('gcg_reviews').select('rating,name,org,body,created_at').order('created_at', { ascending: false }).limit(50)
      .then(({ data, error }) => {
        if(error){ console.error(error); return; }
        if(data && data.length) listEl.innerHTML = data.map(r => `<div class="review"><span class="stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</span>
          <p>${esc(r.body)}</p><small>${esc(r.name)}${r.org ? ' · ' + esc(r.org) : ''}</small></div>`).join('');
      });
    rf.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(rf);
      const payload = { rating: +fd.get('rating') || 0, name: (fd.get('name')||'').trim(), org: (fd.get('org')||'').trim() || null, body: (fd.get('text')||'').trim() };
      if(!payload.rating || !payload.name || !payload.body){ m.className = 'form-msg err'; m.textContent = 'Please choose a star rating and fill in your name and review.'; return; }
      if(!sbr){ m.className = 'form-msg ok'; m.textContent = 'Thanks! (Preview: reviews will be saved once this form is connected.)'; return; }
      const btn = rf.querySelector('button[type=submit]'); btn.disabled = true;
      try{
        const { error } = await sbr.from('gcg_reviews').insert([payload]);
        if(error) throw error;
        rf.reset(); m.className = 'form-msg ok'; m.textContent = "Thank you! Your review has been sent and will appear once it's approved.";
      }catch(err){
        console.error(err); m.className = 'form-msg err'; m.textContent = 'Sorry, something went wrong. Please try again, or call or text us at ' + PHONE_FMT + '.';
      }finally{ btn.disabled = false; }
    });
  }

  /* ---------- Consultation form (Supabase) ---------- */
  const form = document.getElementById('inquiryForm');
  if(form && window.supabase){
    const sb = sbClient(LEADS_URL, LEADS_KEY);
    const btn = document.getElementById('submitBtn'), msg = document.getElementById('formMsg');
    const showMsg = (kind, text) => { msg.className = 'form-msg ' + kind; msg.textContent = text; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 'form-msg';
      const fd = new FormData(form);
      const payload = {
        name: (fd.get('name')||'').trim(),
        company: (fd.get('company')||'').trim() || null,
        email: (fd.get('email')||'').trim(),
        phone: (fd.get('phone')||'').trim() || null,
        inquiry_type: fd.get('inquiry_type') || 'general',
        units: (fd.get('units')||'').trim() || null,
        message: (fd.get('message')||'').trim() || null,
        source: 'website'
      };
      if(!payload.name || !payload.email || !payload.inquiry_type){ showMsg('err', "Please fill in your name, email, and what you're interested in."); return; }
      btn.disabled = true; const orig = btn.textContent; btn.textContent = 'Sending…';
      try{
        const { error } = await sb.from('gcg_inquiries').insert([payload]);
        if(error) throw error;
        form.reset();
        showMsg('ok', "Thank you! Your request is in. We'll be in touch within one business day.");
      }catch(err){
        console.error(err);
        showMsg('err', 'Sorry, something went wrong. Please call or text us at ' + PHONE_FMT + " and we'll take care of you.");
      }finally{ btn.disabled = false; btn.textContent = orig; }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
