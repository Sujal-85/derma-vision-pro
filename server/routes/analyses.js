
import { Router } from "express";
import Analysis from "../models/Analysis.js";

const router = Router();

// Create analysis
router.post("/", async (req, res) => {
  try {
    const analysis = await Analysis.create(req.body);
    res.status(201).json(analysis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all analyses for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single analysis
router.get(":id", async (req, res) => {
  try {
    const item = await Analysis.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;


