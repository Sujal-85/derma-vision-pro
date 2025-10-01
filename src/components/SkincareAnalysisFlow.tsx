import { useState } from "react";
import OnboardingQuestionnaire from "./OnboardingQuestionnaire";
import ModernFaceCapture from "./ModernFaceCapture";
import HeatmapVisualization from "./HeatmapVisualization";
import ProductRecommendations from "./ProductRecommendations";
import RoutineGenerator from "./RoutineGenerator";

interface OnboardingData {
  gender: string;
  age: string;
  skinType: string;
  skinTone: string;
  sensitivity: string;
  budget: string;
  environment: string;
  makeupFrequency: string;
  brandPreference: string;
  productExperience: string;
  additionalInfo: string;
  consent: boolean;
}

const SkincareAnalysisFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const steps = [
    "onboarding",
    "face-capture", 
    "analysis",
    "products",
    "routine"
  ];

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setCurrentStep(1);
  };

  const handleOnboardingSkip = () => {
    setCurrentStep(1);
  };

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    // Simulate analysis results
    setAnalysisResults({
      metrics: {
        hydration: 75,
        elasticity: 68,
        uvProtection: 85,
        texture: 72,
        overallScore: 75
      },
      concerns: [
        {
          type: "Fine Wrinkles",
          severity: "Mild",
          area: "Eye area",
          trend: "stable",
          confidence: 85,
          description: "Detected mild fine lines around the eye area"
        },
        {
          type: "Dark Spots",
          severity: "Moderate",
          area: "Cheek area",
          trend: "stable",
          confidence: 78,
          description: "Some hyperpigmentation detected on cheeks"
        }
      ],
      recommendations: [
        {
          category: "Immediate Action",
          items: [
            "Apply vitamin C serum in the morning",
            "Use SPF 30+ sunscreen daily",
            "Increase water intake to 8 glasses/day"
          ]
        }
      ]
    });
    setCurrentStep(2);
  };

  const handleBackToCapture = () => {
    setCurrentStep(1);
  };

  const handleProceedToProducts = () => {
    setCurrentStep(3);
  };

  const handleBackToAnalysis = () => {
    setCurrentStep(2);
  };

  const handleProceedToRoutine = () => {
    setCurrentStep(4);
  };

  const handleBackToProducts = () => {
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OnboardingQuestionnaire
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        );
      
      case 1:
        return (
          <ModernFaceCapture
            onCapture={handleImageCapture}
            onBack={() => setCurrentStep(0)}
          />
        );
      
      case 2:
        return (
          <HeatmapVisualization
            imageData={capturedImage!}
            analysisResults={analysisResults}
            onBack={handleBackToCapture}
            onNext={handleProceedToProducts}
          />
        );
      
      case 3:
        return (
          <ProductRecommendations
            skinConcerns={analysisResults?.concerns || []}
            userProfile={onboardingData}
            onBack={handleBackToAnalysis}
            onNext={handleProceedToRoutine}
          />
        );
      
      case 4:
        return (
          <RoutineGenerator
            userProfile={onboardingData}
            skinAnalysis={analysisResults}
            selectedProducts={selectedProducts}
            onBack={handleBackToProducts}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentStep()}
    </div>
  );
};

export default SkincareAnalysisFlow;
