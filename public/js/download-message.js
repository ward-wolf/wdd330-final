// Shows a short message when a "Download as .txt" button is used, since the page itself doesn't change.
// Browsers don't tell a page when a download finishes (or if the person cancels saving it),
// so the message only says the download has started and where to look for it.

import { playAnimation } from './animate.js';

// Turn a recipe name into a file name, the same way the server does (src/utils/textDownload.js)
function toFileName(name, fallback) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

// Each download button says where its message goes (data-download-message) and what the file is called:
// data-file-name, or on My Recipe, data-file-name-input names the form box the name comes from
document.querySelectorAll('[data-download-message]').forEach((button) => {
  button.addEventListener('click', () => {
    const status = document.getElementById(button.dataset.downloadMessage);
    if (!status) {
      return;
    }
    const nameInput = button.form?.elements[button.dataset.fileNameInput];
    const fileName = nameInput ? toFileName(nameInput.value, button.dataset.fileName) : button.dataset.fileName;
    status.textContent = `Downloading ${fileName}.txt. Check your browser's downloads.`;
    playAnimation(status, 'fade-in');
  });
});
