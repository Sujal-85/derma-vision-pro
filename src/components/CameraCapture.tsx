import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  User,
  Zap
} from "lucide-react";
import { createAnalysis, analyzeSkin } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AnalysisDashboard from "./AnalysisDashboard";

const CameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Unknown");

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/skin/test');
      if (response.ok) {
        setConnectionStatus("Connected ✅");
      } else {
        setConnectionStatus("Backend Error ❌");
      }
    } catch (error) {
      setConnectionStatus("Disconnected ❌");
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        startAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to canvas
        ctx?.drawImage(video, 0, 0);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataURL);
        
        // Stop the camera
        stream.getTracks().forEach(track => track.stop());
        
        // Start analysis
        startAnalysis();
      });
    } catch (error) {
      console.error('Camera access failed:', error);
      setSaveError('Camera access failed. Please use file upload instead.');
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          // After fake analysis completes, persist to backend
          void persistAnalysis();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const persistAnalysis = async () => {
    if (!capturedImage) return;
    setSaveError(null);
    try {
      // Call medical-grade Python analyzer via Node proxy
      let analysisResults: any | null = null;
      try {
        console.log("Starting skin analysis...");
        analysisResults = await analyzeSkin({ imageDataUrl: capturedImage });
        console.log("Analysis results received:", analysisResults);
      } catch (e) {
        console.error("Analysis failed:", e);
        setSaveError(`Medical analysis failed: ${e instanceof Error ? e.message : 'Unknown error'}. Please check if all services are running.`);
        return;
      }

      if (!analysisResults) {
        setSaveError("No analysis results received. Please try again.");
        return;
      }

      // Use real medical-grade analysis results
      const payload = {
        userId: user?.id ?? null,
        imageDataUrl: capturedImage,
        metrics: {
          hydration: analysisResults.metrics?.hydration || 0,
          elasticity: analysisResults.metrics?.elasticity || 0,
          uvProtection: analysisResults.metrics?.uvProtection || 0,
          texture: analysisResults.metrics?.texture || 0,
          overallScore: analysisResults.metrics?.overallScore || 0,
        },
        concerns: analysisResults.concerns || [],
        recommendations: analysisResults.recommendations || [],
        // Store additional medical-grade data
        detailedAnalysis: analysisResults.detailed_analysis,
        redFlags: analysisResults.red_flags || [],
        confidenceLevel: analysisResults.confidence_level,
        analysisSummary: analysisResults.analysis_summary,
        disclaimer: analysisResults.disclaimer,
      };
      
      const res = await createAnalysis(payload);
      setSavedId(res._id);
      setAnalysisData(analysisResults);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save analysis");
    }
  };

  const captureGuidelines = [
    {
      icon: Lightbulb,
      title: "Good Lighting",
      description: "Use natural light or bright indoor lighting",
      status: "optimal"
    },
    {
      icon: User,
      title: "Face Position",
      description: "Center your face in the frame",
      status: "good"
    },
    {
      icon: Camera,
      title: "Image Quality",
      description: "Hold steady for sharp focus",
      status: "optimal"
    }
  ];

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI Skin Analysis</h2>
            <p className="text-lg text-muted-foreground">
              Upload a clear photo of your face for professional-grade skin analysis
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Capture Area */}
            <Card className="overflow-hidden bg-gradient-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span>Image Capture</span>
                </CardTitle>
                <CardDescription>
                  Take or upload a clear photo of your face
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Service Status:</span>
                  <span className="text-sm font-medium">{connectionStatus}</span>
                  <Button 
                    onClick={testConnection}
                    variant="outline" 
                    size="sm"
                    className="ml-2"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Preview or Capture Zone */}
                <div className="relative">
                  {capturedImage ? (
                    <div className="relative">
                      <img 
                        src={capturedImage} 
                        alt="Captured for analysis"
                        className="w-full h-64 object-cover rounded-lg border-2 border-border"
                      />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center space-y-2">
                            <div className="w-8 h-8 mx-auto">
                              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                            </div>
                            <div className="text-sm font-medium">Analyzing...</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="w-full h-64 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center bg-accent/10 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={handleCameraCapture}
                    >
                      <div className="text-center space-y-2">
                        <Camera className="w-12 h-12 mx-auto text-primary/60" />
                        <div className="text-sm font-medium text-muted-foreground">
                          Click to capture or upload image
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analysis Progress</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCameraCapture}
                    className="flex-1 bg-gradient-primary"
                    disabled={isAnalyzing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {capturedImage ? "Retake Photo" : "Capture Photo"}
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={isAnalyzing}
                  >
                    Upload File
                  </Button>
                  {capturedImage && !isAnalyzing && (
                    <Button variant="outline" onClick={startAnalysis}>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Guidelines & Tips */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">Capture Guidelines</CardTitle>
                  <CardDescription>
                    Follow these tips for optimal analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {captureGuidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${guideline.status === 'optimal' ? 'bg-success/10' : 'bg-warning/10'}
                      `}>
                        <guideline.icon className={`
                          w-4 h-4 
                          ${guideline.status === 'optimal' ? 'text-success' : 'text-warning'}
                        `} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{guideline.title}</span>
                          <Badge 
                            variant={guideline.status === 'optimal' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {guideline.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {guideline.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Analysis Complete */}
              {capturedImage && analysisProgress === 100 && (
                <Card className="bg-success/5 border-success/20 shadow-card-hover animate-fade-in">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-success" />
                      <div>
                        <div className="font-medium text-success">Analysis Complete!</div>
                        <div className="text-sm text-muted-foreground">
                          Your personalized skin report is ready
                        </div>
                      </div>
                    </div>
                    {savedId && (
                      <div className="text-xs text-muted-foreground mt-2">Saved ID: {savedId}</div>
                    )}
                    {saveError && (
                      <div className="text-xs text-red-600 mt-2">{saveError}</div>
                    )}
                    <Button className="w-full mt-4 bg-gradient-primary">
                      View Detailed Results
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Medical-Grade Analysis Dashboard */}
      {analysisData && (
        <div className="mt-16">
          <AnalysisDashboard analysisData={analysisData} />
        </div>
      )}
    </section>
  );
};

export default CameraCapture;