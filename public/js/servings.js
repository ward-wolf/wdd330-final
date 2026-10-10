// Updates the "Per serving" column on the recipe page when the number of servings changes

const servingsInput = document.querySelector('#servings');
const perServingCells = document.querySelectorAll('[data-total]');

// Divide each whole-recipe total by the servings and show it, rounded to one decimal place
function updatePerServing() {
  const servings = Number(servingsInput.value);
  if (!Number.isInteger(servings) || servings < 1 || servings > 50) {
    return; // leave the old numbers while the box is empty or invalid
  }

  perServingCells.forEach((cell) => {
    const perServing = Math.round((Number(cell.dataset.total) / servings) * 10) / 10;
    cell.textContent = `${perServing} ${cell.dataset.unit}`;
  });

  // Keep the servings number in links to the recipe and edit pages
  document.querySelectorAll('[data-servings-link]').forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set('servings', servings);
    link.href = url;
  });
}

if (servingsInput) {
  servingsInput.addEventListener('input', updatePerServing);
}
