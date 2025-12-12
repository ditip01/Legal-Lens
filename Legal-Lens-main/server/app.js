import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadStatusRoutes from "./routes/uploadStatus.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/upload-status", uploadStatusRoutes);

// Lightweight health check for debugging (no auth)
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), msg: 'Backend ping' });
});

console.log('🔧 Mounted routes: /api, /api/admin, /api/upload, /api/upload-status');

app.get("/", (req, res) => {
  res.send("✅ LegalLens backend running...");
});

// Connect DB + Start Server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)))
  .catch((err) => console.error("❌ Database connection failed:", err));
