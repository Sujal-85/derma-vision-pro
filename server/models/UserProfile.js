import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true, required: true },
    fullName: String,
    age: Number,
    gender: String,
    skinType: String,
    avatarUrl: String,
    preferences: {
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" }
    },
    allergies: [String],
    conditions: [String],
    // Legacy MCQ answers for backward compatibility
    mcqAnswers: [
      {
        questionId: String,
        question: String,
        answer: String,
      },
    ],
    // Enhanced questionnaire data
    questionnaireAnswers: {
      // Skincare questionnaire answers
      skincare: {
        skinType: String,
        mainConcerns: [String],
        currentRoutine: String,
        sunExposure: String,
        goals: [String],
        completedAt: Date,
      },
      // Onboarding questionnaire answers
      onboarding: {
        gender: String,
        age: String,
        skinType: String,
        skinTone: String,
        sensitivity: String,
        budget: String,
        environment: String,
        makeupFrequency: String,
        brandPreference: String,
        productExperience: String,
        additionalInfo: String,
        consent: Boolean,
        completedAt: Date,
      },
    },
    // Saved routines
    savedRoutines: [
      {
        id: String,
        name: String,
        description: String,
        routine: {
          morning: [Object],
          evening: [Object],
          weekly: [Object],
        },
        skinType: String,
        concerns: [String],
        estimatedTime: {
          morning: String,
          evening: String,
        },
        totalCost: Number,
        effectiveness: Number,
        createdAt: Date,
        isActive: { type: Boolean, default: false },
      },
    ],
    // Legacy routines for backward compatibility
    routines: {
      morning: [String],
      evening: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", UserProfileSchema);


