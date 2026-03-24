const express = require("express");
const multer = require("multer");
const { analyzeInput } = require("../controllers/analyzeController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/plain"];
    const allowedExtensions = [".txt", ".log"];
    const lowerName = file.originalname.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (allowedTypes.includes(file.mimetype) || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only .txt and .log files are allowed."));
    }
  },
});

router.post("/", upload.single("file"), analyzeInput);

module.exports = router;
