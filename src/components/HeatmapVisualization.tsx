import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  BarChart3, 
  Download,
  ArrowLeft,
  ArrowRight,
  Eye,
  AlertTriangle
} from "lucide-react";

interface SkinConcern {
  type: string;
  percentage: number;
  color: string;
  areas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;
  }>;
}

interface HeatmapVisualizationProps {
  imageData: string;
  analysisResults: any;
  onBack: () => void;
  onNext: () => void;
}

const HeatmapVisualization = ({ imageData, analysisResults, onBack, onNext }: HeatmapVisualizationProps) => {
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Generate mock skin concerns based on analysis results
  const skinConcerns: SkinConcern[] = [
    {
      type: "Fine Wrinkles",
      percentage: 4,
      color: "#10B981",
      areas: [
        { x: 0.3, y: 0.2, width: 0.4, height: 0.1, intensity: 0.3 },
        { x: 0.2, y: 0.4, width: 0.6, height: 0.1, intensity: 0.2 }
      ]
    },
    {
      type: "Eye Wrinkles",
      percentage: 16,
      color: "#3B82F6",
      areas: [
        { x: 0.15, y: 0.35, width: 0.2, height: 0.15, intensity: 0.6 },
        { x: 0.65, y: 0.35, width: 0.2, height: 0.15, intensity: 0.5 }
      ]
    },
    {
      type: "Deep Wrinkles",
      percentage: 76,
      color: "#EF4444",
      areas: [
        { x: 0.2, y: 0.3, width: 0.6, height: 0.2, intensity: 0.8 },
        { x: 0.3, y: 0.5, width: 0.4, height: 0.1, intensity: 0.7 }
      ]
    },
    {
      type: "Dark Circles",
      percentage: 2,
      color: "#8B5CF6",
      areas: [
        { x: 0.15, y: 0.4, width: 0.2, height: 0.1, intensity: 0.1 },
        { x: 0.65, y: 0.4, width: 0.2, height: 0.1, intensity: 0.1 }
      ]
    },
    {
      type: "Eye Bags",
      percentage: 5,
      color: "#F59E0B",
      areas: [
        { x: 0.15, y: 0.45, width: 0.2, height: 0.08, intensity: 0.2 },
        { x: 0.65, y: 0.45, width: 0.2, height: 0.08, intensity: 0.2 }
      ]
    },
    {
      type: "Pores",
      percentage: 4,
      color: "#06B6D4",
      areas: [
        { x: 0.3, y: 0.6, width: 0.4, height: 0.15, intensity: 0.2 }
      ]
    },
    {
      type: "Pigmentation",
      percentage: 5,
      color: "#84CC16",
      areas: [
        { x: 0.25, y: 0.55, width: 0.5, height: 0.1, intensity: 0.3 }
      ]
    },
    {
      type: "Redness",
      percentage: 96,
      color: "#F97316",
      areas: [
        { x: 0.1, y: 0.2, width: 0.8, height: 0.6, intensity: 0.9 }
      ]
    },
    {
      type: "Oiliness",
      percentage: 28,
      color: "#EC4899",
      areas: [
        { x: 0.2, y: 0.6, width: 0.6, height: 0.2, intensity: 0.4 }
      ]
    }
  ];

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the original image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (showHeatmap) {
      // Draw heatmap overlays
      skinConcerns.forEach(concern => {
        if (selectedConcern && selectedConcern !== concern.type) return;

        concern.areas.forEach(area => {
          const x = area.x * canvas.width;
          const y = area.y * canvas.height;
          const width = area.width * canvas.width;
          const height = area.height * canvas.height;

          // Create gradient for heatmap effect
          const gradient = ctx.createRadialGradient(
            x + width / 2, y + height / 2, 0,
            x + width / 2, y + height / 2, Math.max(width, height) / 2
          );

          const alpha = area.intensity * 0.6;
          gradient.addColorStop(0, `${concern.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${concern.color}00`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, width, height);
        });
      });
    }
  };

  useEffect(() => {
    if (imageRef.current?.complete) {
      drawHeatmap();
    }
  }, [selectedConcern, showHeatmap]);

  const handleImageLoad = () => {
    drawHeatmap();
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const getConcernColor = (percentage: number) => {
    if (percentage >= 70) return "bg-red-100 text-red-800 border-red-200";
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (percentage >= 20) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getSeverityLevel = (percentage: number) => {
    if (percentage >= 70) return "High";
    if (percentage >= 40) return "Moderate";
    if (percentage >= 20) return "Mild";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Skin Analysis Results</h1>
                <p className="text-muted-foreground">
                  AI-powered analysis of your skin concerns with heatmap visualization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={toggleHeatmap}>
                <Eye className="w-4 h-4 mr-2" />
                {showHeatmap ? "Hide" : "Show"} Heatmap
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image with Heatmap */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Skin Analysis Visualization</span>
                  </CardTitle>
                  <CardDescription>
                    Heatmap showing detected skin concerns and their intensity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={imageData}
                      alt="Skin analysis"
                      className="w-full h-auto rounded-lg"
                      onLoad={handleImageLoad}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                    />
                    
                    {/* Analysis Summary Overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900">Skin Health</div>
                      <div className="text-2xl font-bold text-primary">75%</div>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900">Skin Age</div>
                      <div className="text-2xl font-bold text-primary">27</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Overall Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Skin Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-primary">75%</div>
                    <Progress value={75} className="h-3" />
                    <div className="text-sm text-muted-foreground">
                      Based on comprehensive AI analysis
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skin Concerns */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detected Skin Concerns</CardTitle>
                  <CardDescription>
                    Click on a concern to highlight it on the image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skinConcerns.map((concern) => (
                      <div
                        key={concern.type}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedConcern === concern.type
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedConcern(
                          selectedConcern === concern.type ? null : concern.type
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: concern.color }}
                            />
                            <div>
                              <div className="font-medium text-sm">{concern.type}</div>
                              <div className="text-xs text-muted-foreground">
                                {getSeverityLevel(concern.percentage)} severity
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{concern.percentage}%</div>
                            <Progress 
                              value={concern.percentage} 
                              className="w-16 h-2 mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={onNext}
                  className="w-full bg-gradient-primary"
                >
                  Get Recommended Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save Report
                </Button>
              </div>

              {/* Medical Disclaimer */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-orange-900">Medical Disclaimer</div>
                      <div className="text-orange-700 mt-1">
                        This analysis is for informational purposes only and should not replace 
                        professional medical advice. Consult a dermatologist for serious concerns.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapVisualization;
