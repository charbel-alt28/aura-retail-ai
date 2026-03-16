// Product metadata: descriptions, origin, production/expiry info, storage, cost
// All dates are DYNAMIC — calculated relative to today's device date

export interface ProductMeta {
  description: string;
  origin: string;
  dop: string; // Date of Production
  doe: string; // Date of Expiry
  weight?: string;
  ingredients?: string;
  storageLocation?: string; // Warehouse zone / shelf
  costPerUnit?: number; // Wholesale cost per unit
  dataSource?: 'pos' | 'manual' | 'supplier_api' | 'spreadsheet';
}

// ── Date helpers ─────────────────────────────────────────
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Build a ProductMeta with dates relative to today.
 *  @param shelfLifeDays — total shelf life from production to expiry
 *  @param daysUntilExpiry — how many days from today until it expires (negative = already expired)
 */
function meta(
  description: string, origin: string,
  shelfLifeDays: number, daysUntilExpiry: number,
  weight?: string, ingredients?: string,
  storageLocation?: string, costPerUnit?: number,
  dataSource: ProductMeta['dataSource'] = 'pos'
): ProductMeta {
  const now = today();
  const doe = addDays(now, daysUntilExpiry);
  const dop = addDays(doe, -shelfLifeDays);
  return {
    description, origin,
    dop: fmt(dop),
    doe: fmt(doe),
    weight, ingredients, storageLocation, costPerUnit, dataSource,
  };
}

// Storage zones
const Z = {
  DAIRY: 'Zone A — Dairy Cooler (2-4°C)',
  BAKERY: 'Zone B — Bakery Display (18-22°C)',
  PRODUCE: 'Zone C — Produce Cooler (4-8°C)',
  MEAT: 'Zone D — Meat Locker (-2 to 2°C)',
  SEAFOOD: 'Zone E — Seafood Cooler (0-2°C)',
  BEVERAGE: 'Zone F — Beverage Aisle (18-22°C)',
  SNACK: 'Zone G — Snack Aisle (18-22°C)',
  FROZEN: 'Zone H — Frozen Section (-18°C)',
  PANTRY: 'Zone I — Pantry/Dry Goods (18-22°C)',
  CONDIMENT: 'Zone J — Condiments Aisle (18-22°C)',
  HEALTH: 'Zone K — Health & Personal Care (18-22°C)',
  DELI: 'Zone L — Deli Counter (2-6°C)',
  BABY: 'Zone M — Baby & Kids Aisle (18-22°C)',
  PET: 'Zone N — Pet Supplies (18-22°C)',
  INTL: 'Zone O — International Foods (18-22°C)',
  PREPARED: 'Zone P — Prepared Foods (Hot/Cold)',
};

// ══════════════════════════════════════════════════════════
// Product metadata with DYNAMIC dates
// Format: meta(desc, origin, shelfLifeDays, daysUntilExpiry, ...)
//
// daysUntilExpiry key:
//   negative = already expired
//   0 = expires today
//   1-3 = critical/warning zone (5-10 items here for realistic alerts)
//   4+ = safe
// ══════════════════════════════════════════════════════════

export const productMetadata: Record<string, ProductMeta> = {
  // ── Dairy (shelf life 7-180 days) ──────────────────────
  '1':  meta('Fresh whole milk, pasteurized and homogenized', 'USA', 18, 3, '1 Gallon', undefined, Z.DAIRY, 2.10),     // ⚠️ 3 days
  '3':  meta('Farm-fresh large eggs, grade A', 'USA', 28, 12, '12 ct', undefined, Z.DAIRY, 2.40),
  '4':  meta('Aged cheddar cheese block, sharp flavor', 'Ireland', 180, 77, '8 oz', undefined, Z.DAIRY, 3.60),
  '5':  meta('Creamy Greek yogurt, plain', 'Greece', 28, 9, '6 oz', undefined, Z.DAIRY, 1.20),
  '9':  meta('Unsalted butter, European style', 'France', 180, 112, '8 oz', undefined, Z.DAIRY, 2.70),
  '10': meta('Heavy whipping cream, ultra-pasteurized', 'USA', 20, 6, '16 fl oz', undefined, Z.DAIRY, 2.30),
  '11': meta('Cultured sour cream, full fat', 'USA', 20, 5, '16 oz', undefined, Z.DAIRY, 1.50),
  '12': meta('Small curd cottage cheese, 4% milkfat', 'USA', 21, 2, '16 oz', undefined, Z.DAIRY, 1.90),             // ⚠️ 2 days
  '13': meta('Philadelphia-style cream cheese, original', 'USA', 60, 29, '8 oz', undefined, Z.DAIRY, 1.80),

  // ── Bakery (shelf life 3-60 days) ──────────────────────
  '2':  meta('Classic white sandwich bread, soft and fluffy', 'USA', 8, -1, '20 oz', undefined, Z.BAKERY, 1.50),      // 🔴 expired yesterday
  '14': meta('Plain bagels, New York style, boiled and baked', 'USA', 8, 5, '6 ct', undefined, Z.BAKERY, 2.10),
  '15': meta('All-butter croissants, flaky and golden', 'France', 6, 1, '4 ct', undefined, Z.BAKERY, 2.40),          // ⚠️ 1 day
  '16': meta('Blueberry muffins, bakery fresh', 'USA', 8, 6, '4 ct', undefined, Z.BAKERY, 2.30),
  '17': meta('Traditional French baguette, crusty exterior', 'France', 3, 0, '10 oz', undefined, Z.BAKERY, 1.80),     // 🔴 expires today
  '18': meta('Soft dinner rolls, perfect for any meal', 'USA', 8, 5, '12 ct', undefined, Z.BAKERY, 1.70),
  '19': meta('Flour tortillas, soft and pliable', 'Mexico', 60, 35, '10 ct', undefined, Z.BAKERY, 1.90),
  '20': meta('Whole wheat pita bread pockets', 'Lebanon', 11, 7, '6 ct', undefined, Z.BAKERY, 1.70),

  // ── Produce (shelf life 3-30 days) ─────────────────────
  '6':  meta('Crisp Fuji apples, naturally sweet', 'USA', 24, 9, '1 lb', undefined, Z.PRODUCE, 0.90),
  '21': meta('Premium Cavendish bananas, ripe and sweet', 'Ecuador', 9, 4, '1 bunch', undefined, Z.PRODUCE, 0.35),
  '22': meta('Navel oranges, seedless and juicy', 'Spain', 28, 12, '1 lb', undefined, Z.PRODUCE, 0.72),
  '23': meta('Vine-ripened tomatoes, rich flavor', 'Mexico', 9, 5, '1 lb', undefined, Z.PRODUCE, 1.20),
  '24': meta('Iceberg lettuce head, fresh and crunchy', 'USA', 9, 7, '1 head', undefined, Z.PRODUCE, 1.10),
  '25': meta('Organic whole carrots, sweet and tender', 'USA', 24, 9, '1 lb', undefined, Z.PRODUCE, 0.60),
  '26': meta('Russet potatoes, ideal for baking', 'USA', 28, 9, '5 lb bag', undefined, Z.PRODUCE, 0.48),
  '27': meta('Yellow onions, versatile and aromatic', 'USA', 60, 30, '3 lb bag', undefined, Z.PRODUCE, 0.54),
  '28': meta('Hass avocados, creamy and ripe', 'Mexico', 8, 3, 'Each', undefined, Z.PRODUCE, 0.90),                   // ⚠️ 3 days
  '29': meta('Mixed bell peppers, red/yellow/green', 'Netherlands', 11, 8, '3 ct', undefined, Z.PRODUCE, 1.08),
  '30': meta('English cucumbers, seedless', 'Canada', 11, 9, 'Each', undefined, Z.PRODUCE, 0.48),
  '31': meta('Fresh broccoli crowns, nutrient-packed', 'USA', 9, 7, '1 lb', undefined, Z.PRODUCE, 1.20),
  '32': meta('Baby spinach leaves, pre-washed', 'USA', 8, 5, '5 oz'),
  '33': meta('White button mushrooms, sliced', 'USA', 8, 5, '8 oz'),

  // ── Meat & Poultry (shelf life 5-180 days) ─────────────
  '8':  meta('Whole roasting chicken, USDA inspected', 'USA', 6, 2, '5 lb'),                                          // ⚠️ 2 days
  '34': meta('Boneless skinless chicken breast, all-natural', 'USA', 6, 4, '1 lb'),
  '35': meta('80/20 ground beef, USDA Choice', 'USA', 6, 4, '1 lb'),
  '36': meta('Center-cut pork chops, bone-in', 'USA', 7, 5, '1 lb'),
  '37': meta('Whole turkey, frozen, premium quality', 'USA', 180, 121, '12 lb'),
  '38': meta('Hickory-smoked bacon, thick-cut slices', 'USA', 60, 25, '16 oz'),
  '39': meta('Pork breakfast sausage links', 'USA', 14, 10, '12 oz'),
  '40': meta('USDA Prime ribeye steak, well-marbled', 'USA', 6, 4, '12 oz'),
  '41': meta('New Zealand lamb loin chops, grass-fed', 'New Zealand', 7, 4, '1 lb'),

  // ── Seafood (shelf life 3-180 days) ────────────────────
  '42': meta('Atlantic salmon fillet, skin-on, fresh', 'Norway', 4, 1, '8 oz'),                                       // ⚠️ 1 day
  '43': meta('Wild-caught jumbo shrimp, peeled and deveined', 'Thailand', 180, 152, '1 lb'),
  '44': meta('Yellowfin tuna steak, sushi-grade', 'Japan', 3, 2, '6 oz'),                                             // ⚠️ 2 days
  '45': meta('Pacific cod fillet, wild-caught, boneless', 'Alaska, USA', 6, 4, '8 oz'),
  '46': meta('Snow crab leg clusters, pre-cooked', 'Canada', 180, 125, '1.5 lb'),
  '47': meta('Farm-raised tilapia fillets, mild flavor', 'China', 5, -2, '1 lb'),                                     // 🔴 expired 2 days ago
  '48': meta('Natural apple juice, from concentrate', 'USA', 90, 55, '64 fl oz'),

  // ── Beverages (shelf life 28-730 days) ─────────────────
  '7':  meta('100% pure squeezed orange juice, no pulp', 'Brazil', 28, 12, '64 fl oz'),
  '49': meta('Classic cola carbonated soft drink', 'USA', 240, 168, '12 fl oz'),
  '50': meta('Natural sparkling mineral water', 'Italy', 730, 580, '1 L'),
  '51': meta('Medium roast Arabica ground coffee', 'Colombia', 180, 121, '12 oz'),
  '52': meta('Organic green tea bags, antioxidant rich', 'Japan', 730, 600, '20 bags'),
  '53': meta('Sugar-free energy drink, tropical flavor', 'Austria', 365, 290, '12 fl oz'),
  '54': meta('Organic oat milk, barista edition', 'Sweden', 120, 77, '32 fl oz'),

  // ── Snacks (shelf life 90-365 days) ────────────────────
  '55': meta('Kettle-cooked sea salt potato chips', 'USA', 120, 60, '8 oz'),
  '56': meta('Traditional twisted pretzels, salted', 'USA', 180, 127, '16 oz'),
  '57': meta('Movie theater butter microwave popcorn', 'USA', 180, 116, '3 ct'),
  '58': meta('Original wheat crackers, oven-baked', 'USA', 180, 107, '9 oz'),
  '59': meta('Double chocolate chip cookies, chewy', 'Belgium', 90, 60, '14 oz'),
  '60': meta('Oats & honey granola bars, crunchy', 'USA', 180, 127, '6 ct'),
  '61': meta('Deluxe mixed nuts, roasted and salted', 'USA', 270, 213, '10 oz'),
  '62': meta('Mountain trail mix with dried fruit and nuts', 'USA', 210, 147, '10 oz'),

  // ── Frozen (shelf life 180-540 days) ───────────────────
  '63': meta('Premium vanilla bean ice cream', 'USA', 365, 275, '1 pint'),
  '64': meta('Four cheese frozen pizza, stone-baked crust', 'Italy', 365, 244, '22 oz'),
  '65': meta('Mixed frozen vegetables: peas, corn, carrots', 'USA', 540, 457, '16 oz'),
  '66': meta('Chicken tikka masala frozen meal', 'India', 180, 107, '10 oz'),
  '67': meta('Organic frozen mixed berries blend', 'Chile', 540, 420, '12 oz'),
  '68': meta('Breaded fish sticks, wild-caught pollock', 'USA', 365, 275, '11 oz'),

  // ── Pantry (shelf life 365-1095 days) ──────────────────
  '69': meta('Whole peeled canned tomatoes, San Marzano', 'Italy', 730, 548, '28 oz'),
  '70': meta('Organic black beans, low sodium', 'Mexico', 730, 517, '15 oz'),
  '71': meta('Durum wheat spaghetti, bronze-cut', 'Italy', 730, 580, '16 oz'),
  '72': meta('Long grain white rice, enriched', 'Thailand', 730, 457, '5 lb'),
  '73': meta('Honey nut oat cereal, whole grain', 'USA', 270, 199, '15 oz'),
  '74': meta('Classic chicken noodle soup, ready to serve', 'USA', 730, 580, '18.6 oz'),
  '75': meta('Creamy peanut butter, no-stir', 'USA', 365, 291, '16 oz'),
  '76': meta('Seedless strawberry jam, made with real fruit', 'France', 540, 420, '12 oz'),
  '77': meta('Unbleached all-purpose flour', 'USA', 540, 365, '5 lb'),
  '78': meta('Pure cane granulated white sugar', 'Brazil', 1095, 879, '4 lb'),

  // ── Condiments (shelf life 180-1095 days) ──────────────
  '79': meta('Classic tomato ketchup, squeeze bottle', 'USA', 540, 420, '20 oz'),
  '80': meta('Yellow mustard, tangy and smooth', 'USA', 540, 396, '14 oz'),
  '81': meta('Real mayonnaise, made with cage-free eggs', 'USA', 180, 107, '30 oz'),
  '82': meta('Original cayenne pepper hot sauce', 'USA', 1095, 831, '5 fl oz'),
  '83': meta('Naturally brewed soy sauce', 'Japan', 730, 365, '15 fl oz'),
  '84': meta('Extra virgin olive oil, cold-pressed', 'Spain', 540, 365, '16.9 fl oz'),
  '85': meta('Aged balsamic vinegar of Modena', 'Italy', 1825, 1060, '8.5 fl oz'),
  '86': meta('Classic ranch dressing, creamy', 'USA', 120, 60, '16 fl oz'),

  // ── Health & Household (shelf life 730-1095 days) ──────
  '87': meta('Ultra-soft 2-ply toilet paper', 'USA', 1095, 1030, '12 rolls'),
  '88': meta('Select-a-size paper towels, absorbent', 'USA', 1095, 1030, '6 rolls'),
  '89': meta('Moisturizing shampoo, argan oil formula', 'France', 730, 580, '12.6 fl oz'),
  '90': meta('Gentle cleansing bar soap, unscented', 'USA', 1095, 879, '3.5 oz'),
  '91': meta('Whitening toothpaste with fluoride', 'USA', 730, 660, '6 oz'),
  '92': meta('48-hour antiperspirant deodorant stick', 'USA', 730, 640, '2.7 oz'),
  '93': meta('Moisturizing hand sanitizer gel, 70% alcohol', 'USA', 730, 600, '8 fl oz'),
  '94': meta('Antibacterial liquid dish soap, lemon scent', 'USA', 730, 580, '22 fl oz'),

  // ── Deli (shelf life 5-60 days) ────────────────────────
  '95': meta('Honey-glazed deli sliced ham, premium cut', 'USA', 14, 8, '8 oz'),
  '96': meta('Oven-roasted deli turkey breast, low sodium', 'USA', 14, 8, '8 oz'),
  '97': meta('Genoa salami, dry-cured Italian style', 'Italy', 60, 16, '6 oz'),
  '98': meta('Provolone cheese slices, mild and smooth', 'Italy', 60, 25, '8 oz'),
  '99': meta('Swiss cheese slices, nutty flavor', 'Switzerland', 60, 25, '8 oz'),
  '100': meta('Classic hummus, creamy chickpea dip', 'Lebanon', 28, 9, '10 oz'),

  // ══════ SKUs 101–300 ══════

  // Dairy (101–110)
  '101': meta('Unsweetened almond milk, shelf-stable', 'USA', 180, 121, '64 fl oz'),
  '102': meta('Dairy-free coconut yogurt, vanilla flavor', 'USA', 18, 2, '5.3 oz'),                                   // ⚠️ 2 days
  '103': meta('Soft goat cheese log, tangy and creamy', 'France', 90, 55, '4 oz'),
  '104': meta('Whole milk ricotta cheese, smooth texture', 'Italy', 28, 9, '15 oz'),
  '105': meta('Aerosol whipped cream, real dairy', 'USA', 60, 16, '6.5 oz'),
  '106': meta('Rich chocolate milk, vitamin D fortified', 'USA', 16, 7, '1 qt'),
  '107': meta('Half & half creamer for coffee and cooking', 'USA', 27, 12, '16 fl oz'),
  '108': meta('Crumbled feta cheese, Mediterranean style', 'Greece', 60, 25, '6 oz'),
  '109': meta('Fresh mozzarella ball, packed in water', 'Italy', 12, 5, '8 oz'),
  '110': meta('Low-moisture string cheese sticks, kids favorite', 'USA', 90, 60, '12 ct'),

  // Bakery (111–120)
  '111': meta('Artisan sourdough loaf, naturally leavened', 'USA', 7, 4, '24 oz'),
  '112': meta('Dark rye bread, traditional European recipe', 'Germany', 9, 7, '16 oz'),
  '113': meta('Frosted cinnamon rolls with cream cheese icing', 'USA', 5, 3, '5 ct'),                                 // ⚠️ 3 days
  '114': meta('Original English muffins, nooks and crannies', 'USA', 14, 11, '6 ct'),
  '115': meta('Buttery brioche hamburger buns', 'France', 8, 5, '4 ct'),
  '116': meta('Moist banana bread loaf, homestyle', 'USA', 7, 5, '14 oz'),
  '117': meta('Southern-style cornbread mix, ready to bake', 'USA', 180, 121, '15 oz'),
  '118': meta('Soft pretzel rolls, sea salt topped', 'Germany', 8, 5, '6 ct'),
  '119': meta('Italian focaccia with rosemary and olive oil', 'Italy', 6, 4, '12 oz'),
  '120': meta('Traditional naan bread, garlic butter', 'India', 12, 9, '4 ct'),

  // Produce (121–140)
  '121': meta('Ataulfo mangoes, sweet and fiber-free', 'Mexico', 10, 7, 'Each'),
  '122': meta('Golden pineapple, extra sweet variety', 'Costa Rica', 9, 6, 'Each'),
  '123': meta('Red seedless grapes, crisp and sweet', 'Chile', 13, 10, '2 lb bag'),
  '124': meta('Fresh strawberries, hand-picked', 'USA', 7, 5, '1 lb'),
  '125': meta('Cultivated blueberries, antioxidant-rich', 'USA', 9, 7, '6 oz'),
  '126': meta('Fresh raspberries, delicate and sweet', 'Mexico', 4, 2, '6 oz'),                                       // ⚠️ 2 days
  '127': meta('Fresh lemons, bright yellow and juicy', 'Spain', 28, 12, '1 lb'),
  '128': meta('Key limes, tart and aromatic', 'Mexico', 20, 4, '1 lb'),
  '129': meta('Pascal celery stalks, crisp and fresh', 'USA', 11, 9, '1 bunch'),
  '130': meta('Green zucchini squash, tender skin', 'USA', 9, 7, '1 lb'),
  '131': meta('Fresh asparagus spears, tender tips', 'Peru', 7, 5, '1 bunch'),
  '132': meta('Fresh green beans, trimmed and snappable', 'USA', 9, 7, '12 oz'),
  '133': meta('Orange sweet potatoes, rich in beta-carotene', 'USA', 28, 9, '1 lb'),
  '134': meta('Sweet yellow corn, locally grown', 'USA', 6, 4, '4 ct'),
  '135': meta('Curly kale bunch, nutrient-dense superfood', 'USA', 9, 7, '1 bunch'),
  '136': meta('Green cabbage head, versatile and affordable', 'USA', 28, 12, '1 head'),
  '137': meta('Fresh ginger root, aromatic and spicy', 'China', 28, 9, '4 oz'),
  '138': meta('Fresh garlic bulbs, pungent and flavorful', 'USA', 60, 30, '3 ct'),
  '139': meta('Fresh jalapeño peppers, medium heat', 'Mexico', 11, 9, '4 oz'),
  '140': meta('Seedless watermelon, refreshing and sweet', 'USA', 9, 6, 'Each'),

  // Meat & Poultry (141–155)
  '141': meta('Bone-in chicken thighs, juicy dark meat', 'USA', 6, 4, '1.5 lb'),
  '142': meta('Fresh chicken wings, party pack', 'USA', 6, 4, '2 lb'),
  '143': meta('Lean ground turkey, 93/7', 'USA', 6, 4, '1 lb'),
  '144': meta('USDA Choice chuck roast, slow-cook ready', 'USA', 7, 5, '3 lb'),
  '145': meta('Whole beef brisket, USDA Choice, untrimmed', 'USA', 8, 6, '5 lb'),
  '146': meta('Pork tenderloin, lean and tender', 'USA', 6, 4, '1.5 lb'),
  '147': meta('St. Louis-style baby back ribs, meaty', 'USA', 8, 6, '2 lb rack'),
  '148': meta('Muscovy duck breast, rich and gamey', 'France', 6, 4, '8 oz'),
  '149': meta('Premium veal cutlets, pale and tender', 'Netherlands', 6, 4, '1 lb'),
  '150': meta('Classic pepperoni slices for pizza', 'USA', 90, 46, '6 oz'),
  '151': meta('Corned beef brisket, brined and seasoned', 'Ireland', 38, 9, '3 lb'),
  '152': meta('All-beef hot dogs, uncured', 'USA', 60, 33, '8 ct'),
  '153': meta('Original beef jerky, peppered and dried', 'USA', 180, 107, '3.25 oz'),
  '154': meta('Breaded chicken tenders, ready to cook', 'USA', 90, 60, '1.5 lb'),
  '155': meta('Italian-style frozen meatballs, fully cooked', 'USA', 180, 121, '24 oz'),

  // Seafood (156–165)
  '156': meta('Cold-water lobster tails, shell-on', 'Canada', 180, 152, '5 oz each'),
  '157': meta('Dry-packed sea scallops, U-10 size', 'USA', 5, 4, '12 oz'),
  '158': meta('PEI mussels, farm-raised, cleaned', 'Canada', 4, 3, '2 lb'),                                          // ⚠️ 3 days
  '159': meta('Cleaned calamari rings and tentacles', 'Spain', 180, 152, '1 lb'),
  '160': meta('Canned sardines in olive oil', 'Portugal', 1095, 831, '4.4 oz'),
  '161': meta('Flat anchovy fillets in olive oil', 'Italy', 1095, 879, '2 oz'),
  '162': meta('Cold-smoked Atlantic salmon, sliced', 'Scotland', 28, 9, '4 oz'),
  '163': meta('Littleneck clams, live in shell', 'USA', 3, 1, '2 lb'),                                               // ⚠️ 1 day
  '164': meta('Fresh shucked oysters, Pacific variety', 'USA', 3, 2, '8 oz'),
  '165': meta('Swordfish steak, firm and meaty', 'USA', 5, 4, '8 oz'),

  // Beverages (166–180)
  '166': meta('Pure coconut water, not from concentrate', 'Thailand', 365, 291, '11.2 fl oz'),
  '167': meta('Fresh-squeezed style lemonade', 'USA', 28, 9, '52 fl oz'),
  '168': meta('Brewed iced tea, unsweetened', 'USA', 60, 35, '64 fl oz'),
  '169': meta('Classic root beer, old-fashioned recipe', 'USA', 240, 168, '12 fl oz'),
  '170': meta('Premium ginger ale, dry style', 'Canada', 240, 168, '12 fl oz'),
  '171': meta('100% cranberry juice blend, no sugar added', 'USA', 180, 121, '64 fl oz'),
  '172': meta('Concord grape juice, 100% juice', 'USA', 180, 116, '64 fl oz'),
  '173': meta('Organic raw kombucha, ginger flavor', 'USA', 60, 30, '16 fl oz'),
  '174': meta('Ready-to-drink protein shake, chocolate', 'USA', 270, 213, '11 fl oz'),
  '175': meta('Rich hot chocolate mix, Swiss-style', 'Switzerland', 730, 580, '10 ct'),
  '176': meta('Organic chamomile herbal tea bags', 'Egypt', 730, 600, '20 bags'),
  '177': meta('Whole espresso beans, dark Italian roast', 'Italy', 180, 107, '12 oz'),
  '178': meta('Decaffeinated ground coffee, medium roast', 'Colombia', 180, 121, '12 oz'),
  '179': meta('Organic soy milk, unsweetened', 'USA', 180, 116, '32 fl oz'),
  '180': meta('Premium tonic water with quinine', 'UK', 365, 291, '10 fl oz'),

  // Snacks (181–195)
  '181': meta('Salted tortilla chips, restaurant style', 'Mexico', 150, 91, '13 oz'),
  '182': meta('Crunchy cheese puffs, baked not fried', 'USA', 150, 91, '8 oz'),
  '183': meta('Lightly salted rice cakes, whole grain', 'USA', 240, 168, '4.9 oz'),
  '184': meta('Teriyaki beef jerky bites, tender', 'USA', 180, 107, '2.85 oz'),
  '185': meta('70% cacao dark chocolate bar, Belgian', 'Belgium', 365, 275, '3.5 oz'),
  '186': meta('Classic gummy bears, assorted fruit flavors', 'Germany', 365, 244, '5 oz'),
  '187': meta('Philippine dried mango slices, no sugar added', 'Philippines', 365, 213, '3.5 oz'),
  '188': meta('Roasted sunflower seed kernels, salted', 'USA', 270, 213, '5.25 oz'),
  '189': meta('Dry-roasted peanuts, lightly salted', 'USA', 270, 213, '16 oz'),
  '190': meta('Sea salt veggie straws, crispy and light', 'USA', 180, 116, '6 oz'),
  '191': meta('Mixed fruit snacks, made with real fruit juice', 'USA', 270, 213, '10 ct'),
  '192': meta('Chocolate peanut butter protein bar', 'USA', 270, 213, '2.12 oz'),
  '193': meta('Whole roasted cashews, lightly salted', 'India', 270, 213, '8 oz'),
  '194': meta('In-shell roasted pistachios, salted', 'USA', 365, 275, '8 oz'),
  '195': meta('Classic candy corn, seasonal treat', 'USA', 365, 213, '11 oz'),

  // Frozen (196–210)
  '196': meta('Buttermilk frozen waffles, ready to toast', 'USA', 365, 275, '10 ct'),
  '197': meta('Bean & cheese frozen burritos', 'USA', 180, 107, '8 ct'),
  '198': meta('Crispy golden frozen french fries, straight cut', 'USA', 365, 244, '28 oz'),
  '199': meta('Homestyle frozen meatballs, fully cooked', 'Sweden', 365, 275, '26 oz'),
  '200': meta('Pork & vegetable potsticker dumplings', 'China', 180, 107, '20 oz'),
  '201': meta('Chopped frozen spinach blocks', 'USA', 540, 457, '10 oz'),
  '202': meta('Sweet golden frozen corn kernels', 'USA', 540, 457, '16 oz'),
  '203': meta('Raw frozen shrimp, peeled and deveined', 'Thailand', 365, 244, '1 lb'),
  '204': meta('Premium ice cream bars, chocolate-dipped', 'USA', 365, 275, '6 ct'),
  '205': meta('Chicken pot pie, flaky crust', 'USA', 180, 107, '7 oz'),
  '206': meta('Buttermilk frozen pancakes, microwave ready', 'USA', 365, 275, '12 ct'),
  '207': meta('Vegetable egg rolls, crispy shell', 'USA', 180, 107, '12.7 oz'),
  '208': meta('Frozen mango chunks, ready for smoothies', 'India', 540, 420, '12 oz'),
  '209': meta('Raspberry sorbet, dairy-free', 'France', 365, 275, '1 pint'),
  '210': meta('Creamy frozen macaroni & cheese', 'USA', 180, 107, '10 oz'),

  // Pantry (211–230)
  '211': meta('Organic garbanzo beans (chickpeas), canned', 'Turkey', 730, 517, '15 oz'),
  '212': meta('French green lentils, dried', 'France', 730, 457, '16 oz'),
  '213': meta('Dark red kidney beans, canned', 'USA', 730, 517, '15 oz'),
  '214': meta('Organic white quinoa, pre-rinsed', 'Peru', 730, 457, '16 oz'),
  '215': meta('Old-fashioned rolled oats, whole grain', 'USA', 365, 213, '18 oz'),
  '216': meta('Complete buttermilk pancake & waffle mix', 'USA', 365, 213, '32 oz'),
  '217': meta('Pure maple syrup, Grade A dark amber', 'Canada', 730, 365, '12 fl oz'),
  '218': meta('Raw wildflower honey, unfiltered', 'USA', 1095, 831, '12 oz'),
  '219': meta('Long grain brown rice, whole grain', 'USA', 730, 457, '2 lb'),
  '220': meta('Chicken flavor instant ramen noodles', 'Japan', 365, 213, '3 oz'),
  '221': meta('Double-concentrated tomato paste, tube', 'Italy', 730, 548, '4.5 oz'),
  '222': meta('Full-fat coconut milk, BPA-free can', 'Thailand', 730, 517, '13.5 fl oz'),
  '223': meta('Low-sodium vegetable broth, organic', 'USA', 540, 396, '32 fl oz'),
  '224': meta('Rich beef bone broth, slow-simmered', 'USA', 540, 396, '32 fl oz'),
  '225': meta('Chunk light canned tuna in water', 'Thailand', 1095, 831, '5 oz'),
  '226': meta('Whole kernel sweet corn, canned', 'USA', 730, 517, '15 oz'),
  '227': meta('Pure cornstarch, thickening agent', 'USA', 1095, 831, '16 oz'),
  '228': meta('Arm & Hammer baking soda, pure', 'USA', 1095, 1030, '16 oz'),
  '229': meta('Double-acting baking powder, aluminum-free', 'USA', 730, 457, '8.1 oz'),
  '230': meta('Pure vanilla extract, Madagascar bourbon', 'Madagascar', 1460, 1060, '2 fl oz'),

  // Condiments (231–245)
  '231': meta('Smoky BBQ sauce, Kansas City style', 'USA', 540, 396, '18 oz'),
  '232': meta('Authentic teriyaki sauce and marinade', 'Japan', 540, 335, '10 fl oz'),
  '233': meta('Sriracha hot chili sauce, rooster brand', 'USA', 730, 457, '17 oz'),
  '234': meta('Original Worcestershire sauce, fermented', 'UK', 730, 365, '10 fl oz'),
  '235': meta('Raw unfiltered apple cider vinegar with mother', 'USA', 1095, 831, '16 fl oz'),
  '236': meta('Pure tahini, ground hulled sesame seeds', 'Israel', 540, 335, '16 oz'),
  '237': meta('Chunky garden salsa, medium heat', 'Mexico', 180, 46, '16 oz'),
  '238': meta('Fresh guacamole, made daily', 'USA', 4, -1, '8 oz'),                                                   // 🔴 expired yesterday
  '239': meta('Smooth Dijon mustard, French style', 'France', 730, 457, '8 oz'),
  '240': meta('Creamy Caesar dressing, classic recipe', 'USA', 120, 46, '12 fl oz'),
  '241': meta('Zesty Italian vinaigrette dressing', 'USA', 120, 46, '16 fl oz'),
  '242': meta('Sweet honey mustard dipping sauce', 'USA', 180, 46, '12 oz'),
  '243': meta('Classic tartar sauce for seafood', 'USA', 120, 46, '8 oz'),
  '244': meta('Bold A1 steak sauce, original', 'USA', 730, 517, '10 oz'),
  '245': meta('Sweet pickle relish, finely chopped', 'USA', 540, 396, '10 oz'),

  // Health & Household (246–258)
  '246': meta('HE liquid laundry detergent, fresh scent', 'USA', 730, 517, '100 fl oz'),
  '247': meta('Liquid fabric softener, spring meadow', 'USA', 730, 517, '51 fl oz'),
  '248': meta('Concentrated bleach, disinfecting formula', 'USA', 730, 457, '121 fl oz'),
  '249': meta('All-purpose cleaning spray, lemon', 'USA', 730, 517, '32 fl oz'),
  '250': meta('Drawstring kitchen trash bags, 13 gallon', 'USA', 1095, 1030, '45 ct'),
  '251': meta('Heavy-duty aluminum foil roll', 'USA', 1460, 1060, '75 sq ft'),
  '252': meta('Cling plastic food wrap, microwave safe', 'USA', 1095, 1030, '200 sq ft'),
  '253': meta('Moisturizing hair conditioner, argan oil', 'France', 730, 580, '12.6 fl oz'),
  '254': meta('Daily moisturizing body lotion, unscented', 'USA', 730, 517, '18 fl oz'),
  '255': meta('Antiseptic mouthwash, mint flavor', 'USA', 730, 580, '33.8 fl oz'),
  '256': meta('Flexible fabric bandages, assorted sizes', 'USA', 1095, 831, '100 ct'),
  '257': meta('Pure cotton swabs, double-tipped', 'USA', 1460, 1060, '500 ct'),
  '258': meta('Daily multivitamin tablets, adults', 'USA', 730, 457, '150 ct'),

  // Deli (259–268)
  '259': meta('Slow-roasted top round roast beef, sliced thin', 'USA', 14, 8, '8 oz'),
  '260': meta('New York-style pastrami, peppered edge', 'USA', 14, 8, '6 oz'),
  '261': meta('Classic beef bologna, thick-sliced', 'USA', 60, 33, '12 oz'),
  '262': meta('Pepper jack cheese slices, spicy kick', 'USA', 60, 25, '8 oz'),
  '263': meta('Mild muenster cheese slices, smooth melt', 'USA', 60, 25, '8 oz'),
  '264': meta('Mediterranean olive tapenade, Kalamata', 'Greece', 90, 30, '7 oz'),
  '265': meta('All-white meat chicken salad, classic recipe', 'USA', 8, 5, '12 oz'),
  '266': meta('Creamy coleslaw, cabbage and carrot blend', 'USA', 8, 5, '15 oz'),
  '267': meta('Traditional potato salad, mustard style', 'USA', 8, 5, '16 oz'),
  '268': meta('Classic egg salad, ready to eat', 'USA', 8, 5, '12 oz'),

  // Baby & Kids (269–278)
  '269': meta('Infant formula milk-based powder, stage 1', 'USA', 540, 396, '12.5 oz'),
  '270': meta('Organic baby food puree, apple banana', 'USA', 365, 291, '4 oz pouch'),
  '271': meta('Size 3 baby diapers, super absorbent', 'USA', 1095, 879, '88 ct'),
  '272': meta('Sensitive baby wipes, fragrance-free', 'USA', 1095, 879, '72 ct'),
  '273': meta('Whole grain baby oatmeal cereal, iron-fortified', 'USA', 540, 396, '8 oz'),
  '274': meta('100% apple juice boxes, no sugar added', 'USA', 365, 213, '8 ct'),
  '275': meta('Original animal crackers, lightly sweetened', 'USA', 365, 213, '8 oz'),
  '276': meta('Instant macaroni & cheese cups, microwavable', 'USA', 365, 213, '4 ct'),
  '277': meta('Organic fruit squeeze pouches, mixed berry', 'USA', 540, 396, '4 ct'),
  '278': meta('Cheddar goldfish crackers, baked snack', 'USA', 180, 91, '6.6 oz'),

  // Pet Supplies (279–288)
  '279': meta('Premium dry dog food, chicken & rice recipe', 'USA', 365, 152, '15 lb'),
  '280': meta('Indoor formula dry cat food, chicken', 'USA', 365, 152, '7 lb'),
  '281': meta('Bacon-flavored dog training treats', 'USA', 365, 213, '6 oz'),
  '282': meta('Crunchy cat treats, chicken flavor', 'USA', 365, 213, '3 oz'),
  '283': meta('Clumping cat litter, unscented, low dust', 'USA', 1095, 831, '20 lb'),
  '284': meta('Hearty cuts wet dog food, beef & gravy', 'USA', 730, 517, '13 oz'),
  '285': meta('Pate wet cat food, ocean whitefish', 'USA', 730, 517, '5.5 oz'),
  '286': meta('Absorbent puppy training pads, leak-proof', 'USA', 1095, 831, '50 ct'),
  '287': meta('Adjustable flea & tick prevention collar, dog', 'USA', 730, 580, '1 ct'),
  '288': meta('Oatmeal pet shampoo, soothing formula', 'USA', 730, 517, '16 fl oz'),

  // International (289–298)
  '289': meta('Short-grain Japanese sushi rice, premium', 'Japan', 730, 457, '5 lb'),
  '290': meta('Thai red curry paste, authentic recipe', 'Thailand', 730, 517, '4 oz'),
  '291': meta('Flat rice noodles for pad thai', 'Thailand', 730, 457, '14 oz'),
  '292': meta('Rich coconut cream, high-fat content', 'Thailand', 730, 517, '13.5 fl oz'),
  '293': meta('White miso paste, mild and sweet', 'Japan', 730, 457, '13.2 oz'),
  '294': meta('Sambal oelek chili paste, fresh ground', 'Vietnam', 730, 457, '8 oz'),
  '295': meta('Tunisian harissa paste, smoky and spicy', 'Tunisia', 730, 457, '3.5 oz'),
  '296': meta('Smooth tahini sauce with lemon', 'Israel', 540, 335, '10.6 oz'),
  '297': meta('Premium fish sauce, first press', 'Vietnam', 730, 457, '6.76 fl oz'),
  '298': meta('Korean fermented red chili paste', 'South Korea', 730, 457, '17.6 oz'),

  // Prepared Foods (299–300)
  '299': meta('Oven-roasted rotisserie chicken, seasoned', 'USA', 3, 0, '2.5 lb'),                                    // 🔴 expires today
  '300': meta('Complete Caesar salad kit with croutons and dressing', 'USA', 5, 3, '10.5 oz'),                         // ⚠️ 3 days
};
