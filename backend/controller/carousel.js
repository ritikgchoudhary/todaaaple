/** Stub: carousel – read/update from Extra.carouselImages */
import extra from '../model/extra.js';

async function getDoc() {
  const d = await extra.findOne({ id: 1 }).lean();
  return d || { carouselImages: [] };
}

export const getCarousel = async (req, res) => {
  try {
    const doc = await getDoc();
    res.status(200).json({ images: doc.carouselImages || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getCarouselAdmin = async (req, res) => {
  try {
    const doc = await getDoc();
    res.status(200).json({ images: doc.carouselImages || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const uploadCarouselImage = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    const url = file?.filename ? `/uploads/carousel/${file.filename}` : req.body?.url || '';
    if (!url) return res.status(400).json({ error: 'No image' });
    await extra.updateOne(
      { id: 1 },
      { $push: { carouselImages: url } },
      { upsert: true }
    );
    const doc = await getDoc();
    res.status(200).json({ images: doc.carouselImages || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const updateCarouselOrder = async (req, res) => {
  try {
    const order = Array.isArray(req.body?.images) ? req.body.images : [];
    await extra.updateOne({ id: 1 }, { $set: { carouselImages: order } }, { upsert: true });
    res.status(200).json({ images: order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteCarouselImage = async (req, res) => {
  try {
    const url = req.body?.url || req.query?.url;
    await extra.updateOne({ id: 1 }, { $pull: { carouselImages: url } }, { upsert: true });
    const doc = await getDoc();
    res.status(200).json({ images: doc.carouselImages || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
