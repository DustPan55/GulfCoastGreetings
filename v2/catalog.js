/* Gulf Coast Greetings catalog.
   Edit this file to add, remove, or reprice baskets; the shop renders from it.
   - Products display cheapest first within each category (sorted automatically).
   - photos: shown in the swipe carousel; the contents list is always the last slide.
   - champagne: true shows the "champagne not included" note.
   - wrap: false hides the cellophane wrap add-on for that basket.
   - minQty on a category: the cart won't check out until that many items from the category are in it.
   - placeholder: true marks a stand-in entry until the real basket details arrive. */
window.GCG_CATALOG = {
  categories: [
    { id: 'vacation', label: 'Vacation Rental Welcome Bags', minQty: 10, minNote: 'Minimum order of 10 welcome bags (sizes can be mixed)',
      blurb: 'Pre-made welcome bags stocked with Texas finds, finished with a customized card and your logo on the front.' },
    { id: 'realtor', label: 'Realtor Closing Gifts',
      blurb: 'Reusable coastal baskets packed with premium local and Texas items: a closing gift that keeps your name top of mind.' }
  ],

  wrapAddon: { label: 'Cellophane wrap with tulle or raffia', price: 10, ribbons: ['Tulle', 'Raffia'] },

  cardFeePct: 3,

  /* Extra photos for the Gallery page (product photos are added automatically). */
  gallery: [
    { src: '../assets/bags-lineup.webp', alt: 'Small, medium and large welcome bags side by side' },
    { src: '../assets/bag-navy-spread.webp', alt: 'Large navy welcome bag with Texas coffee, popcorn, jam, mug and koozies' },
    { src: '../assets/bag-white.webp', alt: 'White welcome bag' },
    { src: '../assets/tote-navy.webp', alt: 'Navy striped canvas beach tote' }
  ],

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

    /* ---- Realtor Closing Gifts #1-#20 ----
       Contents drafted from the item photos in each basket's Drive folder; confirm with the owner.
       price: null shows 'Price coming soon' and disables Add to Cart. */
    {"id": "rc-01", "category": "realtor", "num": 1, "name": "Realtor Basket #1", "price": null, "photos": [{"src": "../assets/baskets/basket-01-1.webp", "alt": "Realtor Basket #1"}, {"src": "../assets/baskets/basket-01-2.webp", "alt": "Realtor Basket #1, another view"}], "items": [["Blue & teal cotton basket", "Basket"], ["Coral sea turtle coffee mug", ""], ["Cutting board", ""], ["Potter Country Store pecans (white)", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Champagne glasses (pair)", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Stevie Lew's cherry preserves", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-02", "category": "realtor", "num": 2, "name": "Realtor Basket #2", "price": null, "photos": [{"src": "../assets/baskets/basket-02-1.webp", "alt": "Realtor Basket #2"}, {"src": "../assets/baskets/basket-02-2.webp", "alt": "Realtor Basket #2, another view"}], "items": [["Casafield seagrass basket", "Basket"], ["Hebert Honey (1 lb)", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Potter Country Store pecans (gold)", ""], ["Colonial Candle, Vanilla Sea Salt", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Resin coasters (2)", ""], ["Starfish tea towel, teal & white", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-03", "category": "realtor", "num": 3, "name": "Realtor Basket #3", "price": null, "photos": [{"src": "../assets/baskets/basket-03-1.webp", "alt": "Realtor Basket #3"}, {"src": "../assets/baskets/basket-03-2.webp", "alt": "Realtor Basket #3, another view"}], "items": [["Casafield natural basket", "Basket"], ["Turquoise \"Salt Air\" towel", ""], ["Turquoise towel roll", ""], ["Light blue coffee mugs (2)", ""], ["Potter Country Store pecans (white)", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Champagne glasses (pair)", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-04", "category": "realtor", "num": 4, "name": "Realtor Basket #4", "price": null, "photos": [{"src": "../assets/baskets/basket-04-1.webp", "alt": "Realtor Basket #4"}, {"src": "../assets/baskets/basket-04-2.webp", "alt": "Realtor Basket #4, another view"}], "items": [["Casafield espresso basket", "Basket"], ["Coral sea turtle coffee mug", ""], ["Teal \"Rockport\" towel roll", ""], ["Teal towel", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Champagne glasses (pair)", ""], ["Message in a bottle", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-05", "category": "realtor", "num": 5, "name": "Realtor Basket #5", "price": null, "photos": [{"src": "../assets/baskets/basket-05-1.webp", "alt": "Realtor Basket #5"}, {"src": "../assets/baskets/basket-05-2.webp", "alt": "Realtor Basket #5, another view"}], "items": [["Casafield seagrass basket", "Basket"], ["Coral coffee mug", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Potter Country Store pecans (white)", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Stevie Lew's blueberry preserves", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-06", "category": "realtor", "num": 6, "name": "Realtor Basket #6", "price": null, "photos": [{"src": "../assets/baskets/basket-06-1.webp", "alt": "Realtor Basket #6"}, {"src": "../assets/baskets/basket-06-2.webp", "alt": "Realtor Basket #6, another view"}], "items": [["Casafield seagrass basket", "Basket"], ["Light blue coffee mug", ""], ["Message in a bottle", ""], ["Potter Country Store pecans (blue)", ""], ["Resin crab", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Resin seahorse", ""], ["Sea turtle tea towel", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-07", "category": "realtor", "num": 7, "name": "Realtor Basket #7", "price": null, "photos": [{"src": "../assets/baskets/basket-07-1.webp", "alt": "Realtor Basket #7"}, {"src": "../assets/baskets/basket-07-2.webp", "alt": "Realtor Basket #7, another view"}], "items": [["Scalloped basket", "Basket"], ["Coral sea turtle coffee mug", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Potter Country Store pecans (white)", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Stevie Lew's blueberry preserves", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-08", "category": "realtor", "num": 8, "name": "Realtor Basket #8", "price": null, "photos": [{"src": "../assets/baskets/basket-08-1.webp", "alt": "Realtor Basket #8"}, {"src": "../assets/baskets/basket-08-2.webp", "alt": "Realtor Basket #8, another view"}], "items": [["Casafield espresso basket", "Basket"], ["Blue coffee mug", ""], ["Resin coasters (2)", ""], ["Colonial Candle, Seaside Citrus", ""], ["Stevie Lew's blueberry preserves", ""], ["Starfish tea towel", ""], ["Message in a bottle", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-09", "category": "realtor", "num": 9, "name": "Realtor Basket #9", "price": null, "photos": [{"src": "../assets/baskets/basket-09-1.webp", "alt": "Realtor Basket #9"}, {"src": "../assets/baskets/basket-09-2.webp", "alt": "Realtor Basket #9, another view"}], "items": [["Scalloped basket", "Basket"], ["Coral coffee mug", ""], ["Sand dollar tea towel", ""], ["Potter Country Store pecans (white)", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Colonial Candle, Tropical Dreams", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Stevie Lew's blueberry preserves", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-10", "category": "realtor", "num": 10, "name": "Realtor Basket #10", "price": null, "photos": [{"src": "../assets/baskets/basket-10-1.webp", "alt": "Realtor Basket #10"}, {"src": "../assets/baskets/basket-10-2.webp", "alt": "Realtor Basket #10, another view"}], "items": [["Casafield seagrass basket", "Basket"], ["Teal coffee mug", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Colonial Candle, Blue Agave", ""], ["Potter Country Store pecans (blue)", ""], ["Resin seashell", ""], ["Stevie Lew's cherry preserves", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-11", "category": "realtor", "num": 11, "name": "Realtor Basket #11", "price": null, "photos": [{"src": "../assets/baskets/basket-11-1.webp", "alt": "Realtor Basket #11"}, {"src": "../assets/baskets/basket-11-2.webp", "alt": "Realtor Basket #11, another view"}], "items": [["Small white basket", "Basket"], ["Coral sea turtle coffee mug", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Potter Country Store pecans (gold)", ""], ["Champagne glasses (pair)", ""], ["Blue & white flower tea towel", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-12", "category": "realtor", "num": 12, "name": "Realtor Basket #12", "price": null, "photos": [{"src": "../assets/baskets/basket-12-1.webp", "alt": "Realtor Basket #12"}, {"src": "../assets/baskets/basket-12-2.webp", "alt": "Realtor Basket #12, another view"}], "items": [["Casafield natural basket", "Basket"], ["Coral sea turtle coffee mug", ""], ["Royal blue \"Rockport\" towel", ""], ["Navy \"Rockport\" towel roll", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Potter Country Store pecans (gold)", ""], ["Champagne glasses (pair)", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-13", "category": "realtor", "num": 13, "name": "Realtor Basket #13", "price": null, "photos": [{"src": "../assets/baskets/basket-13-1.webp", "alt": "Realtor Basket #13"}, {"src": "../assets/baskets/basket-13-2.webp", "alt": "Realtor Basket #13, another view"}], "items": [["Casafield espresso basket", "Basket"], ["Teal sea turtle coffee mug", ""], ["Potter Country Store pecans (gold)", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Colonial Candle, Blue Agave", ""], ["Seahorse tea towel", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Stevie Lew's cherry preserves", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-14", "category": "realtor", "num": 14, "name": "Realtor Basket #14", "price": null, "photos": [{"src": "../assets/baskets/basket-14-1.webp", "alt": "Realtor Basket #14"}, {"src": "../assets/baskets/basket-14-2.webp", "alt": "Realtor Basket #14, another view"}], "items": [["Casafield natural basket", "Basket"], ["Champagne glasses (pair)", ""], ["Colonial Candle, Ambrosia Tea", ""], ["Coral coffee mug", ""], ["Cutting board", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Potter Country Store pecans (white)", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]], "champagne": true},
    {"id": "rc-15", "category": "realtor", "num": 15, "name": "Realtor Basket #15", "price": null, "photos": [{"src": "../assets/baskets/basket-15-1.webp", "alt": "Realtor Basket #15"}, {"src": "../assets/baskets/basket-15-2.webp", "alt": "Realtor Basket #15, another view"}], "items": [["Small white basket", "Basket"], ["Blue & white flower tea towels (2)", ""], ["Hebert Honey (1 lb)", ""], ["Blue coffee mug", ""], ["Deanan Gourmet popcorn, Kettle", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Colonial Candle, Ocean Storm", ""], ["Potter Country Store pecans (blue)", ""], ["Champagne glasses (pair)", ""], ["Resin heart", ""], ["Thank-you card", "✓"]], "champagne": true, "wrap": false},
    {"id": "rc-16", "category": "realtor", "num": 16, "name": "Realtor Basket #16", "price": null, "photos": [{"src": "../assets/baskets/basket-16-1.webp", "alt": "Realtor Basket #16"}, {"src": "../assets/baskets/basket-16-2.webp", "alt": "Realtor Basket #16, another view"}], "items": [["Casafield espresso basket", "Basket"], ["Hebert Honey (1 lb)", ""], ["Colonial Candle, Blue Agave", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Potter Country Store pecans (white)", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Resin coasters (2)", ""], ["Stevie Lew's F.R.O.G. jam", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-17", "category": "realtor", "num": 17, "name": "Realtor Basket #17", "price": null, "photos": [{"src": "../assets/baskets/basket-17-1.webp", "alt": "Realtor Basket #17"}, {"src": "../assets/baskets/basket-17-2.webp", "alt": "Realtor Basket #17, another view"}], "items": [["Small white basket", "Basket"], ["Hebert Honey (1 lb)", ""], ["Blue coffee mug", ""], ["Cutting board", ""], ["Potter Country Store pecans (blue)", ""], ["Colonial Candle, Ocean Storm", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-18", "category": "realtor", "num": 18, "name": "Realtor Basket #18", "price": null, "photos": [{"src": "../assets/baskets/basket-18-1.webp", "alt": "Realtor Basket #18"}, {"src": "../assets/baskets/basket-18-2.webp", "alt": "Realtor Basket #18, another view"}], "items": [["Casafield espresso basket", "Basket"], ["Blue sea turtle coffee mug", ""], ["Turquoise \"Rockport\" towel roll", ""], ["Turquoise \"Rockport\" towel", ""], ["Cutting board", ""], ["Potter Country Store pecans (white)", ""], ["Colonial Candle, Ocean Storm", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Resin sea turtle", ""], ["Stevie Lew's blueberry preserves", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-19", "category": "realtor", "num": 19, "name": "Realtor Basket #19", "price": null, "photos": [{"src": "../assets/baskets/basket-19-1.webp", "alt": "Realtor Basket #19"}], "items": [["Large cotton basket", "Basket"], ["Blue coffee mug", ""], ["Cutting board", ""], ["Potter Country Store pecans (blue)", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Colonial Candle, Ocean Storm", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Stevie Lew's blueberry preserves", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Thank-you card", "✓"]]},
    {"id": "rc-20", "category": "realtor", "num": 20, "name": "Realtor Basket #20", "price": null, "photos": [{"src": "../assets/baskets/basket-20-1.webp", "alt": "Realtor Basket #20"}, {"src": "../assets/baskets/basket-20-2.webp", "alt": "Realtor Basket #20, another view"}], "items": [["Casafield seagrass basket", "Basket"], ["Light blue coffee mug", ""], ["Cutting board", ""], ["Deanan Gourmet popcorn, Vanilla", ""], ["Deanan Gourmet popcorn, Buttery", ""], ["Potter Country Store pecans (white)", ""], ["Colonial Candle, Azure Skies", ""], ["Rockport Coffee (Taste of Rockport)", ""], ["Stevie Lew's F.R.O.G. jam", ""], ["Thank-you card", "✓"]]},
  ]
};
