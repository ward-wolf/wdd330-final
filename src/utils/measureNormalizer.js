// Turns vague amounts like "pinch", "knob" or "1 tin" into grams before the nutrition lookup.
// API Ninjas guesses 100 g for any amount it doesn't understand,
// so without this some amounts are really, really wrong, which messes up the whole total

// Amounts you can't sensibly guess (like garnishes), so they're left out of the totals
const SKIP_PATTERNS = [
  { pattern: /\bto serve\b/, reason: 'serving suggestion' },
  { pattern: /\b(garnish|topping|top)\b/, reason: 'garnish' },
  { pattern: /\bto glaze\b/, reason: 'glaze' },
  { pattern: /\bas required\b/, reason: 'amount not given' },
];

// List of common vague amounts with how many grams one of each vague amount is.
// Order matters: "large handful" must come before "handful", and "small bunch" before "bunch".
// There are probably more of these, but these came up the most.
const UNIT_GRAMS = [
  { pattern: /\bto taste\b/, grams: 1, label: 'to taste' },
  { pattern: /\bpinch(es)?\b/, grams: 0.5, label: 'pinch' },
  { pattern: /\bdash(es)?\b/, grams: 1, label: 'dash' },
  { pattern: /\bdusting\b/, grams: 3, label: 'dusting' },
  { pattern: /\bgrating\b/, grams: 3, label: 'grating' },
  { pattern: /\b(sprinkling|sprinking|spinkling)\b/, grams: 5, label: 'sprinkling' },
  { pattern: /\bdrizzle\b/, grams: 10, label: 'drizzle' },
  { pattern: /\bsplash(es)?\b/, grams: 15, label: 'splash' },
  { pattern: /\bknobs?\b/, grams: 15, label: 'knob' },
  { pattern: /\bthumb\b/, grams: 15, label: 'thumb-sized piece' },
  { pattern: /\bfor (frying|brushing|greasing)\b/, grams: 15, label: 'cooking oil (about 1 tbsp)' },
  { pattern: /\blarge handfuls?\b/, grams: 50, label: 'large handful' },
  { pattern: /\bhandfu(l|ll)s?\b/, grams: 30, label: 'handful' },
  { pattern: /\bsmall bunch(es)?\b/, grams: 15, label: 'small bunch' },
  { pattern: /\bbunch(es)?\b/, grams: 25, label: 'bunch' },
  { pattern: /\b(can|cans|tin|tins)\b/, grams: 400, label: 'can' },
];

// Ingredient names API Ninjas mistakes for a different food, and what to send instead
// (e.g. "Chilli" comes back as a 480 g bowl of chilli con carne)
// There are probably more of these, but this is what was found in testing
const NAME_ALIASES = {
  'chilli': 'chili pepper',
  'red chilli': 'red chili pepper',
  'green chilli': 'green chili pepper',
  'coriander': 'fresh coriander',
};

// Swap in a better name if the ingredient is on the list above
export function normalizeName(name) {
  return NAME_ALIASES[name.trim().toLowerCase()] || name;
}

// Standardize fractions to fix error with how API read fractions
const UNICODE_FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

// Read the number at the start of an amount, like "2", "1/2", "1 1/2", "1½" or "half".
// Gives 1 if there's no number, since "pinch" means one pinch.
export function parseQuantity(measure) {
  const text = measure.trim().toLowerCase();
  if (/^half\b/.test(text)) return 0.5;

  let match;
  // "1 1/2"
  if ((match = text.match(/^(\d+)\s+(\d+)\/(\d+)/))) {
    return Number(match[1]) + Number(match[2]) / Number(match[3]);
  }
  // "1/2"
  if ((match = text.match(/^(\d+)\/(\d+)/))) {
    return Number(match[1]) / Number(match[2]);
  }
  // "½" or "1½"
  if ((match = text.match(/^(\d+)?\s*([½¼¾⅓⅔⅛])/))) {
    return Number(match[1] || 0) + UNICODE_FRACTIONS[match[2]];
  }
  // "2" or "1.5"
  if ((match = text.match(/^\d+(\.\d+)?/))) {
    return parseFloat(match[0]);
  }
  return 1;
}

// Round to one decimal place
function round(value) {
  return Math.round(value * 10) / 10;
}

// Decide what to send to API Ninjas for one ingredient, plus a note about any guess made.
// Returns { query, note, skip, estimated }.
export function normalizeMeasure(measure, originalName) {
  const text = measure.trim().toLowerCase();
  const name = normalizeName(originalName);

  for (const { pattern, reason } of SKIP_PATTERNS) {
    if (pattern.test(text)) {
      return { query: null, skip: true, note: `Not counted (${reason})` };
    }
  }

  // Another issue was use of the terms juice and zest
  // Reword juice and zest, because API Ninjas reads "juice of 1 lemon" as two foods
  // but understands "1 lemon, juiced"
  if (/\b(juice|zest)\b/.test(text)) {
    const quantity = /\bhalf\b/.test(text) ? 0.5 : parseQuantity(text.replace(/^\D+/, ''));
    const query = /\bjuice\b/.test(text) ? `${quantity} ${name}, juiced` : `${quantity} ${name} zest`;
    return { query, note: '' };
  }

  for (const { pattern, grams, label } of UNIT_GRAMS) {
    if (pattern.test(text)) {
      const total = round(parseQuantity(text) * grams);
      return { query: `${total}g ${name}`, note: `${label} ≈ ${grams} g` };
    }
  }

  // There are more potential unknowns than can be found so need to note that if
  // No amount given (blank, "chopped", "sliced"...), API Ninjas will guess 100 g
  if (!/[\d½¼¾⅓⅔⅛]/.test(text)) {
    return { query: name, estimated: true, note: 'No amount given, assumes 100 g' };
  }

  // A normal amount like "1 cup" or "200g", no adjustment needed
  return { query: `${measure} ${name}`.trim(), note: '' };
}
