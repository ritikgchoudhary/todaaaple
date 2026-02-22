import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../uploads/apk");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || "").toLowerCase();
    const name = ext === ".apk" ? "app-" + Date.now() + ".apk" : "app-" + Date.now() + (ext || ".apk");
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isApk = file.mimetype === "application/vnd.android.package-archive" ||
      (file.originalname && file.originalname.toLowerCase().endsWith(".apk"));
    if (isApk) cb(null, true);
    else cb(new Error("Only APK files are allowed"));
  },
});

export const uploadApkSingle = upload.single("apk");
