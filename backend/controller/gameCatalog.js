/** Stub: game catalog – return empty until proper model/routes are used */
export const getGamesCatalogPublic = async (req, res) => {
  try {
    res.status(200).json({ games: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getGamesCatalogAdmin = async (req, res) => {
  try {
    res.status(200).json({ games: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const createGameCatalogAdmin = async (req, res) => {
  try {
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateGameCatalogAdmin = async (req, res) => {
  try {
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteGameCatalogAdmin = async (req, res) => {
  try {
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
