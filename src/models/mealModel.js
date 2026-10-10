// Gets recipes from TheMealDB (https://www.themealdb.com/api.php)

const BASE_URL = `https://www.themealdb.com/api/json/v1/${process.env.MEALDB_API_KEY || '1'}`;

// Fetch a TheMealDB address and return the data, or throw an error if the request fails
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TheMealDB request failed (${response.status})`);
  }
  return response.json();
}

// Gather a recipe's ingredients into one list, e.g. [{ name: 'Penne', measure: '1 pound' }].
// TheMealDB stores them in 20 separate numbered fields, and unused ones are blank.
function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim() || '';
    if (name) {
      ingredients.push({ name, measure });
    }
  }
  return ingredients;
}

// Clean up a recipe from TheMealDB, keeping only the needed parts (or may be used in the future)
function formatMeal(meal) {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions,
    thumbnail: meal.strMealThumb,
    youtube: meal.strYoutube,
    source: meal.strSource,
    ingredients: extractIngredients(meal),
  };
}

// Find recipes whose name matches the search words
export async function searchByName(term) {
  const data = await getJson(`${BASE_URL}/search.php?s=${encodeURIComponent(term)}`);
  return (data.meals || []).map(formatMeal);
}

// Get one recipe by its id (null if there's no recipe with that id)
export async function getById(id) {
  const data = await getJson(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
  return data.meals ? formatMeal(data.meals[0]) : null;
}
