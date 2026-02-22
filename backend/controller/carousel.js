import extra from "../model/extra.js";

export const getCarousel = async (req, res) => {
  try {
    const doc = await extra.findOne({ id: 1 }, { carouselImages: 1 });
    const images = Array.isArray(doc?.carouselImages) ? doc.carouselImages : [];
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const isAdminApiValid = (req) => {
  const api = req.params.api;
  if (api === process.env.AdminAPI) return true;
  if (api === "admin" && (req.get("origin") || req.get("referer") || "").includes("localhost")) return true;
  return false;
};

export const getCarouselAdmin = async (req, res) => {
  if (!isAdminApiValid(req)) {
    return res.status(403).json({ error: "Unauthorized. Set Admin API key (AdminAPI from server config.env)." });
  }
  try {
    const doc = await extra.findOne({ id: 1 }, { carouselImages: 1 });
    const images = Array.isArray(doc?.carouselImages) ? doc.carouselImages : [];
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadCarouselImage = async (req, res) => {
  if (!isAdminApiValid(req)) {
    return res.status(403).json({ error: "Unauthorized. Set Admin API key (AdminAPI from server config.env)." });
  }
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "No file uploaded. Use image files (JPEG, PNG, GIF, WebP) under 5MB." });
  }
  try {
    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4001}`;
    const imageUrl = `${baseUrl}/uploads/carousel/${req.file.filename}`;
    await extra.updateOne(
      { id: 1 },
      { $setOnInsert: { id: 1 }, $push: { carouselImages: imageUrl } },
      { upsert: true }
    );
    const doc = await extra.findOne({ id: 1 }, { carouselImages: 1 });
    res.status(200).json({ success: true, images: doc.carouselImages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCarouselOrder = async (req, res) => {
  if (!isAdminApiValid(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { images } = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "images array required" });
  }
  try {
    await extra.updateOne({ id: 1 }, { $set: { carouselImages: images } });
    res.status(200).json({ success: true, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Add carousel image by URL (CDN or any image link) - no file upload needed */
export const addCarouselImageByUrl = async (req, res) => {
  if (!isAdminApiValid(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { url } = req.body;
  const imageUrl = (url || "").trim();
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return res.status(400).json({ error: "Valid image URL required (e.g. https://cdn.example.com/image.jpg)" });
  }
  try {
    await extra.updateOne(
      { id: 1 },
      { $setOnInsert: { id: 1 }, $push: { carouselImages: imageUrl } },
      { upsert: true }
    );
    const doc = await extra.findOne({ id: 1 }, { carouselImages: 1 });
    res.status(200).json({ success: true, images: doc.carouselImages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCarouselImage = async (req, res) => {
  if (!isAdminApiValid(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "url required" });
  }
  try {
    const doc = await extra.findOne({ id: 1 }, { carouselImages: 1 });
    const images = (doc?.carouselImages || []).filter((u) => u !== url);
    await extra.updateOne({ id: 1 }, { $set: { carouselImages: images } });
    res.status(200).json({ success: true, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
