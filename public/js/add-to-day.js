// The "Add to my day" button on the recipe page

import { MAX_DAY_RECIPES, cleanServings, loadDayPlan, saveDayPlan } from './dayPlanStorage.js';

const dayActions = document.querySelector('#day-actions');
const addButton = document.querySelector('#add-to-day');
const message = document.querySelector('#day-message');
const servingsInput = document.querySelector('#servings');
const recipeId = dayActions?.dataset.recipeId;

// Set the button for where this recipe stands: not added yet, already in the day, or the day is full
function showButtonState() {
  const plan = loadDayPlan();
  const inDay = plan.some((entry) => entry.id === recipeId);
  const dayFull = !inDay && plan.length >= MAX_DAY_RECIPES;

  addButton.textContent = inDay ? 'Update servings in my day' : 'Add to my day';
  addButton.disabled = dayFull;
  if (dayFull) {
    message.textContent = `Your day already has ${MAX_DAY_RECIPES} recipes. Remove one to add this.`;
  }
}

// Add this recipe with the number from the Servings box, or update its servings if it's already there
function addToDay() {
  const plan = loadDayPlan();
  const servings = cleanServings(servingsInput?.value);
  const existing = plan.find((entry) => entry.id === recipeId);

  if (existing) {
    existing.servings = servings;
    message.textContent = `Updated: ${servings} servings.`;
  } else if (plan.length < MAX_DAY_RECIPES) {
    plan.push({ id: recipeId, servings });
    message.textContent = `Added to your day (${plan.length} of ${MAX_DAY_RECIPES}).`;
  }

  saveDayPlan(plan);
  showButtonState();
}

if (dayActions && addButton && recipeId) {
  dayActions.hidden = false;
  showButtonState();
  addButton.addEventListener('click', addToDay);
}
