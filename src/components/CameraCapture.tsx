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

const CameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
                      onClick={() => fileInputRef.current?.click()}
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
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-gradient-primary"
                    disabled={isAnalyzing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {capturedImage ? "Retake Photo" : "Capture Photo"}
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
    </section>
  );
};

export default CameraCapture;