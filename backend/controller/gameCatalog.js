import GameCatalog from "../model/gameCatalog.js";
import ErrorResponse from "../utils/error.js";

function assertAdminApi(req) {
  const api = req.params.api;
  if (!api || api !== process.env.AdminAPI) {
    throw new ErrorResponse("Not authorized (invalid AdminAPI)", 401);
  }
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

import Game from "../model/Game.js";

export const getGamesCatalogPublic = async (req, res, next) => {
  try {
    // Fetch dynamic games assigned to a category
    const dynamicGames = await Game.find({
      category: { $ne: null, $ne: "" },
      status: 1
    }).lean();

    const mappedDynamicGames = dynamicGames.map(g => ({
      _id: g._id,
      key: g.game_code, // Use game_code as key
      name: g.game_name,
      category: g.category,
      type: "grid",
      softapiGameUid: g.game_code, // Important for launch logic
      charImageUrl: g.game_img_cdn || g.game_img,
      logoUrl: g.game_img_cdn || g.game_img,
      backgroundUrl: g.game_img_cdn || g.game_img,
      provider: g.brand_id // Optional info
    }));

    // Only show assigned games (dynamic), ignoring manual catalog (demo) games
    const allGames = mappedDynamicGames;

    res.status(200).json({ success: true, games: allGames });
  } catch (err) {
    console.error("getGamesCatalogPublic Error:", err.message);
    res.status(200).json({ success: true, games: [] });
  }
};

export const getGamesCatalogAdmin = async (req, res, next) => {
  try {
    assertAdminApi(req);
    const games = await GameCatalog.find({})
      .sort({ category: 1, sortOrder: 1, createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, games });
  } catch (err) {
    next(err);
  }
};

export const createGameCatalogAdmin = async (req, res, next) => {
  try {
    assertAdminApi(req);
    const body = req.body || {};

    const key = normalizeKey(body.key || body.name);
    if (!key) return next(new ErrorResponse("key/name is required", 400));
    if (!body.name) return next(new ErrorResponse("name is required", 400));
    if (!body.category) return next(new ErrorResponse("category is required", 400));

    const doc = await GameCatalog.create({
      key,
      name: body.name,
      category: body.category,
      type: body.type || "grid",
      enabled: body.enabled !== undefined ? !!body.enabled : true,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      badge: body.badge || "",
      logoUrl: body.logoUrl || "",
      charImageUrl: body.charImageUrl || "",
      backgroundUrl: body.backgroundUrl || "",
      onClickPath: body.onClickPath || "",
      externalUrl: body.externalUrl || "",
      softapiGameUid: body.softapiGameUid || "",
    });

    res.status(201).json({ success: true, game: doc });
  } catch (err) {
    // handle duplicate key
    if (err?.code === 11000) {
      return next(new ErrorResponse("Game key already exists", 409));
    }
    next(err);
  }
};

export const updateGameCatalogAdmin = async (req, res, next) => {
  try {
    assertAdminApi(req);
    const { id } = req.params;
    const body = req.body || {};

    const update = {
      ...(body.key !== undefined ? { key: normalizeKey(body.key) } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.enabled !== undefined ? { enabled: !!body.enabled } : {}),
      ...(body.sortOrder !== undefined
        ? { sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0 }
        : {}),
      ...(body.badge !== undefined ? { badge: body.badge } : {}),
      ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
      ...(body.charImageUrl !== undefined ? { charImageUrl: body.charImageUrl } : {}),
      ...(body.backgroundUrl !== undefined ? { backgroundUrl: body.backgroundUrl } : {}),
      ...(body.onClickPath !== undefined ? { onClickPath: body.onClickPath } : {}),
      ...(body.externalUrl !== undefined ? { externalUrl: body.externalUrl } : {}),
      ...(body.softapiGameUid !== undefined ? { softapiGameUid: body.softapiGameUid } : {}),
    };

    if (update.key === "") delete update.key;

    const doc = await GameCatalog.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new ErrorResponse("Game not found", 404));

    res.status(200).json({ success: true, game: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return next(new ErrorResponse("Game key already exists", 409));
    }
    next(err);
  }
};

export const deleteGameCatalogAdmin = async (req, res, next) => {
  try {
    assertAdminApi(req);
    const { id } = req.params;
    const doc = await GameCatalog.findByIdAndDelete(id);
    if (!doc) return next(new ErrorResponse("Game not found", 404));
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

