// Adds a blank ingredient row to the edit form when "Add ingredient" is selected

const ingredientList = document.querySelector('#ingredient-list');
const addButton = document.querySelector('#add-ingredient');
const rowTemplate = document.querySelector('#ingredient-row-template');

// Copy the blank row template, give it the next unused number, and put the cursor in it
function addIngredientRow() {
  const index = Number(ingredientList.dataset.nextIndex);
  const row = rowTemplate.content.firstElementChild.cloneNode(true);

  row.querySelectorAll('input').forEach((input) => {
    input.name = input.name.replace('__INDEX__', index);
  });

  ingredientList.append(row);
  ingredientList.dataset.nextIndex = index + 1;
  row.querySelector('input').focus();

  // Stop adding rows once the list reaches the limit (plus the blank row)
  if (ingredientList.children.length > Number(ingredientList.dataset.max)) {
    addButton.disabled = true;
  }
}

// The button is hidden in the HTML and only shown here, so it never appears if this script can't run
if (ingredientList && addButton && rowTemplate) {
  addButton.hidden = false;
  addButton.addEventListener('click', addIngredientRow);
}
