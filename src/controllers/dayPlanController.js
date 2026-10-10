import { getDayPlanNutrition } from '../models/dayPlanModel.js';
import { parseServings } from '../utils/formInput.js';

// Most recipes in one day (the browser script in public/js/dayPlanStorage.js uses the same limit)
const MAX_DAY_RECIPES = 4;

// Show the My Day page. The recipes are kept in the browser (localStorage), so the page's
// script (public/js/my-day.js) fills in the list and nutrition (GET /my-day)
export function showDayPlan(req, res) {
  res.render('my-day', { title: 'My Day', maxRecipes: MAX_DAY_RECIPES });
}

// Read a day plan from the address, e.g. "52771:4,52854:2" → [{ id: '52771', servings: 4 }, ...].
// Skips anything that isn't a recipe id, repeats, and anything past the limit.
function readDayPlanParam(text) {
  const plan = [];
  for (const part of String(text || '').split(',')) {
    const [id, servings] = part.split(':');
    if (/^\d{1,10}$/.test(id) && !plan.some((entry) => entry.id === id)) {
      plan.push({ id, servings: parseServings(servings) });
    }
  }
  return plan.slice(0, MAX_DAY_RECIPES);
}

// Send back the nutrition for a day plan as data (JSON) for the My Day page's script to show.
// Looks up one serving of each recipe and adds them together (GET /api/day-nutrition?recipes=52771:4,52854:2)
export async function getDayNutrition(req, res) {
  const plan = readDayPlanParam(req.query.recipes);
  res.json(await getDayPlanNutrition(plan));
}
