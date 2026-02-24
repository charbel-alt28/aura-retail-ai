// Product metadata: descriptions, origin, production/expiry info

export interface ProductMeta {
  description: string;
  origin: string;
  dop: string; // Date of Production
  doe: string; // Date of Expiry
  weight?: string;
  ingredients?: string;
}

const meta = (description: string, origin: string, dop: string, doe: string, weight?: string, ingredients?: string): ProductMeta => ({
  description, origin, dop, doe, weight, ingredients,
});

export const productMetadata: Record<string, ProductMeta> = {
  // Dairy
  '1':  meta('Fresh whole milk, pasteurized and homogenized', 'USA', '2026-02-20', '2026-03-10', '1 Gallon'),
  '3':  meta('Farm-fresh large eggs, grade A', 'USA', '2026-02-18', '2026-03-18', '12 ct'),
  '4':  meta('Aged cheddar cheese block, sharp flavor', 'Ireland', '2025-12-01', '2026-06-01', '8 oz'),
  '5':  meta('Creamy Greek yogurt, plain', 'Greece', '2026-02-15', '2026-03-15', '6 oz'),
  '9':  meta('Unsalted butter, European style', 'France', '2026-01-10', '2026-07-10', '8 oz'),
  '10': meta('Heavy whipping cream, ultra-pasteurized', 'USA', '2026-02-22', '2026-03-22', '16 fl oz'),
  '11': meta('Cultured sour cream, full fat', 'USA', '2026-02-19', '2026-03-19', '16 oz'),
  '12': meta('Small curd cottage cheese, 4% milkfat', 'USA', '2026-02-17', '2026-03-10', '16 oz'),
  '13': meta('Philadelphia-style cream cheese, original', 'USA', '2026-02-14', '2026-04-14', '8 oz'),

  // Bakery
  '2':  meta('Classic white sandwich bread, soft and fluffy', 'USA', '2026-02-23', '2026-03-02', '20 oz'),
  '14': meta('Plain bagels, New York style, boiled and baked', 'USA', '2026-02-22', '2026-02-28', '6 ct'),
  '15': meta('All-butter croissants, flaky and golden', 'France', '2026-02-23', '2026-02-27', '4 ct'),
  '16': meta('Blueberry muffins, bakery fresh', 'USA', '2026-02-22', '2026-02-28', '4 ct'),
  '17': meta('Traditional French baguette, crusty exterior', 'France', '2026-02-24', '2026-02-26', '10 oz'),
  '18': meta('Soft dinner rolls, perfect for any meal', 'USA', '2026-02-23', '2026-03-01', '12 ct'),
  '19': meta('Flour tortillas, soft and pliable', 'Mexico', '2026-02-20', '2026-04-20', '10 ct'),
  '20': meta('Whole wheat pita bread pockets', 'Lebanon', '2026-02-21', '2026-03-07', '6 ct'),

  // Produce
  '6':  meta('Crisp Fuji apples, naturally sweet', 'USA', '2026-02-20', '2026-03-20', '1 lb'),
  '21': meta('Premium Cavendish bananas, ripe and sweet', 'Ecuador', '2026-02-22', '2026-03-01', '1 bunch'),
  '22': meta('Navel oranges, seedless and juicy', 'Spain', '2026-02-18', '2026-03-18', '1 lb'),
  '23': meta('Vine-ripened tomatoes, rich flavor', 'Mexico', '2026-02-22', '2026-03-01', '1 lb'),
  '24': meta('Iceberg lettuce head, fresh and crunchy', 'USA', '2026-02-23', '2026-03-02', '1 head'),
  '25': meta('Organic whole carrots, sweet and tender', 'USA', '2026-02-20', '2026-03-20', '1 lb'),
  '26': meta('Russet potatoes, ideal for baking', 'USA', '2026-02-15', '2026-03-15', '5 lb bag'),
  '27': meta('Yellow onions, versatile and aromatic', 'USA', '2026-02-10', '2026-04-10', '3 lb bag'),
  '28': meta('Hass avocados, creamy and ripe', 'Mexico', '2026-02-22', '2026-02-28', 'Each'),
  '29': meta('Mixed bell peppers, red/yellow/green', 'Netherlands', '2026-02-21', '2026-03-03', '3 ct'),
  '30': meta('English cucumbers, seedless', 'Canada', '2026-02-22', '2026-03-04', 'Each'),
  '31': meta('Fresh broccoli crowns, nutrient-packed', 'USA', '2026-02-22', '2026-03-01', '1 lb'),
  '32': meta('Baby spinach leaves, pre-washed', 'USA', '2026-02-22', '2026-02-28', '5 oz'),
  '33': meta('White button mushrooms, sliced', 'USA', '2026-02-22', '2026-02-28', '8 oz'),

  // Meat & Poultry
  '8':  meta('Whole roasting chicken, USDA inspected', 'USA', '2026-02-22', '2026-02-27', '5 lb'),
  '34': meta('Boneless skinless chicken breast, all-natural', 'USA', '2026-02-22', '2026-02-27', '1 lb'),
  '35': meta('80/20 ground beef, USDA Choice', 'USA', '2026-02-22', '2026-02-27', '1 lb'),
  '36': meta('Center-cut pork chops, bone-in', 'USA', '2026-02-21', '2026-02-27', '1 lb'),
  '37': meta('Whole turkey, frozen, premium quality', 'USA', '2026-01-15', '2026-07-15', '12 lb'),
  '38': meta('Hickory-smoked bacon, thick-cut slices', 'USA', '2026-02-10', '2026-04-10', '16 oz'),
  '39': meta('Pork breakfast sausage links', 'USA', '2026-02-20', '2026-03-06', '12 oz'),
  '40': meta('USDA Prime ribeye steak, well-marbled', 'USA', '2026-02-23', '2026-02-28', '12 oz'),
  '41': meta('New Zealand lamb loin chops, grass-fed', 'New Zealand', '2026-02-20', '2026-02-27', '1 lb'),

  // Seafood
  '42': meta('Atlantic salmon fillet, skin-on, fresh', 'Norway', '2026-02-23', '2026-02-26', '8 oz'),
  '43': meta('Wild-caught jumbo shrimp, peeled and deveined', 'Thailand', '2026-02-15', '2026-08-15', '1 lb'),
  '44': meta('Yellowfin tuna steak, sushi-grade', 'Japan', '2026-02-23', '2026-02-26', '6 oz'),
  '45': meta('Pacific cod fillet, wild-caught, boneless', 'Alaska, USA', '2026-02-22', '2026-02-27', '8 oz'),
  '46': meta('Snow crab leg clusters, pre-cooked', 'Canada', '2026-01-20', '2026-07-20', '1.5 lb'),
  '47': meta('Farm-raised tilapia fillets, mild flavor', 'China', '2026-02-18', '2026-02-25', '1 lb'),

  // Beverages
  '7':  meta('100% pure squeezed orange juice, no pulp', 'Brazil', '2026-02-18', '2026-03-18', '64 fl oz'),
  '48': meta('Natural apple juice, from concentrate', 'USA', '2026-02-10', '2026-05-10', '64 fl oz'),
  '49': meta('Classic cola carbonated soft drink', 'USA', '2026-01-01', '2026-09-01', '12 fl oz'),
  '50': meta('Natural sparkling mineral water', 'Italy', '2025-10-01', '2027-10-01', '1 L'),
  '51': meta('Medium roast Arabica ground coffee', 'Colombia', '2026-01-15', '2026-07-15', '12 oz'),
  '52': meta('Organic green tea bags, antioxidant rich', 'Japan', '2025-11-01', '2027-11-01', '20 bags'),
  '53': meta('Sugar-free energy drink, tropical flavor', 'Austria', '2026-01-01', '2027-01-01', '12 fl oz'),
  '54': meta('Organic oat milk, barista edition', 'Sweden', '2026-02-01', '2026-06-01', '32 fl oz'),

  // Snacks
  '55': meta('Kettle-cooked sea salt potato chips', 'USA', '2026-01-15', '2026-05-15', '8 oz'),
  '56': meta('Traditional twisted pretzels, salted', 'USA', '2026-01-20', '2026-07-20', '16 oz'),
  '57': meta('Movie theater butter microwave popcorn', 'USA', '2026-01-10', '2026-07-10', '3 ct'),
  '58': meta('Original wheat crackers, oven-baked', 'USA', '2026-01-01', '2026-07-01', '9 oz'),
  '59': meta('Double chocolate chip cookies, chewy', 'Belgium', '2026-02-15', '2026-05-15', '14 oz'),
  '60': meta('Oats & honey granola bars, crunchy', 'USA', '2026-01-20', '2026-07-20', '6 ct'),
  '61': meta('Deluxe mixed nuts, roasted and salted', 'USA', '2026-01-01', '2026-10-01', '10 oz'),
  '62': meta('Mountain trail mix with dried fruit and nuts', 'USA', '2026-01-10', '2026-08-10', '10 oz'),

  // Frozen
  '63': meta('Premium vanilla bean ice cream', 'USA', '2025-12-01', '2026-12-01', '1 pint'),
  '64': meta('Four cheese frozen pizza, stone-baked crust', 'Italy', '2025-11-15', '2026-11-15', '22 oz'),
  '65': meta('Mixed frozen vegetables: peas, corn, carrots', 'USA', '2025-12-01', '2027-06-01', '16 oz'),
  '66': meta('Chicken tikka masala frozen meal', 'India', '2026-01-01', '2026-07-01', '10 oz'),
  '67': meta('Organic frozen mixed berries blend', 'Chile', '2025-11-01', '2027-05-01', '12 oz'),
  '68': meta('Breaded fish sticks, wild-caught pollock', 'USA', '2025-12-15', '2026-12-15', '11 oz'),

  // Pantry
  '69': meta('Whole peeled canned tomatoes, San Marzano', 'Italy', '2025-09-01', '2027-09-01', '28 oz'),
  '70': meta('Organic black beans, low sodium', 'Mexico', '2025-08-01', '2027-08-01', '15 oz'),
  '71': meta('Durum wheat spaghetti, bronze-cut', 'Italy', '2025-10-01', '2027-10-01', '16 oz'),
  '72': meta('Long grain white rice, enriched', 'Thailand', '2025-06-01', '2027-06-01', '5 lb'),
  '73': meta('Honey nut oat cereal, whole grain', 'USA', '2026-01-01', '2026-10-01', '15 oz'),
  '74': meta('Classic chicken noodle soup, ready to serve', 'USA', '2025-10-01', '2027-10-01', '18.6 oz'),
  '75': meta('Creamy peanut butter, no-stir', 'USA', '2026-01-01', '2027-01-01', '16 oz'),
  '76': meta('Seedless strawberry jam, made with real fruit', 'France', '2025-11-01', '2027-05-01', '12 oz'),
  '77': meta('Unbleached all-purpose flour', 'USA', '2025-09-01', '2027-03-01', '5 lb'),
  '78': meta('Pure cane granulated white sugar', 'Brazil', '2025-08-01', '2028-08-01', '4 lb'),

  // Condiments
  '79': meta('Classic tomato ketchup, squeeze bottle', 'USA', '2025-11-01', '2027-05-01', '20 oz'),
  '80': meta('Yellow mustard, tangy and smooth', 'USA', '2025-10-01', '2027-04-01', '14 oz'),
  '81': meta('Real mayonnaise, made with cage-free eggs', 'USA', '2026-01-01', '2026-07-01', '30 oz'),
  '82': meta('Original cayenne pepper hot sauce', 'USA', '2025-06-01', '2028-06-01', '5 fl oz'),
  '83': meta('Naturally brewed soy sauce', 'Japan', '2025-03-01', '2027-03-01', '15 fl oz'),
  '84': meta('Extra virgin olive oil, cold-pressed', 'Spain', '2025-09-01', '2027-03-01', '16.9 fl oz'),
  '85': meta('Aged balsamic vinegar of Modena', 'Italy', '2024-01-01', '2029-01-01', '8.5 fl oz'),
  '86': meta('Classic ranch dressing, creamy', 'USA', '2026-01-15', '2026-05-15', '16 fl oz'),

  // Health & Household
  '87': meta('Ultra-soft 2-ply toilet paper', 'USA', '2026-01-01', '2029-01-01', '12 rolls'),
  '88': meta('Select-a-size paper towels, absorbent', 'USA', '2026-01-01', '2029-01-01', '6 rolls'),
  '89': meta('Moisturizing shampoo, argan oil formula', 'France', '2025-10-01', '2027-10-01', '12.6 fl oz'),
  '90': meta('Gentle cleansing bar soap, unscented', 'USA', '2025-08-01', '2028-08-01', '3.5 oz'),
  '91': meta('Whitening toothpaste with fluoride', 'USA', '2026-01-01', '2028-01-01', '6 oz'),
  '92': meta('48-hour antiperspirant deodorant stick', 'USA', '2025-12-01', '2027-12-01', '2.7 oz'),
  '93': meta('Moisturizing hand sanitizer gel, 70% alcohol', 'USA', '2025-11-01', '2027-11-01', '8 fl oz'),
  '94': meta('Antibacterial liquid dish soap, lemon scent', 'USA', '2025-10-01', '2027-10-01', '22 fl oz'),

  // Deli
  '95': meta('Honey-glazed deli sliced ham, premium cut', 'USA', '2026-02-22', '2026-03-08', '8 oz'),
  '96': meta('Oven-roasted deli turkey breast, low sodium', 'USA', '2026-02-22', '2026-03-08', '8 oz'),
  '97': meta('Genoa salami, dry-cured Italian style', 'Italy', '2026-02-01', '2026-04-01', '6 oz'),
  '98': meta('Provolone cheese slices, mild and smooth', 'Italy', '2026-02-10', '2026-04-10', '8 oz'),
  '99': meta('Swiss cheese slices, nutty flavor', 'Switzerland', '2026-02-10', '2026-04-10', '8 oz'),
  '100': meta('Classic hummus, creamy chickpea dip', 'Lebanon', '2026-02-15', '2026-03-15', '10 oz'),
};
