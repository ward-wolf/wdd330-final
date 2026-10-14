import { getNutritionForFormIngredients } from '../models/recipeNutritionModel.js';
import { DEFAULT_SERVINGS, MAX_INGREDIENTS, cleanText, parseServings, readIngredientsFromForm } from '../utils/formInput.js';
import { sendTextDownload, toFileName } from '../utils/textDownload.js';

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

// Download the typed-in recipe and its nutrition as a text file (POST /my-recipe/export).
// Uses whatever is in the form when the Download button is selected.
export async function exportMyRecipe(req, res, next) {
  const recipeName = cleanText(req.body.recipeName, 80);
  const ingredients = readIngredientsFromForm(req.body);
  const servings = parseServings(req.body.servings);
  const nutrition = await getNutritionForFormIngredients(ingredients);

  // Nothing to download, so show the page again with its "add an ingredient" message
  if (!nutrition) {
    return renderMyRecipePage(res, { recipeName, ingredients, nutrition, servings, submitted: true });
  }

  const data = { title: recipeName || 'My Recipe', nutrition, servings };
  sendTextDownload(res, next, 'recipe-export', data, toFileName(recipeName, 'my-recipe'));
}
