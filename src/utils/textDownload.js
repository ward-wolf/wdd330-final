// Helpers for sending a page's content as a .txt file to download (recipe page and My Recipe page)

// Turn a recipe name into a file name, e.g. "Spicy Arrabiata Penne" → "spicy-arrabiata-penne"
export function toFileName(name, fallback) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

// Build a text template (like recipe-export.ejs) and send it as a download named fileName.txt.
// The text is built first, so if something goes wrong the error page shows normally
// instead of being downloaded as the .txt file.
export function sendTextDownload(res, next, view, data, fileName) {
  const exportedOn = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  res.render(view, { ...data, exportedOn }, (err, text) => {
    if (err) {
      return next(err);
    }
    res.attachment(`${fileName}.txt`); // tells the browser to download it instead of showing it
    res.type('text/plain; charset=utf-8');
    res.send(text);
  });
}
