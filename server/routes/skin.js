import { Router } from "express";
import multer from "multer";

const router = Router();
const PY_URL = process.env.SKIN_SERVICE_URL || "http://127.0.0.1:8000";

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

router.get("/test", async (req, res) => {
  try {
    const response = await fetch(`${PY_URL}/test`);
    if (response.ok) {
      const data = await response.json();
      res.json({ 
        status: "connected", 
        python_service: data,
        message: "All services are running properly" 
      });
    } else {
      res.status(500).json({ 
        status: "error", 
        message: "Python service not responding" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: `Cannot connect to Python service: ${error.message}` 
    });
  }
});

// Route for base64 data URL (legacy)
router.post("/analyze", async (req, res) => {
  try {
    const { imageDataUrl, age, location, symptoms, history } = req.body || {};
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return res.status(400).json({ error: "imageDataUrl is required (base64 data URL)" });
    }
    const base64 = imageDataUrl.split(",")[1];
    const buf = Buffer.from(base64, "base64");

    const form = new FormData();
    const blob = new Blob([buf], { type: "image/jpeg" });
    form.append("file", blob, "face.jpg");
    if (age) form.append("age", String(age));
    if (location) form.append("location", String(location));
    if (symptoms) form.append("symptoms", String(symptoms));
    if (history) form.append("history", String(history));

    const r = await fetch(`${PY_URL}/analyze`, { method: "POST", body: form });
    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

// Route for multipart/form-data (advanced analysis)
router.post("/analyze-advanced", upload.single('file'), async (req, res) => {
  try {
    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create new FormData from the incoming request
    const form = new FormData();
    
    const fileBlob = new Blob([req.file.buffer], { 
      type: req.file.mimetype || "image/jpeg" 
    });
    form.append("file", fileBlob, req.file.originalname || "skin_image.jpg");

    // Add other form fields
    if (req.body.age) form.append("age", String(req.body.age));
    if (req.body.location) form.append("location", String(req.body.location));
    if (req.body.symptoms) form.append("symptoms", String(req.body.symptoms));
    if (req.body.history) form.append("history", String(req.body.history));

    const r = await fetch(`${PY_URL}/analyze`, { method: "POST", body: form });
    const data = await r.json();
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

export default router;



