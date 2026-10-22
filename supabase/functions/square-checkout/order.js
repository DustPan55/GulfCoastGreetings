// Builds the Square order for a cart. Prices come from the site's catalog (never from the browser),
// so the only things the shopper controls are which products, how many, and whether to add the wrap.

const cents = dollars => Math.round(dollars * 100);

export function buildOrder(catalog, cart, { locationId, salesTaxPct }) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('Your cart is empty.');
  if (cart.length > 50) throw new Error('Too many lines in the cart.');

  const lineItems = [];
  const perCategory = {};
  for (const line of cart) {
    const p = catalog.products.find(x => x.id === line?.id);
    const qty = Number.parseInt(line?.qty, 10);
    if (!p || p.price == null || p.placeholder) throw new Error('One of the items in your cart is no longer available.');
    if (!Number.isInteger(qty) || qty < 1 || qty > 500) throw new Error(`Please check the quantity for ${p.name}.`);
    const wrap = Boolean(line.wrap) && p.wrap !== false;
    perCategory[p.category] = (perCategory[p.category] || 0) + qty;

    lineItems.push({
      name: p.name,
      quantity: String(qty),
      base_price_money: { amount: cents(p.price), currency: 'USD' },
    });
    if (wrap) {
      lineItems.push({
        name: `${catalog.wrapAddon.label} (${p.name})`,
        quantity: String(qty),
        base_price_money: { amount: cents(catalog.wrapAddon.price), currency: 'USD' },
      });
    }
  }

  for (const c of catalog.categories) {
    const n = perCategory[c.id] || 0;
    if (c.minQty && n && n < c.minQty) throw new Error(`${c.minNote}. You have ${n}.`);
  }

  return {
    location_id: locationId,
    line_items: lineItems,
    taxes: [{ uid: 'sales-tax', name: 'Sales tax', percentage: String(salesTaxPct), scope: 'ORDER' }],
  };
}

// catalog.js assigns window.GCG_CATALOG; run it against a stand-in window to read the data.
export function parseCatalog(source) {
  const window = {};
  new Function('window', source)(window);
  if (!window.GCG_CATALOG?.products) throw new Error('Catalog did not load.');
  return window.GCG_CATALOG;
}
