import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  User,
  Zap,
  ArrowLeft
} from "lucide-react";

interface ModernFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onBack: () => void;
  isAnalyzing?: boolean;
  analysisError?: string | null;
}

const ModernFaceCapture = ({ onCapture, onBack, isAnalyzing = false, analysisError = null }: ModernFaceCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [guidelines, setGuidelines] = useState({
    lookStraight: false,
    facePosition: false,
    lighting: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Stream changed, updating video element...');
      setVideoReady(false);
      setCameraError(null);
      videoRef.current.srcObject = stream;
      
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded, attempting to play...');
        video.play().then(() => {
          console.log('Video playing successfully');
          setVideoReady(true);
        }).catch(err => {
          console.error('Auto-play failed:', err);
          setCameraError('Video playback failed');
          // Try to play again after a short delay
          setTimeout(() => {
            video.play().then(() => {
              setVideoReady(true);
              setCameraError(null);
            }).catch(err2 => {
              console.error('Delayed play failed:', err2);
              setCameraError('Video playback failed after retry');
            });
          }, 100);
        });
      };

      const handleError = (e: Event) => {
        console.error('Video error:', e);
        setCameraError('Video stream error');
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      
      // If metadata is already loaded, try to play immediately
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsStartingCamera(true);
    setCameraError(null);
    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setIsCapturing(true);
      setIsStartingCamera(false);
    } catch (error: any) {
      console.error('Camera access failed:', error);
      setIsStartingCamera(false);
      setCameraError(error.message || 'Camera access failed');
      alert(`Camera access failed: ${error.message || 'Unknown error'}. Please check your camera permissions and try again.`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const proceedWithAnalysis = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  // Simulate guideline checking with more realistic face detection
  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        setGuidelines(prev => ({
          lookStraight: Math.random() > 0.2, // More likely to be good
          facePosition: Math.random() > 0.3, // More likely to be good
          lighting: Math.random() > 0.1 // More likely to be good
        }));
      }, 800); // Faster updates for better responsiveness

      return () => clearInterval(interval);
    }
  }, [isCapturing]);

  const allGuidelinesMet = guidelines.lookStraight && guidelines.facePosition && guidelines.lighting;
  const canCapture = videoReady && allGuidelinesMet && !cameraError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Button variant="ghost" onClick={onBack} className="absolute left-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Capture Your Photo
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Take a clear photo of your face for AI-powered skin analysis
                  </p>
                  {isAnalyzing && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-blue-700 font-medium">Analyzing your skin...</span>
                      </div>
                    </div>
                  )}
                  {analysisError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{analysisError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Capture Area */}
            <div className="space-y-6">
              {/* Main Capture Interface */}
                <div className="relative">
                  {capturedImage ? (
                  <div className="relative group">
                    <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                      <img 
                        src={capturedImage} 
                        alt="Captured for analysis"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent rounded-3xl flex items-end justify-center pb-6">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-green-800">Photo Captured!</span>
                      </div>
                    </div>
                  </div>
                ) : isStartingCamera ? (
                  <div className="w-full h-96 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div className="space-y-2">
                        <div className="text-xl font-semibold text-gray-700">Starting Camera...</div>
                        <div className="text-sm text-gray-500">Please allow camera access</div>
                        </div>
                      </div>
                    </div>
                  ) : isCapturing ? (
                  <div className="relative group">
                    <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                        onLoadStart={() => console.log('Video load started')}
                        onLoadedData={() => console.log('Video data loaded')}
                        onCanPlay={() => console.log('Video can play')}
                        onPlay={() => console.log('Video playing')}
                        onError={(e) => console.error('Video error:', e)}
                      />
                      {/* Camera Status Info */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
                        Stream: {stream ? 'Active' : 'None'} | 
                        Video: {videoReady ? 'Ready' : 'Loading'} |
                        Error: {cameraError || 'None'}
                      </div>
                      
                      {/* Camera Error Overlay */}
                      {cameraError && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <div className="bg-red-500 text-white p-4 rounded-lg text-center">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-semibold">Camera Error</div>
                            <div className="text-sm">{cameraError}</div>
                            <Button 
                              onClick={startCamera}
                              className="mt-3 bg-white text-red-500 hover:bg-gray-100"
                              size="sm"
                            >
                              Retry Camera
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                    {/* Face Detection Status */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`w-4 h-4 rounded-full ${allGuidelinesMet ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                              {allGuidelinesMet && (
                                <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75"></div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                {!videoReady ? 'Camera Loading...' : allGuidelinesMet ? 'Face Detected ✓' : 'Positioning Face...'}
                              </div>
                              <div className="text-xs text-white/70">
                                {!videoReady ? 'Please wait for camera to initialize' : allGuidelinesMet ? 'Perfect! Ready to capture' : 'Center your face in the frame'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/70">AI Processing</div>
                            <div className="flex space-x-1 mt-1">
                              <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                        </div>
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
                  {!capturedImage ? (
                  <div className="space-y-4">
                    {!isCapturing && !isStartingCamera && (
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-4">OR</div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                          className="w-full h-14 text-lg font-semibold border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                      >
                          <Upload className="w-6 h-6 mr-3" />
                          Upload Photo
                      </Button>
                      </div>
                    )}
                  </div>
                  ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={retakePhoto}
                        variant="outline"
                      className="h-14 text-lg font-semibold border-2 hover:bg-gray-50"
                      >
                      <RotateCcw className="w-5 h-5 mr-2" />
                        Retake
                      </Button>
                      <Button 
                        onClick={proceedWithAnalysis}
                      className="h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      >
                      <Zap className="w-5 h-5 mr-2" />
                        Analyze
                      </Button>
                  </div>
                  )}

                {isCapturing && (
                  <div className="space-y-4">
                  <Button 
                    onClick={capturePhoto}
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl"
                      disabled={!canCapture}
                    >
                      <Camera className="w-6 h-6 mr-3" />
                      {canCapture ? "Capture Photo" : !videoReady ? "Camera Loading..." : !allGuidelinesMet ? "Position Face Correctly" : "Camera Error"}
                    </Button>
                    <Button 
                      onClick={stopCamera}
                      variant="outline"
                      className="w-full h-12 text-lg border-2"
                    >
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
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">Remove glasses</div>
                      <div className="text-gray-600 mt-1">
                        Take off glasses, sunglasses, or any accessories that cover your face
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">Clean your face</div>
                      <div className="text-gray-600 mt-1">
                        Remove makeup and ensure your face is clean and dry
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">Ensure good lighting</div>
                      <div className="text-gray-600 mt-1">
                        Use natural lighting or bright, even indoor lighting
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">Neutral expression</div>
                      <div className="text-gray-600 mt-1">
                        Keep a neutral expression and center your face in the frame
                      </div>
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
        </div>
      </div>
    </div>
  );
};

export default ModernFaceCapture;
