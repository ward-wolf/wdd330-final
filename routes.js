import { Router } from 'express';
import * as recipeController from './src/controllers/recipeController.js';

const router = Router();

// Home page with the search box
router.get('/', recipeController.showHome);

// Search results, e.g. /search?q=chicken
router.get('/search', recipeController.searchRecipes);

// One recipe with its nutrition, e.g. /recipe/52771
router.get('/recipe/:id', recipeController.showRecipe);

export default router;
