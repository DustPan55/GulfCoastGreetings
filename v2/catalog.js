/* Gulf Coast Greetings catalog.
   Edit this file to add, remove, or reprice baskets; the shop renders from it.
   - Products display cheapest first within each category (sorted automatically).
   - photos: shown in the swipe carousel; the contents list is always the last slide.
   - champagne: true shows the "champagne not included" note.
   - wrap: false hides the cellophane wrap add-on for that basket.
   - placeholder: true marks a stand-in entry until the real basket details arrive. */
window.GCG_CATALOG = {
  categories: [
    { id: 'vacation', label: 'Vacation Rental Welcome Bags',
      blurb: 'Pre-made welcome bags stocked with Texas finds, finished with a customized card and your logo on the front.' },
    { id: 'realtor', label: 'Realtor Closing Baskets',
      blurb: 'Reusable coastal baskets packed with premium local and Texas items: a closing gift that keeps your name top of mind.' }
  ],

  wrapAddon: { label: 'Cellophane wrap with tulle or raffia', price: 10, ribbons: ['Tulle', 'Raffia'] },

  cardFeePct: 3,

  products: [
    {
      id: 'vr-small', category: 'vacation', name: 'Small Welcome Bag', price: 30,
      size: '8 × 4.75 × 10 · White Kraft',
      photos: [
        { src: '../assets/bag-small.webp', alt: 'Small white Kraft welcome bag with navy tissue and striped ribbon', fit: 'contain' },
        { src: '../assets/bag-lifestyle.webp', alt: 'Small welcome bag beside Texas coffee, popcorn, crackers, taffy and koozies' }
      ],
      items: [['Coffee', '1.75 oz'], ['Popcorn', '1.5 oz'], ['Taffy', '3 oz'], ['Crackers', '3 oz'],
              ['Water', '2 × 8 oz'], ['Customized koozies', '2'], ['Thank-you card', '✓']]
    },
    {
      id: 'vr-medium', category: 'vacation', name: 'Medium Welcome Bag', price: 50,
      size: '10 × 5 × 13 · White Kraft',
      photos: [
        { src: '../assets/bag-medium.webp', alt: 'Medium white Kraft welcome bag with navy tissue and striped ribbon', fit: 'contain' },
        { src: '../assets/bag-spread.webp', alt: 'Medium welcome bag contents: coffee, popcorn, taffy, water and koozies' }
      ],
      items: [['Coffee', '3.5 oz'], ['Popcorn', '3 oz'], ['Taffy', '6 oz'], ['Crackers', '6 oz'],
              ['Water', '2 × 16 oz'], ['Customized koozies', '4'], ['Thank-you card', '✓']]
    },
    {
      id: 'vr-large', category: 'vacation', name: 'Large Welcome Bag', price: 75,
      size: '16 × 6 × 12 · Navy & White Laminate',
      photos: [
        { src: '../assets/bag-large.webp', alt: 'Large navy laminate welcome bag with white tissue and starfish ribbon', fit: 'contain' },
        { src: '../assets/bag-navy-spread.webp', alt: 'Large navy bag with Texas coffee, popcorn, jam, mug and koozies' }
      ],
      items: [['Coffee', '5.25 oz'], ['Popcorn', '5.5 oz'], ['Taffy', '6 oz'], ['Crackers', '6 oz'],
              ['Water', '2 × 16 oz'], ['Customized koozies', '3'], ['Local jam', '1'], ['Coffee mug', '1'],
              ['Thank-you card', '✓']]
    },

    /* ---- Realtor placeholders: replace with the real baskets (number, name, price, photos, items) ---- */
    {
      id: 'rc-sample-1', category: 'realtor', name: 'Realtor Basket (sample)', price: 85, placeholder: true,
      photos: [{ src: '../assets/tote-navy.webp', alt: 'Navy striped canvas beach tote', fit: 'contain' }],
      items: [['Contents to come', ''], ['Thank-you card', '✓']]
    },
    {
      id: 'rc-sample-2', category: 'realtor', name: 'Champagne Basket (sample)', price: 125, placeholder: true, champagne: true,
      photos: [{ src: '../assets/tote-navy.webp', alt: 'Navy striped canvas beach tote', fit: 'contain' }],
      items: [['Contents to come', ''], ['Champagne flutes (example)', '2'], ['Thank-you card', '✓']]
    }
  ]
};
