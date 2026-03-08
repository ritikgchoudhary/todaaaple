/**
 * Home category games – read/update from Extra model (MongoDB).
 * GET/POST /admin-api/home-category-games
 */
import extra from '../model/extra.js';

const KEYS = [
  'homeCategorySports',
  'homeCategoryCasino',
  'homeCategoryCrash',
  'homeCategorySlot',
  'homeCategoryLottery',
  'homeCategoryCards',
  'slotProviders',
  'cardProviders',
];
const RESPONSE_KEYS = ['sports', 'casino', 'crash', 'slot', 'lottery', 'cards', 'slotProviders', 'cardProviders'];

function docToResponse(doc) {
  if (!doc) return RESPONSE_KEYS.reduce((o, k) => ({ ...o, [k]: [] }), {});
  const out = {};
  KEYS.forEach((modelKey, i) => {
    const arr = doc[modelKey];
    out[RESPONSE_KEYS[i]] = Array.isArray(arr) ? arr : [];
  });
  return out;
}

function bodyToUpdate(body) {
  const update = {};
  RESPONSE_KEYS.forEach((key, i) => {
    const arr = body[key];
    update[KEYS[i]] = Array.isArray(arr) ? arr : [];
  });
  return update;
}

/** GET /admin-api/home-category-games */
export const getHomeCategoryGames = async (req, res) => {
  try {
    const doc = await extra.findOne({ id: 1 }).lean();
    res.set('Cache-Control', 'no-store');
    res.status(200).json(docToResponse(doc));
  } catch (err) {
    console.error('getHomeCategoryGames', err);
    res.status(500).json({ error: err.message });
  }
};

/** POST /admin-api/home-category-games */
export const postHomeCategoryGames = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const update = bodyToUpdate(body);
    await extra.updateOne({ id: 1 }, { $set: update }, { upsert: true });
    const doc = await extra.findOne({ id: 1 }).lean();
    res.status(200).json(docToResponse(doc));
  } catch (err) {
    console.error('postHomeCategoryGames', err);
    res.status(500).json({ error: err.message });
  }
};
