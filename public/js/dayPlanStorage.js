// Reads and saves the day plan in this browser's localStorage.
// The plan is a list of recipe ids and servings, like [{ id: '52771', servings: 4 }].

const STORAGE_KEY = 'recipeWizards.myDay';

// Most recipes in one day (the server uses the same limit in dayPlanController.js)
export const MAX_DAY_RECIPES = 4;

// Turn a servings value into a whole number from 1 to 50, or 4 if it isn't one
export function cleanServings(value) {
  const servings = Number(value);
  return Number.isInteger(servings) && servings >= 1 && servings <= 50 ? servings : 4;
}

// Get the saved day plan. Gives an empty list if nothing's saved, or if storage is blocked or broken.
export function loadDayPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved
      .filter((entry) => entry && /^\d{1,10}$/.test(String(entry.id)))
      .map((entry) => ({ id: String(entry.id), servings: cleanServings(entry.servings) }))
      .slice(0, MAX_DAY_RECIPES);
  } catch {
    return [];
  }
}

// Save the day plan and update the "My Day" count in the header
export function saveDayPlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Storage is blocked (e.g. some private browsing modes), so the plan just won't be kept
  }
  showDayCount(plan);
}

// Show how many recipes are in the day in the header link, e.g. "My Day (2)"
export function showDayCount(plan = loadDayPlan()) {
  const link = document.querySelector('#day-count-link');
  if (link) {
    link.textContent = plan.length ? `My Day (${plan.length})` : 'My Day';
  }
}
