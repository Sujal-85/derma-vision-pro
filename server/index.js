import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import analysesRouter from "./routes/analyses.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import profileRouter from "./routes/profile.js";
import skinRouter from "./routes/skin.js";
import newsRouter from "./routes/news.js";
import medicalAssistantRouter from "./routes/medical-assistant.js";
import aiAssistantRouter from "./routes/ai-assistant.js";
import medicalAIRouter from "./routes/medical-ai.js";
import doctorsRouter from "./routes/doctors.js";
import appointmentsRouter from "./routes/appointments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/derma_vision_pro";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/analyses", analysesRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/skin", skinRouter);
app.use("/api/news", newsRouter);
app.use("/api/medical-assistant", medicalAssistantRouter);
app.use("/api/ai-assistant", aiAssistantRouter);
app.use("/api/medical-ai", medicalAIRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", appointmentsRouter);

mongoose
  .connect(MONGO_URI, { dbName: "derma_vision_pro" })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });


