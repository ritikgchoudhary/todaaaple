import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SLOT_JSON_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'slot.json');
// Path served at /data/slot.json (express.static build dir) – write here too so edits show immediately
const BUILD_SLOT_JSON_PATH = path.join(__dirname, '..', '..', 'frontend', 'build', 'data', 'slot.json');

function getSlotJsonPath() {
  return process.env.SLOT_JSON_PATH || DEFAULT_SLOT_JSON_PATH;
}

/** Normalize API format (game_code, game_name, game_img) to app format (id, key, name, charImageUrl) */
function normalizeGame(g, index) {
  if (!g || typeof g !== 'object') return null;
  const hasApiFormat = 'game_code' in g || 'gameID' in g;
  if (hasApiFormat) {
    const code = String(g.game_code ?? g.gameID ?? index + 1);
    const name = g.game_name ?? g.gameNameEn ?? g.name ?? 'Game ' + code;
    const img = g.game_img ?? g.img ?? g.charImageUrl ?? '';
    const slug = (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return {
      id: g.id ?? `slot-${code}`,
      key: g.key ?? (slug || `game-${code}`),
      name,
      category: (g.category || 'slot').toLowerCase(),
      type: g.type || 'grid',
      provider: g.provider || 'JDB',
      softapiGameUid: code,
      charImageUrl: img,
      logoUrl: g.logoUrl ?? g.imgUrl2 ?? '',
    };
  }
  return {
    id: g.id ?? `slot-${index + 1}`,
    key: g.key ?? ((g.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'game'),
    name: g.name ?? '',
    category: (g.category || 'slot').toLowerCase(),
    type: g.type || 'grid',
    provider: g.provider ?? '',
    softapiGameUid: g.softapiGameUid ?? g.game_code ?? g.gameID ?? g.key,
    charImageUrl: g.charImageUrl ?? g.game_img ?? g.img ?? '',
    logoUrl: g.logoUrl ?? '',
  };
}

function readSlotJson() {
  try {
    const filePath = getSlotJsonPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      const rawGames = Array.isArray(data.games) ? data.games : [];
      return { games: rawGames };
    }
  } catch (e) {
    console.error('slots readSlotJson', e);
  }
  return { games: [] };
}

function writeSlotJson(data) {
  const payload = { games: Array.isArray(data.games) ? data.games : [] };
  const json = JSON.stringify(payload, null, 2);
  const paths = [getSlotJsonPath(), BUILD_SLOT_JSON_PATH];
  for (const filePath of paths) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, json, 'utf8');
    } catch (e) {
      console.error('slots writeSlotJson', filePath, e);
      return false;
    }
  }
  return true;
}

/** GET /admin-api/slots or /admin-api/slots/ or /data/slot.json – returns slot games (read from disk every time, no cache) */
export const getSlots = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('X-Content-Type-Options', 'nosniff');
    const data = readSlotJson();
    const normalized = (data.games || [])
      .map((g, i) => normalizeGame(g, i))
      .filter(Boolean);
    res.status(200).json({ games: normalized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** POST /admin-api/slots or /admin-api/slots/ – replace slot.json with body. No auth required (admin UI only). */
export const postSlots = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const games = Array.isArray(body.games) ? body.games : readSlotJson().games;
    const data = { games };
    if (!writeSlotJson(data)) {
      return res.status(500).json({ error: 'Failed to write slot.json' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** POST /admin-api/slots/add – append one game to the list. Body: name, provider?, softapiGameUid, charImageUrl, logoUrl? */
export const addSlotGame = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const name = (body.name || '').trim();
    const charImageUrl = (body.charImageUrl || body.game_img || body.img || '').trim();
    const softapiGameUid = String(body.softapiGameUid || body.game_code || body.gameID || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const existing = readSlotJson();
    const games = Array.isArray(existing.games) ? existing.games : [];
    const nextIndex = games.length + 1;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `game-${nextIndex}`;
    const key = (body.key || slug).trim() || slug;
    const newGame = {
      id: body.id || `slot-${nextIndex}`,
      key,
      name,
      category: (body.category || 'slot').toLowerCase(),
      type: body.type || 'grid',
      provider: (body.provider || 'JDB').trim(),
      softapiGameUid: softapiGameUid || key,
      charImageUrl: charImageUrl || '',
      logoUrl: (body.logoUrl || body.imgUrl2 || '').trim() || '',
    };
    games.push(newGame);
    if (!writeSlotJson({ games })) {
      return res.status(500).json({ error: 'Failed to write slot.json' });
    }
    res.status(200).json({ added: newGame, total: games.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** PUT /admin-api/slots/:id – update one game by id. Body: name?, provider?, softapiGameUid?, charImageUrl?, logoUrl?, key?, category?, type? */
export const updateSlotGame = async (req, res) => {
  try {
    const id = (req.params && req.params.id) ? String(req.params.id).trim() : '';
    if (!id) return res.status(400).json({ error: 'Missing game id' });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const data = readSlotJson();
    const games = Array.isArray(data.games) ? data.games : [];
    const idx = games.findIndex((g) => String(g.id || g.key || '') === id);
    if (idx === -1) return res.status(404).json({ error: 'Game not found' });
    const current = games[idx];
    const name = (body.name !== undefined && body.name !== null) ? String(body.name).trim() : (current.name || '');
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || current.key || `game-${idx + 1}`;
    const updated = {
      id: body.id !== undefined ? body.id : current.id,
      key: (body.key || slug).trim() || slug,
      name: name || current.name,
      category: (body.category || current.category || 'slot').toLowerCase(),
      type: body.type || current.type || 'grid',
      provider: (body.provider !== undefined ? body.provider : current.provider) || 'JDB',
      softapiGameUid: body.softapiGameUid !== undefined ? String(body.softapiGameUid).trim() : (current.softapiGameUid || current.key),
      charImageUrl: body.charImageUrl !== undefined ? String(body.charImageUrl).trim() : (current.charImageUrl || ''),
      logoUrl: body.logoUrl !== undefined ? String(body.logoUrl).trim() : (current.logoUrl || ''),
    };
    games[idx] = updated;
    if (!writeSlotJson({ games })) return res.status(500).json({ error: 'Failed to write slot.json' });
    res.status(200).json({ updated, total: games.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** DELETE /admin-api/slots/:id – remove one game by id */
export const deleteSlotGame = async (req, res) => {
  try {
    const id = (req.params && req.params.id) ? String(req.params.id).trim() : '';
    if (!id) return res.status(400).json({ error: 'Missing game id' });
    const data = readSlotJson();
    let games = Array.isArray(data.games) ? data.games : [];
    const before = games.length;
    games = games.filter((g) => String(g.id || g.key || '') !== id);
    if (games.length === before) return res.status(404).json({ error: 'Game not found' });
    if (!writeSlotJson({ games })) return res.status(500).json({ error: 'Failed to write slot.json' });
    res.status(200).json({ deleted: id, total: games.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
