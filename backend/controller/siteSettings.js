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
      telegramLink: doc.telegramLink || '',
      customerServiceLink: doc.customerServiceLink || '',
      whatsappLink: doc.whatsappLink || '',
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
      telegramLink: doc.telegramLink || '',
      customerServiceLink: doc.customerServiceLink || '',
      whatsappLink: doc.whatsappLink || '',
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

export const updateSiteSettings = async (req, res) => {
  try {
    const api = req.params.api;
    if (api !== process.env.AdminAPI) {
      return res.status(401).json({ error: 'Permission denied' });
    }
    const data = req.body;
    await extra.updateOne({ id: 1 }, { $set: data }, { upsert: true });
    const doc = await extra.findOne({ id: 1 }).lean();
    res.status(200).json({ success: true, settings: doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
