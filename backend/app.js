/**
 * Backend entry. Serves API + React frontend build (so login and all pages use latest build).
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config.env' });

// DB – used for slots/games from GameCatalog when connected
import './db/conn.js';

import homeCategoryRoutes from './router/routes.js';
import { getHomeCategoryGames, postHomeCategoryGames } from './controller/homeCategory.js';
import { getSlots, postSlots, addSlotGame, updateSlotGame, deleteSlotGame } from './controller/slots.js';
import { signin, signup, getUserDataHome } from './controller/user.js';
import { launchGame, gameCallback } from './controller/game.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSP: allow Google Analytics (gtag) connect-src so GA4 is not blocked
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.paynimo.com", "https://www.googletagmanager.com"],
        'connect-src': [
          "'self'",
          'https://img.bzvm68.com',
          'https://ik.imagekit.io',
          'https://cdn.jsdelivr.net',
          'https://www.paynimo.com',
          'https://www.google-analytics.com',
          'https://www.googletagmanager.com',
          'https://*.google-analytics.com',
        ],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://img.bzvm68.com',
          'https://ik.imagekit.io',
          'https://cdn.jsdelivr.net',
          'https://www.paynimo.com',
          'https://igamingapis.com',
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
        ],
        // Allow game URLs to load inside iframe (Sports, /play)
        'frame-src': ["'self'", 'https:', 'blob:'],
      },
    },
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

// Image proxy for external game images (e.g. igamingapis.com) so they load in-page
const PROXY_IMAGE_ORIGINS = ['https://igamingapis.com'];
app.get('/api/proxy-image', async (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl || typeof rawUrl !== 'string') return res.status(400).json({ error: 'Missing url' });
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (_) {
    return res.status(400).json({ error: 'Invalid url' });
  }
  if (!PROXY_IMAGE_ORIGINS.includes(parsed.origin)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const response = await fetch(rawUrl, { headers: { Accept: 'image/*' } });
    if (!response.ok) return res.status(response.status).end();
    const contentType = response.headers.get('content-type') || 'image/png';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    const buf = await response.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch (err) {
    res.status(502).json({ error: 'Proxy error' });
  }
});

// Admin API: home-category-games – direct routes (with and without trailing slash)
app.get('/admin-api/home-category-games', getHomeCategoryGames);
app.get('/admin-api/home-category-games/', getHomeCategoryGames);
app.post('/admin-api/home-category-games', postHomeCategoryGames);
app.post('/admin-api/home-category-games/', postHomeCategoryGames);

// Admin API: slots JSON (edit frontend/public/data/slot.json)
app.get('/admin-api/slots', getSlots);
app.get('/admin-api/slots/', getSlots);
app.post('/admin-api/slots', postSlots);
app.post('/admin-api/slots/', postSlots);
app.post('/admin-api/slots/add', addSlotGame);
app.post('/admin-api/slots/add/', addSlotGame);
app.put('/admin-api/slots/:id', updateSlotGame);
app.put('/admin-api/slots/:id/', updateSlotGame);
app.delete('/admin-api/slots/:id', deleteSlotGame);
app.delete('/admin-api/slots/:id/', deleteSlotGame);

app.use('/admin-api', homeCategoryRoutes);

// Serve /data/slot.json dynamically (no cache) so edits show instantly
app.get('/data/slot.json', getSlots);

// User auth – required for login to work (POST from login form)
app.post('/user/signin', (req, res, next) => signin(req, res, next));
app.post('/user/signin/', (req, res, next) => signin(req, res, next));
app.post('/user/signup', (req, res, next) => signup(req, res, next));
app.post('/user/signup/', (req, res, next) => signup(req, res, next));
app.get('/getUser/:id', getUserDataHome);

// Game launch – POST /game/launch/:id with body { game_uid } or { game_id }
app.post('/game/launch/:id', (req, res, next) => launchGame(req, res, next));
app.post('/api/gameCallback', (req, res, next) => gameCallback(req, res, next));

// So that GET /user/signin/ in browser shows backend is updated (login must use POST)
app.get('/user/signin', (req, res) => res.json({ message: 'Use POST with phone and password to login' }));
app.get('/user/signin/', (req, res) => res.json({ message: 'Use POST with phone and password to login' }));

// Error handler for user controller (ErrorResponse passed to next())
app.use((err, req, res, next) => {
  if (err && err.message) {
    const code = err.statusCode || 500;
    return res.status(code).json({ error: err.message });
  }
  next();
});

// Serve React build (so /login and all frontend routes show latest build)
const buildDir = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildDir));

// SPA fallback: any GET that isn't a file gets index.html (for /login, /, etc.)
app.get('*', (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/admin-api') || req.path.startsWith('/api')) return next();
  res.sendFile(path.join(buildDir, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found' });
  });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});
