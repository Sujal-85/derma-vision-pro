import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/derma_vision_pro";

const BRANDS = ["DermaTech", "GlowLab", "SkinWise", "PureBloom", "AquaDerm", "Revita" ];
const CATEGORIES = ["Cleanser", "Moisturizer", "Serum", "Sunscreen", "Toner", "Mask", "Exfoliant"]; 
const SKIN_TYPES = ["dry", "oily", "combination", "normal", "sensitive"]; 
const CONCERNS = ["acne", "wrinkles", "dark-spots", "dryness", "redness", "pores"]; 
const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"]; 

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomSample(arr, n) { return arr.sort(() => 0.5 - Math.random()).slice(0, n); }

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: "derma_vision_pro" });
  const toInsert = [];
  for (let i = 1; i <= 120; i++) {
    const category = randomPick(CATEGORIES);
    toInsert.push({
      name: `${category} #${i}`,
      brand: randomPick(BRANDS),
      category,
      price: parseFloat((Math.random() * 60 + 5).toFixed(2)),
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      imageUrl: `https://picsum.photos/seed/derma_${i}/400/300`,
      description: `High-quality ${category.toLowerCase()} for daily skincare routine`,
      skinTypes: randomSample(SKIN_TYPES, 2),
      concerns: randomSample(CONCERNS, 2),
      ageRanges: randomSample(AGE_RANGES, 2),
      ingredients: ["Hyaluronic Acid", "Niacinamide", "Vitamin C", "Retinol"],
      tags: ["beauty", "skincare", "recommended"],
    });
  }
  await Product.deleteMany({});
  await Product.insertMany(toInsert);
  console.log(`Inserted ${toInsert.length} products.`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });


