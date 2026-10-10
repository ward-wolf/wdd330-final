// Helpers for reading what people type into the ingredient forms (edit page and My Recipe page)

// TheMealDB doesn't say how many servings a recipe makes, so start with this and let people change it
export const DEFAULT_SERVINGS = 4;

// Most ingredients allowed on a form (each one is a separate API Ninjas lookup)
export const MAX_INGREDIENTS = 40;

// Read the servings number from the address or form, using the default if it's missing or not a whole number from 1 to 50
export function parseServings(value) {
  const servings = Number(value);
  return Number.isInteger(servings) && servings >= 1 && servings <= 50 ? servings : DEFAULT_SERVINGS;
}

// Trim a form value and cut it to a sensible length
export function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

// Turn the submitted form rows into a clean ingredient list, dropping removed and blank rows.
// The form names fields like ingredients[0][name], which arrive as a list (or an object, for long lists).
export function readIngredientsFromForm(body) {
  return Object.values(body.ingredients || {})
    .filter((row) => row && !row.remove && cleanText(row.name, 80))
    .slice(0, MAX_INGREDIENTS)
    .map((row) => ({
      quantity: cleanText(row.quantity, 20),
      unit: cleanText(row.unit, 40),
      name: cleanText(row.name, 80),
    }));
}
