import { Router } from 'express';
import * as recipeController from './src/controllers/recipeController.js';
import * as myRecipeController from './src/controllers/myRecipeController.js';
import * as dayPlanController from './src/controllers/dayPlanController.js';

const router = Router();

// Home page with the search box
router.get('/', recipeController.showHome);

// Search results, e.g. /search?q=chicken
router.get('/search', recipeController.searchRecipes);

// One recipe with its nutrition, e.g. /recipe/52771
router.get('/recipe/:id', recipeController.showRecipe);

// Download a recipe and its nutrition as a .txt file, e.g. /recipe/52771/export?servings=4
router.get('/recipe/:id/export', recipeController.exportRecipe);

// Edit a recipe's ingredients and see the updated nutrition, e.g. /recipe/52771/edit
router.get('/recipe/:id/edit', recipeController.showEditForm);
router.post('/recipe/:id/edit', recipeController.updateIngredients);

// Type in your own recipe's ingredients and get its nutrition
router.get('/my-recipe', myRecipeController.showMyRecipeForm);
router.post('/my-recipe', myRecipeController.calculateMyRecipe);
router.post('/my-recipe/export', myRecipeController.exportMyRecipe);

// Plan a day of up to 4 recipes. The page's script gets the nutrition from the address
// below, e.g. /api/day-nutrition?recipes=52771:4,52854:2 (recipe id : servings)
router.get('/my-day', dayPlanController.showDayPlan);
router.get('/api/day-nutrition', dayPlanController.getDayNutrition);

export default router;
