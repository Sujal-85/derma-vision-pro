import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import UserProfile from "../models/UserProfile.js";

const router = Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Avatar upload endpoint (must be before /:userId routes)
router.post("/avatar", upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user profile with avatar URL
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { avatarUrl },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar uploaded successfully' 
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

router.get("/:userId", async (req, res) => {
  const profile = await UserProfile.findOne({ userId: req.params.userId });
  res.json(profile || null);
});

router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const data = req.body || {};
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { ...data, userId },
    { new: true, upsert: true }
  );
  res.status(201).json(profile);
});

// Questionnaire routes
router.get("/:userId/questionnaire", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      return res.json({ skincare: null, onboarding: null });
    }
    
    if (type) {
      return res.json({ [type]: profile.questionnaireAnswers?.[type] || null });
    }
    
    res.json(profile.questionnaireAnswers || { skincare: null, onboarding: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:userId/questionnaire", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, answers } = req.body;
    
    if (!type || !answers) {
      return res.status(400).json({ error: "Type and answers are required" });
    }
    
    const updateData = {
      [`questionnaireAnswers.${type}`]: {
        ...answers,
        completedAt: new Date()
      }
    };
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json(profile.questionnaireAnswers[type]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routine routes
router.get("/:userId/routines", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      return res.json([]);
    }
    
    res.json(profile.savedRoutines || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:userId/routines", async (req, res) => {
  try {
    const { userId } = req.params;
    const routineData = req.body;
    
    // Generate unique ID for the routine
    const routineId = `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newRoutine = {
      id: routineId,
      ...routineData,
      createdAt: new Date(),
      isActive: false
    };
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $push: { savedRoutines: newRoutine } },
      { new: true, upsert: true }
    );
    
    res.json(newRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:userId/routines/:routineId/activate", async (req, res) => {
  try {
    const { userId, routineId } = req.params;
    
    // First, deactivate all other routines
    await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { "savedRoutines.$[].isActive": false } }
    );
    
    // Then activate the selected routine
    const profile = await UserProfile.findOneAndUpdate(
      { userId, "savedRoutines.id": routineId },
      { $set: { "savedRoutines.$.isActive": true } },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: "Routine not found" });
    }
    
    const activeRoutine = profile.savedRoutines.find(r => r.id === routineId);
    res.json(activeRoutine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


