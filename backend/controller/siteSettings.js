/** Stub: site settings – read/update from Extra (siteLogoUrl, apkDownloadUrl) */
import extra from '../model/extra.js';

async function getDoc() {
  const d = await extra.findOne({ id: 1 }).lean();
  return d || {};
}

export const getSiteSettings = async (req, res) => {
  try {
    const doc = await getDoc();
    res.status(200).json({
      siteLogoUrl: doc.siteLogoUrl || '',
      apkDownloadUrl: doc.apkDownloadUrl || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getSiteSettingsAdmin = async (req, res) => {
  try {
    const doc = await getDoc();
    res.status(200).json({
      siteLogoUrl: doc.siteLogoUrl || '',
      apkDownloadUrl: doc.apkDownloadUrl || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const url = req.file?.path ? `/uploads/${req.file.filename}` : '';
    if (url) await extra.updateOne({ id: 1 }, { $set: { siteLogoUrl: url } }, { upsert: true });
    const doc = await getDoc();
    res.status(200).json({ siteLogoUrl: doc.siteLogoUrl || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const uploadApk = async (req, res) => {
  try {
    const url = req.file?.path ? `/uploads/${req.file.filename}` : '';
    if (url) await extra.updateOne({ id: 1 }, { $set: { apkDownloadUrl: url } }, { upsert: true });
    const doc = await getDoc();
    res.status(200).json({ apkDownloadUrl: doc.apkDownloadUrl || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
