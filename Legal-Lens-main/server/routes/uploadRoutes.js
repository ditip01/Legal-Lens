import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import Upload from "../models/uploadModel.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

// ✅ Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({ storage });

// ✅ Run Python risk analysis
const runPythonRiskAnalysis = (pdfPath) =>
  new Promise((resolve, reject) => {
    const scriptPath = "C:\\Users\\hp\\Downloads\\contract-risk-nlp\\scripts\\predict_risk.py";
    console.log(`🐍 Running Python script: ${scriptPath}`);
    console.log(`📄 PDF path: ${pdfPath}`);

    const python = spawn("python", [scriptPath, pdfPath], { cwd: path.dirname(scriptPath) });

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("🐍 Python stdout:", text);
      output += text;
    });

    python.stderr.on("data", (data) => {
      const errText = data.toString();
      console.error("❌ Python stderr:", errText);
      errorOutput += errText;
    });

    python.on("close", (code) => {
      console.log(`🐍 Python exited with code: ${code}`);
      if (code === 0 && output.trim()) {
        try {
          const start = output.indexOf("{");
          const end = output.lastIndexOf("}");
          const jsonText = output.substring(start, end + 1);
          const parsed = JSON.parse(jsonText);
          console.log("✅ Parsed JSON from Python successfully!");
          resolve(parsed);
        } catch (err) {
          console.error("❌ JSON parse error:", err, output);
          reject("Invalid JSON from Python script");
        }
      } else {
        reject("Python script failed: " + errorOutput);
      }
    });
  });

// ✅ Upload route
router.post("/", authenticateUser, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file received in upload!");
      return res.status(400).json({ error: "No file uploaded!" });
    }

    // ✅ Save upload record first
    const newUpload = new Upload({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      analysisResult: null,
    });

    const savedUpload = await newUpload.save();
    console.log("✅ Upload saved in DB with ID:", savedUpload._id);

    // ✅ Respond immediately
    res.status(200).json({
      message: "✅ File uploaded successfully! Analysis started.",
      uploadId: savedUpload._id.toString(),
    });

    // ✅ Run Python asynchronously
    const pdfPath = path.join(uploadDir, req.file.filename);
    runPythonRiskAnalysis(pdfPath)
      .then(async (analysisResult) => {
        console.log("✅ Python analysis completed for:", savedUpload._id);
        await Upload.findByIdAndUpdate(savedUpload._id, { analysisResult });
        console.log("💾 Analysis saved successfully for:", req.file.originalname);
      })
      .catch(async (err) => {
        console.error("❌ Analysis failed:", err);
        await Upload.findByIdAndUpdate(savedUpload._id, {
          analysisResult: { error: "Analysis failed", details: err },
        });
      });
  } catch (err) {
    console.error("❌ Upload/Analysis error:", err);
    res.status(500).json({ error: "Server error during upload or analysis." });
  }
});

export default router;
