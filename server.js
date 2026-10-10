import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Build pages from the EJS files in src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Send files from public/ (CSS, images, browser JS)
app.use(express.static(path.join(__dirname, 'public')));

// Read submitted forms (like the edit ingredients form) into req.body
app.use(express.urlencoded({ extended: true }));

// Send each web address to the right controller (see routes.js)
app.use('/', routes);

// Show the 404 page when no route matches the address
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found' });
});

// Show the error page when something breaks and log the details
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', { title: 'Server Error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Recipe Wizards running at http://localhost:${PORT}`);
});
