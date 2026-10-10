import * as mealModel from '../models/mealModel.js';
import { getRecipeNutrition } from '../models/recipeNutritionModel.js';

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
  res.render('recipe', { title: recipe.name, recipe, nutrition });
}
