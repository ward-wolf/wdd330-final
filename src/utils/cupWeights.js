// How many grams one US cup of common ingredients weighs.
// API Ninjas counts every cup as 250 g (the weight of water), which is fine for milk or stock
// but far too much for light foods: a cup of flour is 125 g and a cup of spinach is 30 g.
// Anything not on this list is left for API Ninjas to work out as before.
//
// Order matters: the first match wins, so specific names ("peanut butter", "brown sugar")
// come before general ones ("butter", "sugar").
//
// Rice, lentils, pasta and other grains use their uncooked weight here. measureNormalizer.js
// then turns that into a cooked weight using cookedYields.js.

export const CUP_WEIGHTS = [
  // Grains: already-cooked amounts first, then uncooked
  { pattern: /\bcooked\b.*\brice\b/, grams: 160 },
  { pattern: /\bcooked\b.*\blentils?\b/, grams: 198 },
  { pattern: /\bcooked\b.*\b(pasta|macaroni|penne)\b/, grams: 140 },
  { pattern: /\brice\b(?!.*\b(flour|vinegar|noodles?|wine|paper|milk|cakes?)\b)/, grams: 185 },
  { pattern: /\b(lentils?|split peas)\b/, grams: 192 },
  { pattern: /\bquinoa\b/, grams: 170 },
  { pattern: /\bcouscous\b/, grams: 173 },
  { pattern: /\bbulgur\b/, grams: 140 },
  { pattern: /\bbarley\b/, grams: 200 },
  { pattern: /\b(pasta|macaroni|penne)\b/, grams: 105 },

  // Flours and powders
  { pattern: /\b(almond flour|ground almonds)\b/, grams: 96 },
  { pattern: /\b(cornflour|corn flour|cornstarch|corn starch)\b/, grams: 128 },
  { pattern: /\b(cornmeal|polenta)\b/, grams: 150 },
  { pattern: /\brice flour\b/, grams: 160 },
  { pattern: /\bcocoa\b/, grams: 85 },
  { pattern: /\bflour\b/, grams: 125 },
  { pattern: /\bpanko\b/, grams: 50 },
  { pattern: /\b(breadcrumbs|bread crumbs)\b/, grams: 110 },
  { pattern: /\b(rolled oats|porridge oats|oats)\b/, grams: 90 },

  // Sugars and syrups
  { pattern: /\b(icing|powdered|confectioners'?) sugar\b/, grams: 120 },
  { pattern: /\bbrown sugar\b/, grams: 213 },
  { pattern: /\bsugar\b/, grams: 200 },
  { pattern: /\b(honey|molasses|golden syrup|treacle|maple syrup|corn syrup)\b/, grams: 330 },

  // Fats
  { pattern: /\bpeanut butter\b/, grams: 258 },
  { pattern: /\b(butter|margarine|shortening|lard)\b/, grams: 227 },
  { pattern: /\boil\b/, grams: 218 },

  // Cheese (grated, shredded or crumbled)
  { pattern: /\bcream cheese\b/, grams: 232 },
  { pattern: /\b(cottage cheese|ricotta)\b/, grams: 240 },
  { pattern: /\bfeta\b/, grams: 150 },
  { pattern: /\b(parmesan|parmigiano|pecorino)\b/, grams: 100 },
  { pattern: /\b(cheese|cheddar|mozzarella|gruyere|monterey jack)\b/, grams: 113 },

  // Nuts, dried fruit and baking extras
  { pattern: /\bpine nuts\b/, grams: 135 },
  { pattern: /\bpeanuts?\b/, grams: 146 },
  { pattern: /\balmonds?\b/, grams: 143 },
  { pattern: /\b(walnuts?|pecans?)\b/, grams: 110 },
  { pattern: /\b(cashews?|hazelnuts?|nuts)\b/, grams: 130 },
  { pattern: /\bchocolate chips\b/, grams: 170 },
  { pattern: /\b(raisins|sultanas|currants)\b/, grams: 150 },
  { pattern: /\bdried cranberries\b/, grams: 120 },
  { pattern: /\bcoconut\b(?! (milk|cream|oil|water))/, grams: 85 },
  { pattern: /\bmarshmallows\b/, grams: 50 },

  // Vegetables and herbs (chopped, sliced or loosely packed)
  { pattern: /\b(spinach|kale|lettuce|rocket|arugula|watercress)\b/, grams: 30 },
  { pattern: /\b(cilantro|coriander|parsley|basil|mint|dill)\b/, grams: 20 },
  { pattern: /\bbean sprouts\b/, grams: 104 },
  { pattern: /\bmushrooms?\b/, grams: 70 },
  { pattern: /\b(spring onions?|scallions?|green onions?)\b/, grams: 100 },
  { pattern: /\bonions?\b/, grams: 160 },
  { pattern: /\b(peas|sweetcorn|corn)\b/, grams: 145 },
  { pattern: /\bcherry tomato(es)?\b/, grams: 150 },
  { pattern: /\btomato(es)?\b/, grams: 180 },
  { pattern: /\b(bell|red|green|yellow) peppers?\b/, grams: 150 },
  { pattern: /\bcarrots?\b/, grams: 128 },
  { pattern: /\bcelery\b/, grams: 101 },
  { pattern: /\bcabbage\b/, grams: 89 },
  { pattern: /\bpotato(es)?\b/, grams: 150 },
  { pattern: /\b(green beans|broad beans)\b/, grams: 125 },
];

// Find the cup weight for an ingredient. The text can include words from the amount,
// like "cooked rice" or "packed brown sugar". Gives null if it isn't on the list.
// Liquids weigh about 250 g a cup, which API Ninjas already gets right. Checking for them first
// stops names like "almond milk" or "tomato sauce" from matching "almonds" or "tomatoes".
const LIQUIDS = /\b(milk|water|stock|broth|juice|sauce|wine|vinegar|yogh?urt)\b/;

export function findCupWeight(text) {
  const lower = text.toLowerCase();
  if (LIQUIDS.test(lower)) {
    return null;
  }
  return CUP_WEIGHTS.find(({ pattern }) => pattern.test(lower)) || null;
}
