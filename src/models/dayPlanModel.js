// Works out the nutrition for a day plan: one serving of each recipe, added together

import * as mealModel from './mealModel.js';
import { getRecipeNutrition } from './recipeNutritionModel.js';
import { NUTRIENTS } from './nutritionModel.js';

// Round to one decimal place
function round(value) {
  return Math.round(value * 10) / 10;
}

// Get one serving's nutrition for a recipe in the plan. Gives null if the recipe can't be found.
async function getServingNutrition({ id, servings }) {
  const recipe = await mealModel.getById(id);
  if (!recipe) {
    return null;
  }

  const nutrition = await getRecipeNutrition(recipe);
  const perServing = {};
  for (const { key } of NUTRIENTS) {
    const total = nutrition.totals[key];
    perServing[key] = total === null ? null : total / servings;
  }
  return { id, name: recipe.name, thumbnail: recipe.thumbnail, servings, perServing };
}

// Get the nutrition for every recipe in the plan and add up one serving of each for the day.
// A nutrient shows null (N/A) only if none of the recipes had data for it.
export async function getDayPlanNutrition(plan) {
  const results = await Promise.all(plan.map(getServingNutrition));
  const recipes = results.filter(Boolean);

  const totals = {};
  for (const { key } of NUTRIENTS) {
    const values = recipes.map((r) => r.perServing[key]).filter((v) => v !== null);
    totals[key] = values.length ? round(values.reduce((sum, v) => sum + v, 0)) : null;
  }

  // Round each recipe's numbers for display, after the day totals are worked out
  for (const recipe of recipes) {
    for (const { key } of NUTRIENTS) {
      if (recipe.perServing[key] !== null) {
        recipe.perServing[key] = round(recipe.perServing[key]);
      }
    }
  }

  return { nutrients: NUTRIENTS, recipes, totals };
}
