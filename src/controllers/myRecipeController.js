import { getNutritionForFormIngredients } from '../models/recipeNutritionModel.js';
import { DEFAULT_SERVINGS, MAX_INGREDIENTS, cleanText, parseServings, readIngredientsFromForm } from '../utils/formInput.js';

// Show the My Recipe page: a blank ingredient form, plus nutrition once something's been submitted
function renderMyRecipePage(res, { recipeName = '', ingredients = [], nutrition = null, servings = DEFAULT_SERVINGS, submitted = false }) {
  res.render('my-recipe', {
    title: recipeName ? `My Recipe: ${recipeName}` : 'My Recipe',
    recipeName,
    ingredients,
    nutrition,
    servings,
    submitted,
    maxIngredients: MAX_INGREDIENTS,
  });
}

// Show an empty form to type in your own recipe (GET /my-recipe)
export function showMyRecipeForm(req, res) {
  renderMyRecipePage(res, { servings: parseServings(req.query.servings) });
}

// Get the nutrition for the ingredients the person typed in (POST /my-recipe)
export async function calculateMyRecipe(req, res) {
  const ingredients = readIngredientsFromForm(req.body);
  const nutrition = await getNutritionForFormIngredients(ingredients);

  renderMyRecipePage(res, {
    recipeName: cleanText(req.body.recipeName, 80),
    ingredients,
    nutrition,
    servings: parseServings(req.body.servings),
    submitted: true,
  });
}
