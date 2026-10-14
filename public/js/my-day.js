// The My Day page: shows the recipes saved in this browser and the nutrition for the whole day

import { MAX_DAY_RECIPES, cleanServings, loadDayPlan, saveDayPlan } from './dayPlanStorage.js';

const status = document.querySelector('#day-status');
const content = document.querySelector('#day-content');
const list = document.querySelector('#day-list');
const totalsBody = document.querySelector('#day-totals');
const recipeCount = document.querySelector('#day-recipe-count');
const clearButton = document.querySelector('#clear-day');
const recipeTemplate = document.querySelector('#day-recipe-template');

// Show a value with its unit, or N/A if there's no number
function formatValue(value, unit) {
  return value === null ? 'N/A' : `${value} ${unit}`;
}

// Ask the server for the nutrition of one serving of each recipe, added up for the day
async function fetchDayNutrition(plan) {
  const recipes = plan.map((entry) => `${entry.id}:${entry.servings}`).join(',');
  const response = await fetch(`/api/day-nutrition?recipes=${encodeURIComponent(recipes)}`);
  if (!response.ok) {
    throw new Error(`Server error (${response.status})`);
  }
  return response.json();
}

// Build one recipe row from the template
function buildRecipeRow(recipe) {
  const row = recipeTemplate.content.firstElementChild.cloneNode(true);

  row.querySelector('img').src = `${recipe.thumbnail}/small`;
  const link = row.querySelector('.day-recipe-name');
  link.textContent = recipe.name;
  link.href = `/recipe/${recipe.id}?servings=${recipe.servings}`;

  const servingsInput = row.querySelector('.day-servings');
  servingsInput.value = recipe.servings;
  servingsInput.setAttribute('aria-label', `Servings for ${recipe.name}`);
  servingsInput.addEventListener('change', () => changeServings(recipe.id, servingsInput.value));

  row.querySelector('.day-recipe-calories').textContent =
    `One serving: ${formatValue(recipe.perServing.calories, 'kcal')}`;

  const removeButton = row.querySelector('.day-remove');
  removeButton.setAttribute('aria-label', `Remove ${recipe.name}`);
  removeButton.addEventListener('click', () => removeRecipe(recipe.id));

  return row;
}

// Fill in the day totals table, one row per nutrient
function showTotals(day) {
  totalsBody.replaceChildren(
    ...day.nutrients.map((nutrient) => {
      const row = document.createElement('tr');
      const label = document.createElement('th');
      label.scope = 'row';
      label.textContent = nutrient.label;
      const value = document.createElement('td');
      value.textContent = formatValue(day.totals[nutrient.key], nutrient.unit);
      row.append(label, value);
      return row;
    })
  );
}

// Load the saved plan, get its nutrition from the server, and show it all
async function showDay() {
  const plan = loadDayPlan();
  if (plan.length === 0) {
    status.classList.remove('is-loading');
    content.hidden = true;
    status.innerHTML = 'Your day is empty. <a href="/">Search for a recipe</a> and select <strong>Add to my day</strong>.';
    return;
  }

  status.textContent = 'Loading your day…';
  status.classList.add('is-loading'); // pulses while waiting (see .is-loading in styles.css)
  try {
    const day = await fetchDayNutrition(plan);

    // Drop any recipe the server couldn't find, so it doesn't stay in the plan
    if (day.recipes.length < plan.length) {
      saveDayPlan(plan.filter((entry) => day.recipes.some((r) => r.id === entry.id)));
    }

    list.replaceChildren(...day.recipes.map(buildRecipeRow));
    showTotals(day);
    recipeCount.textContent = `${day.recipes.length} of ${MAX_DAY_RECIPES} recipes`;
    status.textContent = '';
    content.hidden = false;
  } catch (err) {
    console.error(err);
    status.textContent = 'Sorry, the nutrition for your day couldn\'t be loaded. Please try again.';
  } finally {
    status.classList.remove('is-loading');
  }
}

// Save a new servings number for one recipe and recalculate the day
function changeServings(id, value) {
  const plan = loadDayPlan().map((entry) => (entry.id === id ? { ...entry, servings: cleanServings(value) } : entry));
  saveDayPlan(plan);
  showDay();
}

// Take one recipe out of the day and recalculate
function removeRecipe(id) {
  saveDayPlan(loadDayPlan().filter((entry) => entry.id !== id));
  showDay();
}

clearButton.addEventListener('click', () => {
  saveDayPlan([]);
  showDay();
});

showDay();
