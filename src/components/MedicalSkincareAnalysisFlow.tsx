import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Activity,
  Zap,
  Heart,
  Sun,
  Droplets,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { analyzeSkin, createAnalysis } from "@/lib/api";
import ModernFaceCapture from "./ModernFaceCapture";
import AnalysisDashboard from "./AnalysisDashboard";
import MedicalRoutineGenerator from "./MedicalRoutineGenerator";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface MedicalAnalysisData {
  metrics: {
    hydration: number;
    elasticity: number;
    uvProtection: number;
    texture: number;
    overallScore: number;
  };
  concerns: Array<{
    type: string;
    severity: string;
    area: string;
    trend: string;
    confidence: number;
    description?: string;
  }>;
  recommendations: Array<{
    category: string;
    items: string[];
  }>;
  detailed_analysis?: any;
  red_flags?: string[];
  confidence_level?: string;
  analysis_summary?: string;
  disclaimer?: string;
}

const MedicalSkincareAnalysisFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<MedicalAnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  const steps: AnalysisStep[] = [
    {
      id: "capture",
      title: "Capture Photo",
      description: "Take a clear photo of your face for medical-grade analysis",
      completed: false,
      current: currentStep === 0
    },
    {
      id: "analyze",
      title: "AI Analysis",
      description: "Advanced computer vision analyzes your skin health",
      completed: false,
      current: currentStep === 1
    },
    {
      id: "results",
      title: "Medical Results",
      description: "Review your comprehensive skin analysis report",
      completed: false,
      current: currentStep === 2
    },
    {
      id: "routine",
      title: "Medical Routine",
      description: "Get your personalized medical-grade skincare routine",
      completed: false,
      current: currentStep === 3
    }
  ];

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentStep(1);
    await performAnalysis(imageData);
  };

  const performAnalysis = async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisError(null);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Call the real medical analysis API
      const analysisResults = await analyzeSkin({
        imageDataUrl: imageData,
        age: user?.age,
        location: user?.location,
        symptoms: user?.symptoms,
        history: user?.medicalHistory
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Process the medical analysis results
      const processedAnalysis: MedicalAnalysisData = {
        metrics: {
          hydration: analysisResults.metrics?.hydration || 0,
          elasticity: analysisResults.metrics?.elasticity || 0,
          uvProtection: analysisResults.metrics?.uvProtection || 0,
          texture: analysisResults.metrics?.texture || 0,
          overallScore: analysisResults.metrics?.overallScore || 0,
        },
        concerns: analysisResults.concerns || [],
        recommendations: analysisResults.recommendations || [],
        detailed_analysis: analysisResults.detailed_analysis,
        red_flags: analysisResults.red_flags || [],
        confidence_level: analysisResults.confidence_level,
        analysis_summary: analysisResults.analysis_summary,
        disclaimer: analysisResults.disclaimer
      };

      setAnalysisData(processedAnalysis);

      // Save analysis to backend
      await saveAnalysis(processedAnalysis, imageData);

      // Update steps
      updateStepCompletion(1, true);
      setCurrentStep(2);

    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = async (analysis: MedicalAnalysisData, imageData: string) => {
    try {
      const payload = {
        userId: user?.id || null,
        imageDataUrl: imageData,
        metrics: analysis.metrics,
        concerns: analysis.concerns,
        recommendations: analysis.recommendations,
        detailedAnalysis: analysis.detailed_analysis,
        redFlags: analysis.red_flags,
        confidenceLevel: analysis.confidence_level,
        analysisSummary: analysis.analysis_summary,
        disclaimer: analysis.disclaimer
      };

      const result = await createAnalysis(payload);
      setSavedAnalysisId(result._id);
    } catch (error) {
      console.error('Failed to save analysis:', error);
      // Don't throw error here as analysis is still valid
    }
  };

  const updateStepCompletion = (stepIndex: number, completed: boolean) => {
    // This would update the steps state in a real implementation
    // For now, we'll just track it locally
  };

  const handleViewResults = () => {
    setCurrentStep(2);
  };

  const handleGenerateRoutine = () => {
    setCurrentStep(3);
  };

  const handleBackToCapture = () => {
    setCurrentStep(0);
    setCapturedImage(null);
    setAnalysisData(null);
    setAnalysisError(null);
    setSavedAnalysisId(null);
  };

  const handleBackToAnalysis = () => {
    setCurrentStep(2);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
              ${step.completed 
                ? 'bg-green-500 text-white' 
                : step.current 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-200 text-gray-600'
              }
            `}>
              {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${step.current ? 'text-primary' : 'text-gray-600'}`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCaptureStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Medical-Grade Skin Analysis</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Capture a clear photo of your face for comprehensive AI-powered skin health analysis
        </p>
      </div>

      <ModernFaceCapture 
        onCapture={handleImageCapture}
        onBack={() => {}} // No back button needed for first step
      />
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Analyzing Your Skin</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Our medical AI is processing your image using advanced computer vision
        </p>
      </div>

      {capturedImage && (
        <div className="max-w-md mx-auto mb-8">
          <img 
            src={capturedImage} 
            alt="Captured for analysis"
            className="w-full h-64 object-cover rounded-lg border-2 border-border"
          />
        </div>
      )}

      {isAnalyzing ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto">
                <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Medical Analysis in Progress</h3>
                <p className="text-muted-foreground">
                  Analyzing skin texture, hydration, elasticity, and identifying concerns...
                </p>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {analysisProgress < 30 && "Detecting facial features..."}
                {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing skin texture..."}
                {analysisProgress >= 60 && analysisProgress < 90 && "Evaluating skin concerns..."}
                {analysisProgress >= 90 && "Generating medical recommendations..."}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : analysisError ? (
        <Card className="max-w-md mx-auto border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-600 mb-4">{analysisError}</p>
            <Button onClick={handleBackToCapture} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : analysisData ? (
        <Card className="max-w-md mx-auto border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Analysis Complete!</h3>
            <p className="text-green-600 mb-4">
              Your medical-grade skin analysis is ready for review.
            </p>
            <Button onClick={handleViewResults} className="bg-green-500 hover:bg-green-600">
              View Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Medical Analysis Results</h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive skin health assessment with medical-grade insights
          </p>
        </div>
        <Button variant="outline" onClick={handleBackToCapture}>
          New Analysis
        </Button>
      </div>

      {analysisData && (
        <>
          {/* Medical Priority Alert */}
          {analysisData.red_flags && analysisData.red_flags.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Medical Alert:</strong> {analysisData.red_flags.join(" ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Medical Disclaimer */}
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Medical Disclaimer:</strong> {analysisData.disclaimer}
            </AlertDescription>
          </Alert>

          <AnalysisDashboard analysisData={analysisData} />

          <div className="flex justify-center">
            <Button onClick={handleGenerateRoutine} size="lg" className="bg-gradient-primary">
              Generate Medical Routine
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderRoutineStep = () => (
    <div>
      {analysisData && (
        <MedicalRoutineGenerator 
          analysisData={analysisData}
          userProfile={user}
          onBack={handleBackToAnalysis}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Medical Skin Analysis
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  AI-powered medical-grade skin health assessment
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {currentStep === 0 && renderCaptureStep()}
          {currentStep === 1 && renderAnalysisStep()}
          {currentStep === 2 && renderResultsStep()}
          {currentStep === 3 && renderRoutineStep()}
        </div>
      </div>
    </div>
  );
};

export default MedicalSkincareAnalysisFlow;
