/** Stub: providers – return empty list */
export const getAllProviders = async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
