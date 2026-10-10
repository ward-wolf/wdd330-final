// How much heavier grains and pasta get once cooked.
// API Ninjas only has nutrition data for these foods cooked (rice comes back as 127 kcal per 100 g,
// while uncooked rice is about 365), but recipes almost always give the uncooked amount.
// So an uncooked amount is multiplied by its factor to get the cooked weight to look up:
// 200 g of uncooked rice ≈ 580 g cooked.
//
// The factors are worked out from calories (uncooked ÷ cooked per 100 g), so the totals
// match the uncooked food even where the real cooked weight varies a bit.
//
// Order matters: the first match wins, so "brown rice" and "rice noodles" come before "rice".

export const COOKED_YIELDS = [
  { pattern: /\bbrown rice\b/, factor: 3.4 },
  { pattern: /\b(rice noodles?|rice sticks?|rice stick noodles|rice vermicelli|vermicelli rice noodles)\b/, factor: 3.3 },
  { pattern: /\brice\b/, factor: 2.9 },
  { pattern: /\b(lentils?|split peas)\b/, factor: 3 },
  { pattern: /\bcouscous\b/, factor: 3.3 },
  { pattern: /\bquinoa\b/, factor: 3 },
  { pattern: /\bbulgur\b/, factor: 4.1 },
  { pattern: /\bbarley\b/, factor: 2.9 },
  // Lasagne is often counted in sheets ("10 lasagne sheets"), so it also has a weight per sheet
  { pattern: /\blasagn[ae] (sheets|noodles)\b/, factor: 2.35, gramsEach: 20 },
  { pattern: /\b(egg noodles|noodles?)\b/, factor: 2.8 },
  { pattern: /\b(pasta|spaghetti|penne|macaroni|linguine|fettuccine|tagliatelle|pappardelle|lasagne|lasagna|rigatoni|fusilli|farfalle|paccheri|orzo|vermicelli|conchiglie)\b/, factor: 2.35 },
];

// Foods with these words aren't uncooked grains, even though they contain "rice" or "noodles"
// (udon is usually sold fresh, already cooked)
const NOT_UNCOOKED_GRAIN = /\b(flour|vinegar|wine|paper|milk|cakes?|krispies|pancakes|pudding|sauce|udon)\b/;

// Amounts that are already cooked
const ALREADY_COOKED = /\b(cooked|boiled|steamed|leftover)\b/;

// Find the cooked factor for an ingredient. The text should include the amount and the name,
// e.g. "200g basmati rice", so "1 cup cooked rice" is recognized as already cooked.
// Gives null if the food isn't on the list or is already cooked.
export function findCookedYield(text) {
  const lower = text.toLowerCase();
  if (NOT_UNCOOKED_GRAIN.test(lower) || ALREADY_COOKED.test(lower)) {
    return null;
  }
  return COOKED_YIELDS.find(({ pattern }) => pattern.test(lower)) || null;
}
