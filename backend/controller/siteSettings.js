import extra from "../model/extra.js";

const baseUrl = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4001}`;

export const getSiteSettings = async (req, res) => {
  try {
    const doc = await extra.findOne({ id: 1 }, { siteLogoUrl: 1, apkDownloadUrl: 1 });
    res.status(200).json({
      logoUrl: doc?.siteLogoUrl || "",
      apkDownloadUrl: doc?.apkDownloadUrl || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSiteSettingsAdmin = async (req, res) => {
  if (req.params.api !== process.env.AdminAPI) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const doc = await extra.findOne({ id: 1 }, { siteLogoUrl: 1, apkDownloadUrl: 1 });
    res.status(200).json({
      logoUrl: doc?.siteLogoUrl || "",
      apkDownloadUrl: doc?.apkDownloadUrl || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadLogo = async (req, res) => {
  if (req.params.api !== process.env.AdminAPI) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const logoUrl = `${baseUrl()}/uploads/logo/${req.file.filename}`;
    await extra.updateOne(
      { id: 1 },
      { $set: { siteLogoUrl: logoUrl } },
      { upsert: true }
    );
    res.status(200).json({ success: true, logoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadApk = async (req, res) => {
  if (req.params.api !== process.env.AdminAPI) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const apkDownloadUrl = `${baseUrl()}/uploads/apk/${req.file.filename}`;
    await extra.updateOne(
      { id: 1 },
      { $set: { apkDownloadUrl } },
      { upsert: true }
    );
    res.status(200).json({ success: true, apkDownloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
