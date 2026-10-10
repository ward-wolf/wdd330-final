import * as mealModel from '../models/mealModel.js';
import { getRecipeNutrition, getNutritionForFormIngredients } from '../models/recipeNutritionModel.js';
import { splitMeasure } from '../utils/measureNormalizer.js';
import { MAX_INGREDIENTS, parseServings, readIngredientsFromForm } from '../utils/formInput.js';

// Show the home page with the search box (GET /)
export function showHome(req, res) {
  res.render('index', { title: 'Home' });
}

// Search for recipes by name and show the matches (GET /search?q=chicken)
export async function searchRecipes(req, res) {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.redirect('/'); // empty search, go back home
  }

  const recipes = await mealModel.searchByName(query);
  res.render('results', { title: `Results for "${query}"`, query, recipes });
}

// Show one recipe with its nutrition totals (GET /recipe/52771)
export async function showRecipe(req, res, next) {
  const recipe = await mealModel.getById(req.params.id);
  if (!recipe) {
    return next(); // no recipe with that id, show the 404 page
  }

  const nutrition = await getRecipeNutrition(recipe);
  const servings = parseServings(req.query.servings);
  res.render('recipe', { title: recipe.name, recipe, nutrition, servings });
}

// Look up nutrition for the edit form's ingredients and show the edit page
async function renderEditPage(res, recipe, ingredients, servings) {
  const nutrition = await getNutritionForFormIngredients(ingredients);

  res.render('edit', {
    title: `Edit ingredients: ${recipe.name}`,
    recipe,
    ingredients,
    nutrition,
    servings,
    maxIngredients: MAX_INGREDIENTS,
  });
}

// Show the edit form filled in with the recipe's original ingredients (GET /recipe/52771/edit)
export async function showEditForm(req, res, next) {
  const recipe = await mealModel.getById(req.params.id);
  if (!recipe) {
    return next(); // no recipe with that id, show the 404 page
  }

  const ingredients = recipe.ingredients.map((i) => ({ ...splitMeasure(i.measure), name: i.name }));
  await renderEditPage(res, recipe, ingredients, parseServings(req.query.servings));
}

// Recalculate nutrition using the person's edited ingredients (POST /recipe/52771/edit)
export async function updateIngredients(req, res, next) {
  const recipe = await mealModel.getById(req.params.id);
  if (!recipe) {
    return next(); // no recipe with that id, show the 404 page
  }

  const ingredients = readIngredientsFromForm(req.body);
  await renderEditPage(res, recipe, ingredients, parseServings(req.body.servings));
}
