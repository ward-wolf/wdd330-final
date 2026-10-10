// Combines a recipe from TheMealDB with nutrition info from API Ninjas

import { getNutrition, NUTRIENTS } from './nutritionModel.js';
import { normalizeMeasure } from '../utils/measureNormalizer.js';

// Add up each nutrient across all ingredients. Skips if no number.
function sumNutrient(items, key) {
  let total = 0;
  let found = false;
  for (const item of items) {
    if (typeof item[key] === 'number') {
      total += item[key];
      found = true;
    }
  }
  return found ? Math.round(total * 10) / 10 : null;
}

// Add up every nutrient across several foods
function totalsFor(items) {
  const totals = {};
  for (const { key } of NUTRIENTS) {
    totals[key] = sumNutrient(items, key);
  }
  return totals;
}

// Get the nutrition for one ingredient. Each result gets a status for the page:
// ok, estimated (no amount given), skipped (garnish etc.), or not-found.
async function lookupIngredient(ingredient) {
  const { query, note, skip, estimated } = normalizeMeasure(ingredient.measure, ingredient.name);

  if (skip) {
    return { ...ingredient, status: 'skipped', note, nutrition: totalsFor([]) };
  }

  try {
    const items = await getNutrition(query);
    if (items.length === 0) {
      return { ...ingredient, status: 'not-found', note: 'No nutrition data found', nutrition: totalsFor([]) };
    }
    return {
      ...ingredient,
      status: estimated ? 'estimated' : 'ok',
      note,
      nutrition: totalsFor(items),
    };
  } catch (err) {
    // If one ingredient fails, mark it not found so the rest of the recipe still works
    console.error(`Nutrition lookup failed for "${query}":`, err.message);
    return { ...ingredient, status: 'not-found', note: 'Lookup failed', nutrition: totalsFor([]) };
  }
}

// Get the nutrition for a whole recipe: each ingredient plus the totals
export async function getRecipeNutrition(recipe) {
  // Look up all the ingredients at the same time
  const ingredients = await Promise.all(recipe.ingredients.map(lookupIngredient));

  const counted = ingredients.filter((i) => i.status === 'ok' || i.status === 'estimated');
  const namesWith = (status) => ingredients.filter((i) => i.status === status).map((i) => i.name);

  return {
    nutrients: NUTRIENTS,
    ingredients,
    totals: totalsFor(counted.map((i) => i.nutrition)),
    missing: namesWith('not-found'),
    skipped: namesWith('skipped'),
    estimated: namesWith('estimated'),
  };
}
