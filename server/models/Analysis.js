import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    imageDataUrl: { type: String },
    metrics: {
      hydration: Number,
      elasticity: Number,
      uvProtection: Number,
      texture: Number,
      overallScore: Number,
    },
    concerns: [
      {
        type: { type: String },
        severity: String,
        area: String,
        trend: String,
        confidence: Number,
        description: String, // Added for medical-grade analysis
      },
    ],
    recommendations: [
      {
        category: String,
        items: [String],
      },
    ],
    // Medical-grade analysis fields
    detailedAnalysis: {
      skin_tone_analysis: mongoose.Schema.Types.Mixed,
      texture_analysis: mongoose.Schema.Types.Mixed,
      hyperpigmentation_analysis: mongoose.Schema.Types.Mixed,
      wrinkle_analysis: mongoose.Schema.Types.Mixed,
      redness_analysis: mongoose.Schema.Types.Mixed,
    },
    redFlags: [String],
    confidenceLevel: String,
    analysisSummary: String,
    disclaimer: String,
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", AnalysisSchema);


