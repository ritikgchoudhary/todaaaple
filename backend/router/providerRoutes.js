import express from "express";
import {
    getAllProviders,
    updateProviderStatus,
    getAllGames,
    updateGameStatus,
    updateGameInfo,
    bulkUpdateGameCategory
} from "../controller/providerController.js";
import {
    getCarouselAdmin,
    uploadCarouselImage,
    addCarouselImageByUrl,
    updateCarouselOrder,
    deleteCarouselImage,
} from "../controller/carousel.js";
import { getSiteSettingsAdmin, uploadLogo, uploadApk } from "../controller/siteSettings.js";
import { uploadSingle } from "../middleware/uploadCarousel.js";
import { uploadLogoSingle } from "../middleware/uploadLogo.js";
import { uploadApkSingle } from "../middleware/uploadApk.js";

const router = express.Router();

router.get("/providers", getAllProviders);
router.put("/providers/:id/status", updateProviderStatus);

router.get("/games", getAllGames);
router.put("/games/category/bulk", bulkUpdateGameCategory);
router.put("/games/:id/status", updateGameStatus);
router.put("/games/:id/info", updateGameInfo);

// Carousel (mounted at /admin, so path is /carousel/...)
router.get("/carousel/:api", getCarouselAdmin);
router.post("/carousel/upload/:api", (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    next();
  });
}, uploadCarouselImage);
router.post("/carousel/add-url/:api", addCarouselImageByUrl);
router.post("/carousel/order/:api", updateCarouselOrder);
router.post("/carousel/delete/:api", deleteCarouselImage);

// Site settings (logo & APK)
router.get("/site-settings/:api", getSiteSettingsAdmin);
router.post("/site-settings/logo/upload/:api", uploadLogoSingle, uploadLogo);
router.post("/site-settings/apk/upload/:api", uploadApkSingle, uploadApk);

export default router;
