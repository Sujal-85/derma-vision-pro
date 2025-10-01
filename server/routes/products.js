import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (_req, res) => {
  const items = await Product.find().limit(200).sort({ rating: -1, createdAt: -1 });
  res.json(items);
});

// Simple recommendation endpoint using query params
router.get("/recommend", async (req, res) => {
  const { skinType, concern, ageRange } = req.query;
  const filter = {
    ...(skinType ? { skinTypes: skinType } : {}),
    ...(concern ? { concerns: concern } : {}),
    ...(ageRange ? { ageRanges: ageRange } : {}),
  };
  const items = await Product.find(filter).limit(24).sort({ rating: -1 });
  res.json(items);
});

export default router;


