// Gets nutrition info from API Ninjas (https://api-ninjas.com/api/nutrition)

const BASE_URL = 'https://api.api-ninjas.com/v1/nutrition';

// The nutrients picked to show on the page, with their display names and units
export const NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'fat_total_g', label: 'Total Fat', unit: 'g' },
  { key: 'fat_saturated_g', label: 'Saturated Fat', unit: 'g' },
  { key: 'cholesterol_mg', label: 'Cholesterol', unit: 'mg' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
  { key: 'carbohydrates_total_g', label: 'Carbohydrates', unit: 'g' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sugar_g', label: 'Sugar', unit: 'g' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
];

// Get nutrition info (list) for a food written in plain words, like "1 cup flour".
export async function getNutrition(query) {
  const apiKey = process.env.NINJAS_API_KEY;
  if (!apiKey) {
    throw new Error('NINJAS_API_KEY is missing from .env');
  }

  const response = await fetch(`${BASE_URL}?query=${encodeURIComponent(query)}`, {
    headers: { 'X-Api-Key': apiKey },
  });
  if (!response.ok) {
    throw new Error(`API Ninjas request failed (${response.status})`);
  }
  return response.json();
}
