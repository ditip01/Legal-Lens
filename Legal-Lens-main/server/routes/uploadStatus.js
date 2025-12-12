import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Upload from "../models/uploadModel.js";
import { fileURLToPath } from "url";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

// ✅ Fetch analysis result
// ✅ List uploads for authenticated user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .lean();

    // Return simplified objects for the frontend
    const result = uploads.map((u) => ({
      uploadId: u._id,
      fileName: u.fileName,
      uploadedAt: u.uploadedAt,
      analysisResult: u.analysisResult || null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error listing user uploads:", err);
    return res.status(500).json({ error: "Server error listing uploads." });
  }
});

// ✅ Fetch analysis result
router.get("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
    console.error("⚠️ Invalid ObjectId received in /upload-status:", id);
    return res.status(400).json({ error: "Invalid upload ID." });
  }

  try {
    console.log("📥 Fetching analysis for upload ID:", id);
    const upload = await Upload.findOne({ _id: id, userId: req.user.id });

    if (!upload) {
      console.warn("⚠️ No upload found for user or ID:", id);
      return res.status(404).json({ error: "Upload not found." });
    }

    res.status(200).json({
      uploadId: upload._id,
      fileName: upload.fileName,
      analysisResult: upload.analysisResult || {},
    });
  } catch (err) {
    console.error("❌ Error fetching upload:", err);
    res.status(500).json({ error: "Server error fetching upload." });
  }
});

// ✅ Download analysis report
router.get("/:id/download", authenticateUser, async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid upload ID." });
  }

  try {
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ error: "Upload not found." });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const reportPath = path.join(
      __dirname,
      "..",
      "uploads",
      `${path.parse(upload.fileName).name}_report.pdf`
    );

    if (!fs.existsSync(reportPath)) {
      console.error("⚠️ Report not found at:", reportPath);
      return res.status(404).json({
        error: "Report not found — it may still be generating.",
      });
    }

    console.log("📤 Downloading report:", reportPath);
    res.download(reportPath, `${upload.fileName}_RiskReport.pdf`);
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Error downloading report." });
  }
});

export default router;
