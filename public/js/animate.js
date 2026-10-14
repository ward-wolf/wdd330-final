// Plays a CSS animation (like .fade-in or .pulse in styles.css) on an element, starting it over
// if it has played before. A browser only plays an animation once per class, so the class is
// removed and added back to make it play again.
export function playAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // makes the browser notice the class is gone before it's added again
  element.classList.add(className);
}
