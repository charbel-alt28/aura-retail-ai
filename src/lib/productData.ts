import { Product } from './store';

// Image imports - Dairy
import milkImg from '@/assets/products/milk.png';
import cheeseImg from '@/assets/products/cheese.png';
import yogurtImg from '@/assets/products/yogurt.png';
import eggsImg from '@/assets/products/eggs.png';
import butterImg from '@/assets/products/butter.png';
import heavyCreamImg from '@/assets/products/heavy-cream.png';
import sourCreamImg from '@/assets/products/sour-cream.png';
import cottageCheeseImg from '@/assets/products/cottage-cheese.png';
import creamCheeseImg from '@/assets/products/cream-cheese.png';

// Bakery
import breadImg from '@/assets/products/bread.png';
import bagelsImg from '@/assets/products/bagels.png';
import croissantsImg from '@/assets/products/croissants.png';
import muffinsImg from '@/assets/products/muffins.png';
import baguetteImg from '@/assets/products/baguette.png';
import dinnerRollsImg from '@/assets/products/dinner-rolls.png';
import tortillasImg from '@/assets/products/tortillas.png';
import pitaBreadImg from '@/assets/products/pita-bread.png';

// Produce
import applesImg from '@/assets/products/apples.png';
import bananasImg from '@/assets/products/bananas.png';
import orangesImg from '@/assets/products/oranges.png';
import tomatoesImg from '@/assets/products/tomatoes.png';
import lettuceImg from '@/assets/products/lettuce.png';
import carrotsImg from '@/assets/products/carrots.png';
import potatoesImg from '@/assets/products/potatoes.png';
import onionsImg from '@/assets/products/onions.png';
import avocadosImg from '@/assets/products/avocados.png';
import bellPeppersImg from '@/assets/products/bell-peppers.png';
import cucumbersImg from '@/assets/products/cucumbers.png';
import broccoliImg from '@/assets/products/broccoli.png';
import spinachImg from '@/assets/products/spinach.png';
import mushroomsImg from '@/assets/products/mushrooms.png';

// Meat & Poultry
import chickenImg from '@/assets/products/chicken.png';
import chickenBreastImg from '@/assets/products/chicken-breast.png';
import groundBeefImg from '@/assets/products/ground-beef.png';
import porkChopsImg from '@/assets/products/pork-chops.png';
import turkeyImg from '@/assets/products/turkey.png';
import baconImg from '@/assets/products/bacon.png';
import sausageImg from '@/assets/products/sausage.png';
import steakImg from '@/assets/products/steak.png';
import lambChopsImg from '@/assets/products/lamb-chops.png';

// Seafood
import salmonImg from '@/assets/products/salmon.png';
import shrimpImg from '@/assets/products/shrimp.png';
import tunaImg from '@/assets/products/tuna.png';
import codImg from '@/assets/products/cod.png';
import crabLegsImg from '@/assets/products/crab-legs.png';
import tilapiaImg from '@/assets/products/tilapia.png';

// Beverages
import orangeJuiceImg from '@/assets/products/orange-juice.png';
import appleJuiceImg from '@/assets/products/apple-juice.png';
import colaImg from '@/assets/products/cola.png';
import sparklingWaterImg from '@/assets/products/sparkling-water.png';
import coffeeImg from '@/assets/products/coffee.png';
import greenTeaImg from '@/assets/products/green-tea.png';
import energyDrinkImg from '@/assets/products/energy-drink.png';
import oatMilkImg from '@/assets/products/oat-milk.png';

// Snacks
import potatoChipsImg from '@/assets/products/potato-chips.png';
import pretzelsImg from '@/assets/products/pretzels.png';
import popcornImg from '@/assets/products/popcorn.png';
import crackersImg from '@/assets/products/crackers.png';
import cookiesImg from '@/assets/products/cookies.png';
import granolaBarsImg from '@/assets/products/granola-bars.png';
import mixedNutsImg from '@/assets/products/mixed-nuts.png';
import trailMixImg from '@/assets/products/trail-mix.png';

// Frozen
import iceCreamImg from '@/assets/products/ice-cream.png';
import frozenPizzaImg from '@/assets/products/frozen-pizza.png';
import frozenVegetablesImg from '@/assets/products/frozen-vegetables.png';
import frozenMealsImg from '@/assets/products/frozen-meals.png';
import frozenBerriesImg from '@/assets/products/frozen-berries.png';
import fishSticksImg from '@/assets/products/fish-sticks.png';

// Pantry
import cannedTomatoesImg from '@/assets/products/canned-tomatoes.png';
import blackBeansImg from '@/assets/products/black-beans.png';
import spaghettiImg from '@/assets/products/spaghetti.png';
import whiteRiceImg from '@/assets/products/white-rice.png';
import cerealImg from '@/assets/products/cereal.png';
import chickenSoupImg from '@/assets/products/chicken-soup.png';
import peanutButterImg from '@/assets/products/peanut-butter.png';
import strawberryJamImg from '@/assets/products/strawberry-jam.png';
import flourImg from '@/assets/products/flour.png';
import sugarImg from '@/assets/products/sugar.png';

// Condiments
import ketchupImg from '@/assets/products/ketchup.png';
import mustardImg from '@/assets/products/mustard.png';
import mayonnaiseImg from '@/assets/products/mayonnaise.png';
import hotSauceImg from '@/assets/products/hot-sauce.png';
import soySauceImg from '@/assets/products/soy-sauce.png';
import oliveOilImg from '@/assets/products/olive-oil.png';
import balsamicVinegarImg from '@/assets/products/balsamic-vinegar.png';
import ranchDressingImg from '@/assets/products/ranch-dressing.png';

// Health & Household
import toiletPaperImg from '@/assets/products/toilet-paper.png';
import paperTowelsImg from '@/assets/products/paper-towels.png';
import shampooImg from '@/assets/products/shampoo.png';
import barSoapImg from '@/assets/products/bar-soap.png';
import toothpasteImg from '@/assets/products/toothpaste.png';
import deodorantImg from '@/assets/products/deodorant.png';
import handSanitizerImg from '@/assets/products/hand-sanitizer.png';
import dishSoapImg from '@/assets/products/dish-soap.png';

// Deli
import slicedHamImg from '@/assets/products/sliced-ham.png';
import deliTurkeyImg from '@/assets/products/deli-turkey.png';
import salamiImg from '@/assets/products/salami.png';
import provoloneImg from '@/assets/products/provolone.png';
import swissCheeseImg from '@/assets/products/swiss-cheese.png';
import hummusImg from '@/assets/products/hummus.png';

export const CATEGORIES = [
  'All',
  'Dairy',
  'Bakery',
  'Produce',
  'Meat & Poultry',
  'Seafood',
  'Beverages',
  'Snacks',
  'Frozen',
  'Pantry',
  'Condiments',
  'Health & Household',
  'Deli',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const productImages: Record<string, string> = {
  '1': milkImg, '2': breadImg, '3': eggsImg, '4': cheeseImg, '5': yogurtImg,
  '6': applesImg, '7': orangeJuiceImg, '8': chickenImg, '9': butterImg,
  '10': heavyCreamImg, '11': sourCreamImg, '12': cottageCheeseImg, '13': creamCheeseImg,
  '14': bagelsImg, '15': croissantsImg, '16': muffinsImg, '17': baguetteImg,
  '18': dinnerRollsImg, '19': tortillasImg, '20': pitaBreadImg,
  '21': bananasImg, '22': orangesImg, '23': tomatoesImg, '24': lettuceImg,
  '25': carrotsImg, '26': potatoesImg, '27': onionsImg, '28': avocadosImg,
  '29': bellPeppersImg, '30': cucumbersImg, '31': broccoliImg, '32': spinachImg,
  '33': mushroomsImg,
  '34': chickenBreastImg, '35': groundBeefImg, '36': porkChopsImg, '37': turkeyImg,
  '38': baconImg, '39': sausageImg, '40': steakImg, '41': lambChopsImg,
  '42': salmonImg, '43': shrimpImg, '44': tunaImg, '45': codImg,
  '46': crabLegsImg, '47': tilapiaImg,
  '48': appleJuiceImg, '49': colaImg, '50': sparklingWaterImg,
  '51': coffeeImg, '52': greenTeaImg, '53': energyDrinkImg, '54': oatMilkImg,
  '55': potatoChipsImg, '56': pretzelsImg, '57': popcornImg, '58': crackersImg,
  '59': cookiesImg, '60': granolaBarsImg, '61': mixedNutsImg, '62': trailMixImg,
  '63': iceCreamImg, '64': frozenPizzaImg, '65': frozenVegetablesImg,
  '66': frozenMealsImg, '67': frozenBerriesImg, '68': fishSticksImg,
  '69': cannedTomatoesImg, '70': blackBeansImg, '71': spaghettiImg, '72': whiteRiceImg,
  '73': cerealImg, '74': chickenSoupImg, '75': peanutButterImg, '76': strawberryJamImg,
  '77': flourImg, '78': sugarImg,
  '79': ketchupImg, '80': mustardImg, '81': mayonnaiseImg, '82': hotSauceImg,
  '83': soySauceImg, '84': oliveOilImg, '85': balsamicVinegarImg, '86': ranchDressingImg,
  '87': toiletPaperImg, '88': paperTowelsImg, '89': shampooImg, '90': barSoapImg,
  '91': toothpasteImg, '92': deodorantImg, '93': handSanitizerImg, '94': dishSoapImg,
  '95': slicedHamImg, '96': deliTurkeyImg, '97': salamiImg, '98': provoloneImg,
  '99': swissCheeseImg, '100': hummusImg,
};

const d = (level: 'low' | 'medium' | 'high') => level;
const p = (id: string, name: string, stock: number, reorder: number, forecast: number, base: number, demand: 'low' | 'medium' | 'high', category: string): Product => ({
  id, name, stock, reorderLevel: reorder, demandForecast: forecast,
  basePrice: base, currentPrice: base, demandLevel: demand, category,
});

export const initialProducts: Product[] = [
  // Dairy (9)
  p('1', 'Milk', 150, 50, 45, 3.50, 'medium', 'Dairy'),
  p('3', 'Eggs', 300, 100, 80, 4.00, 'medium', 'Dairy'),
  p('4', 'Cheese', 80, 30, 35, 6.00, 'low', 'Dairy'),
  p('5', 'Yogurt', 120, 40, 50, 2.00, 'high', 'Dairy'),
  p('9', 'Butter', 95, 35, 30, 4.50, 'medium', 'Dairy'),
  p('10', 'Heavy Cream', 60, 25, 20, 3.80, 'low', 'Dairy'),
  p('11', 'Sour Cream', 75, 30, 28, 2.50, 'medium', 'Dairy'),
  p('12', 'Cottage Cheese', 55, 20, 18, 3.20, 'low', 'Dairy'),
  p('13', 'Cream Cheese', 90, 35, 32, 3.00, 'medium', 'Dairy'),

  // Bakery (8)
  p('2', 'White Bread', 200, 75, 60, 2.50, 'high', 'Bakery'),
  p('14', 'Bagels', 110, 40, 38, 3.50, 'medium', 'Bakery'),
  p('15', 'Croissants', 45, 20, 25, 4.00, 'high', 'Bakery'),
  p('16', 'Muffins', 60, 25, 22, 3.80, 'medium', 'Bakery'),
  p('17', 'Baguette', 35, 15, 18, 3.00, 'medium', 'Bakery'),
  p('18', 'Dinner Rolls', 80, 30, 28, 2.80, 'medium', 'Bakery'),
  p('19', 'Tortillas', 130, 50, 45, 3.20, 'high', 'Bakery'),
  p('20', 'Pita Bread', 65, 25, 20, 2.80, 'low', 'Bakery'),

  // Produce (13)
  p('6', 'Apples', 45, 60, 70, 1.50, 'high', 'Produce'),
  p('21', 'Bananas', 180, 60, 75, 0.60, 'high', 'Produce'),
  p('22', 'Oranges', 120, 45, 50, 1.20, 'medium', 'Produce'),
  p('23', 'Tomatoes', 90, 40, 55, 2.00, 'high', 'Produce'),
  p('24', 'Lettuce', 70, 30, 35, 1.80, 'medium', 'Produce'),
  p('25', 'Carrots', 150, 50, 40, 1.00, 'medium', 'Produce'),
  p('26', 'Potatoes', 200, 80, 65, 0.80, 'medium', 'Produce'),
  p('27', 'Onions', 160, 60, 50, 0.90, 'medium', 'Produce'),
  p('28', 'Avocados', 40, 25, 45, 1.50, 'high', 'Produce'),
  p('29', 'Bell Peppers', 85, 35, 40, 1.80, 'medium', 'Produce'),
  p('30', 'Cucumbers', 95, 35, 30, 0.80, 'low', 'Produce'),
  p('31', 'Broccoli', 70, 30, 35, 2.00, 'medium', 'Produce'),
  p('32', 'Spinach', 55, 25, 30, 2.50, 'medium', 'Produce'),
  p('33', 'Mushrooms', 60, 25, 28, 3.00, 'medium', 'Produce'),

  // Meat & Poultry (8)
  p('8', 'Whole Chicken', 25, 30, 55, 8.00, 'high', 'Meat & Poultry'),
  p('34', 'Chicken Breast', 65, 40, 60, 7.50, 'high', 'Meat & Poultry'),
  p('35', 'Ground Beef', 80, 35, 50, 6.50, 'high', 'Meat & Poultry'),
  p('36', 'Pork Chops', 45, 20, 25, 5.50, 'medium', 'Meat & Poultry'),
  p('37', 'Turkey', 30, 15, 20, 9.00, 'low', 'Meat & Poultry'),
  p('38', 'Bacon', 100, 40, 45, 6.00, 'high', 'Meat & Poultry'),
  p('39', 'Sausage Links', 70, 30, 35, 4.50, 'medium', 'Meat & Poultry'),
  p('40', 'Ribeye Steak', 20, 15, 18, 16.00, 'medium', 'Meat & Poultry'),
  p('41', 'Lamb Chops', 15, 10, 12, 14.00, 'low', 'Meat & Poultry'),

  // Seafood (6)
  p('42', 'Salmon Fillet', 35, 20, 30, 12.00, 'high', 'Seafood'),
  p('43', 'Shrimp', 50, 25, 28, 10.00, 'medium', 'Seafood'),
  p('44', 'Tuna Steak', 25, 15, 18, 11.00, 'medium', 'Seafood'),
  p('45', 'Cod Fillet', 30, 15, 20, 9.00, 'low', 'Seafood'),
  p('46', 'Crab Legs', 15, 10, 12, 18.00, 'low', 'Seafood'),
  p('47', 'Tilapia', 40, 20, 22, 7.00, 'medium', 'Seafood'),

  // Beverages (8)
  p('7', 'Orange Juice', 90, 35, 40, 4.50, 'medium', 'Beverages'),
  p('48', 'Apple Juice', 85, 30, 35, 4.00, 'medium', 'Beverages'),
  p('49', 'Cola', 200, 80, 90, 1.50, 'high', 'Beverages'),
  p('50', 'Sparkling Water', 150, 60, 55, 1.20, 'medium', 'Beverages'),
  p('51', 'Ground Coffee', 60, 25, 30, 8.50, 'high', 'Beverages'),
  p('52', 'Green Tea', 75, 30, 25, 4.00, 'medium', 'Beverages'),
  p('53', 'Energy Drink', 110, 45, 50, 3.00, 'high', 'Beverages'),
  p('54', 'Oat Milk', 55, 25, 30, 4.50, 'medium', 'Beverages'),

  // Snacks (8)
  p('55', 'Potato Chips', 140, 50, 55, 3.50, 'high', 'Snacks'),
  p('56', 'Pretzels', 90, 35, 30, 3.00, 'medium', 'Snacks'),
  p('57', 'Popcorn', 100, 40, 35, 3.50, 'medium', 'Snacks'),
  p('58', 'Crackers', 80, 30, 28, 3.00, 'medium', 'Snacks'),
  p('59', 'Chocolate Cookies', 120, 45, 50, 4.00, 'high', 'Snacks'),
  p('60', 'Granola Bars', 95, 35, 32, 4.50, 'medium', 'Snacks'),
  p('61', 'Mixed Nuts', 60, 25, 22, 6.00, 'medium', 'Snacks'),
  p('62', 'Trail Mix', 70, 30, 28, 5.50, 'medium', 'Snacks'),

  // Frozen (6)
  p('63', 'Ice Cream', 80, 30, 40, 5.00, 'high', 'Frozen'),
  p('64', 'Frozen Pizza', 60, 25, 35, 6.50, 'high', 'Frozen'),
  p('65', 'Frozen Vegetables', 90, 35, 30, 2.50, 'medium', 'Frozen'),
  p('66', 'Frozen Meals', 70, 30, 35, 4.50, 'medium', 'Frozen'),
  p('67', 'Frozen Berries', 55, 20, 25, 4.00, 'medium', 'Frozen'),
  p('68', 'Fish Sticks', 65, 25, 28, 5.00, 'medium', 'Frozen'),

  // Pantry (10)
  p('69', 'Canned Tomatoes', 120, 45, 35, 1.50, 'medium', 'Pantry'),
  p('70', 'Black Beans', 100, 40, 30, 1.20, 'medium', 'Pantry'),
  p('71', 'Spaghetti', 110, 40, 38, 1.80, 'medium', 'Pantry'),
  p('72', 'White Rice', 130, 50, 45, 2.50, 'medium', 'Pantry'),
  p('73', 'Cereal', 95, 35, 40, 4.00, 'high', 'Pantry'),
  p('74', 'Chicken Soup', 85, 30, 28, 2.00, 'medium', 'Pantry'),
  p('75', 'Peanut Butter', 75, 30, 32, 3.50, 'high', 'Pantry'),
  p('76', 'Strawberry Jam', 65, 25, 22, 3.00, 'medium', 'Pantry'),
  p('77', 'Flour', 90, 35, 25, 2.50, 'low', 'Pantry'),
  p('78', 'Sugar', 100, 40, 30, 2.00, 'medium', 'Pantry'),

  // Condiments (8)
  p('79', 'Ketchup', 110, 40, 35, 2.50, 'medium', 'Condiments'),
  p('80', 'Mustard', 80, 30, 25, 2.00, 'low', 'Condiments'),
  p('81', 'Mayonnaise', 75, 30, 28, 3.50, 'medium', 'Condiments'),
  p('82', 'Hot Sauce', 60, 25, 22, 3.00, 'medium', 'Condiments'),
  p('83', 'Soy Sauce', 70, 25, 20, 2.50, 'low', 'Condiments'),
  p('84', 'Olive Oil', 50, 20, 25, 7.00, 'medium', 'Condiments'),
  p('85', 'Balsamic Vinegar', 40, 15, 15, 5.00, 'low', 'Condiments'),
  p('86', 'Ranch Dressing', 85, 30, 32, 3.50, 'medium', 'Condiments'),

  // Health & Household (8)
  p('87', 'Toilet Paper', 150, 60, 55, 8.00, 'high', 'Health & Household'),
  p('88', 'Paper Towels', 120, 50, 45, 6.00, 'high', 'Health & Household'),
  p('89', 'Shampoo', 65, 25, 20, 5.50, 'medium', 'Health & Household'),
  p('90', 'Bar Soap', 80, 30, 25, 1.50, 'medium', 'Health & Household'),
  p('91', 'Toothpaste', 90, 35, 30, 3.50, 'medium', 'Health & Household'),
  p('92', 'Deodorant', 70, 28, 22, 4.50, 'medium', 'Health & Household'),
  p('93', 'Hand Sanitizer', 100, 40, 35, 3.00, 'medium', 'Health & Household'),
  p('94', 'Dish Soap', 85, 35, 30, 3.00, 'medium', 'Health & Household'),

  // Deli (6)
  p('95', 'Sliced Ham', 45, 20, 25, 5.50, 'medium', 'Deli'),
  p('96', 'Deli Turkey', 50, 22, 28, 6.00, 'medium', 'Deli'),
  p('97', 'Salami', 35, 15, 18, 7.00, 'medium', 'Deli'),
  p('98', 'Provolone', 40, 18, 20, 5.00, 'low', 'Deli'),
  p('99', 'Swiss Cheese', 38, 15, 18, 5.50, 'low', 'Deli'),
  p('100', 'Hummus', 55, 25, 30, 4.00, 'medium', 'Deli'),
];
