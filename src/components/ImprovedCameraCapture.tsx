import { useState, useRef, useEffect } from "react";
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
  Zap,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
import { createAnalysis, analyzeSkin } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AnalysisDashboard from "./AnalysisDashboard";

const ImprovedCameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Unknown");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

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

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      setCameraError(null);
      setVideoReady(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      console.log("Camera stream obtained:", mediaStream);
      setStream(mediaStream);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Unable to access camera. Please check permissions and try again.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip the image horizontally
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        
        // Stop camera
        stopCamera();
        
        // Start analysis
        startAnalysis();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          // Simulate analysis results
          setAnalysisData({
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
            ],
            confidenceLevel: "High",
            redFlags: [],
            analysisSummary: "Your skin shows good overall health with some areas for improvement.",
            disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice."
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const persistAnalysis = async (analysisResults: any) => {
    if (!user) {
      setSaveError("Please log in to save your analysis");
      return;
    }

    try {
      const analysisData = {
        userId: user.id,
        imageData: capturedImage,
        analysisResults: analysisResults,
        timestamp: new Date().toISOString(),
        ...analysisResults
      };

      const response = await createAnalysis(analysisData);
      if (response.success) {
        setSavedId(response.analysisId);
        setSaveError(null);
      } else {
        setSaveError("Failed to save analysis");
      }
    } catch (error) {
      console.error("Error saving analysis:", error);
      setSaveError("Failed to save analysis");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisData(null);
    setAnalysisProgress(0);
    setSaveError(null);
    setSavedId(null);
  };

  // Handle video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("Setting up video element with stream");
      const video = videoRef.current;
      
      video.srcObject = stream;
      
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded, attempting to play");
        video.play().catch(error => {
          console.error("Error playing video:", error);
          // Retry after a short delay
          setTimeout(() => {
            video.play().catch(console.error);
          }, 200);
        });
      };
      
      const handleCanPlay = () => {
        console.log("Video can play");
        setVideoReady(true);
        setCameraError(null);
      };
      
      const handleError = (error: any) => {
        console.error("Video error:", error);
        setCameraError("Video playback error. Please try again.");
        setVideoReady(false);
      };
      
      const handlePlaying = () => {
        console.log("Video is playing");
        setVideoReady(true);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
      };
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (analysisData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analysis Complete</h2>
            <p className="text-muted-foreground">Your skin analysis results are ready</p>
          </div>
          <Button onClick={retakePhoto} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </div>
        <AnalysisDashboard analysisData={analysisData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    AI Skin Analysis
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Capture your photo for instant AI-powered skin analysis
                  </p>
                </div>
              </div>
            </div>
            
      {/* Connection Status */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus.includes('Connected') ? 'bg-green-400' : 
                  connectionStatus.includes('Error') ? 'bg-red-400' : 'bg-yellow-400'
                } animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">Service Status:</span>
                <span className="text-sm font-semibold">{connectionStatus}</span>
        <Button 
          onClick={testConnection}
          variant="outline" 
          size="sm"
                  className="ml-2 h-7 px-3 text-xs"
        >
          Test Connection
        </Button>
                      </div>
                    </div>
                  </div>
                  
          {!capturedImage ? (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Capture Area */}
              <div className="space-y-6">
                {/* Main Capture Interface */}
                <div className="relative">
                  {showCamera ? (
                    <div className="relative group">
                      <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                          preload="metadata"
                          controls={false}
                        />
                        
                        {/* Modern Face Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative">
                            {/* Outer ring */}
                            <div className="w-80 h-80 border-4 border-white/60 rounded-full flex items-center justify-center animate-pulse">
                              {/* Inner ring */}
                              <div className="w-64 h-64 border-2 border-white/40 rounded-full flex items-center justify-center">
                                {/* Center dot */}
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                            {/* Corner guides */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white/60 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white/60 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white/60 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white/60 rounded-br-lg"></div>
                  </div>
                </div>
                
                        {/* Status Indicators */}
                        <div className="absolute top-4 left-4 space-y-2">
                          <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3" />
                            <span>Look Straight</span>
                          </div>
                          <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                            <User className="w-3 h-3" />
                            <span>Face Position</span>
                          </div>
                          <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                            <Lightbulb className="w-3 h-3" />
                            <span>Good Lighting</span>
                          </div>
                        </div>
                        
                        {/* Camera Error Overlay */}
                        {cameraError && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-center text-white p-6">
                              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                              <p className="text-lg font-semibold mb-2">Camera Error</p>
                              <p className="text-sm mb-4">{cameraError}</p>
                              <Button 
                                onClick={startCamera}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Camera
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Video Loading Indicator */}
                        {!videoReady && !cameraError && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-sm">Loading camera...</p>
                            </div>
                          </div>
                        )}
                </div>
              </div>
            ) : (
                    <div className="w-full h-96 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center group hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 transition-all duration-300 cursor-pointer"
                      onClick={startCamera}>
              <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-gray-700">Open Camera</div>
                          <div className="text-gray-500">Tap to start capturing</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-4">
                  {!showCamera && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-4">OR</div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full h-14 text-lg font-semibold border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                      >
                        <User className="w-6 h-6 mr-3" />
                        Upload Photo
                  </Button>
                    </div>
                  )}
                  
                  {showCamera && (
                    <div className="space-y-4">
                      <Button 
                        onClick={capturePhoto}
                        disabled={!videoReady || cameraError}
                        className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-6 h-6 mr-3" />
                        {!videoReady ? "Loading Camera..." : "Capture Photo"}
                      </Button>
                  <Button 
                        onClick={stopCamera}
                    variant="outline" 
                        className="w-full h-12 text-lg border-2"
                  >
                        <EyeOff className="w-5 h-5 mr-2" />
                        Stop Camera
                  </Button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Photo Guidelines</h3>
                      <p className="text-gray-600">Follow these tips for optimal analysis results</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Ensure good lighting</div>
                        <div className="text-gray-600 text-sm">Natural light preferred, avoid shadows</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Look directly at camera</div>
                        <div className="text-gray-600 text-sm">Keep your face centered in the frame</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Remove accessories</div>
                        <div className="text-gray-600 text-sm">Take off glasses and makeup if possible</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Neutral expression</div>
                        <div className="text-gray-600 text-sm">Keep a relaxed, natural facial expression</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-lg mb-2">Privacy Notice</div>
                      <div className="text-blue-100 leading-relaxed">
                        Your image will be analyzed securely and deleted after processing. 
                        We use advanced AI to provide personalized skincare recommendations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Photo Captured!</h2>
                        <p className="text-gray-600">Your photo is ready for AI-powered skin analysis</p>
                      </div>
                      
            <div className="flex justify-center">
              <img
                src={capturedImage}
                alt="Captured face"
                          className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-lg"
              />
            </div>

                      {isAnalyzing ? (
              <div className="space-y-4">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <div className="space-y-2">
                            <div className="text-xl font-semibold text-gray-700">Analyzing Your Skin...</div>
                            <Progress value={analysisProgress} className="h-3 max-w-md mx-auto" />
                            <p className="text-sm text-gray-500">
                    {analysisProgress < 30 && "Detecting facial features..."}
                    {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing skin texture..."}
                    {analysisProgress >= 60 && analysisProgress < 90 && "Evaluating skin concerns..."}
                    {analysisProgress >= 90 && "Generating recommendations..."}
                  </p>
                </div>
              </div>
                      ) : (
            <div className="flex justify-center space-x-4">
                          <Button onClick={retakePhoto} variant="outline" className="h-12 px-6">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
                          <Button onClick={startAnalysis} className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600">
                            <Zap className="w-4 h-4 mr-2" />
                            Start Analysis
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      )}

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{saveError}</span>
          </div>
        </div>
      )}

      {/* Success Display */}
      {savedId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">Analysis saved successfully!</span>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedCameraCapture;