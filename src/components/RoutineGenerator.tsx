import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Download,
  Share,
  Clock,
  Droplets,
  Sun,
  Moon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveRoutine, getSavedRoutines, setActiveRoutine } from "@/lib/api";

interface RoutineStep {
  id: string;
  name: string;
  description: string;
  duration: string;
  frequency: string;
  products: Array<{
    name: string;
    brand: string;
    amount: string;
    purpose: string;
  }>;
  tips: string[];
  importance: "essential" | "recommended" | "optional";
}

interface GeneratedRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  weekly: RoutineStep[];
  skinType: string;
  concerns: string[];
  estimatedTime: {
    morning: string;
    evening: string;
  };
  totalCost: number;
  effectiveness: number;
}

interface RoutineGeneratorProps {
  userProfile: any;
  skinAnalysis: any;
  selectedProducts: any[];
  onBack: () => void;
}

const RoutineGenerator = ({ userProfile, skinAnalysis, selectedProducts, onBack }: RoutineGeneratorProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedRoutine, setGeneratedRoutine] = useState<GeneratedRoutine | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);

  // Load saved routines on component mount
  useEffect(() => {
    const loadSavedRoutines = async () => {
      if (!user?.id) return;
      
      try {
        const routines = await getSavedRoutines(user.id);
        setSavedRoutines(routines);
      } catch (error) {
        console.error('Failed to load saved routines:', error);
      }
    };

    loadSavedRoutines();
  }, [user?.id]);

  useEffect(() => {
    // Simulate AI routine generation
    const generateRoutine = async () => {
      setIsGenerating(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate routine based on user data
      const routine: GeneratedRoutine = {
        morning: [
          {
            id: "1",
            name: "Gentle Cleanser",
            description: "Remove overnight buildup and prepare skin for products",
            duration: "1-2 minutes",
            frequency: "Daily",
            products: [
              {
                name: "Clean Skin Gel Cleanser",
                brand: "CeraVe",
                amount: "Pea-sized amount",
                purpose: "Gentle cleansing without stripping"
              }
            ],
            tips: [
              "Use lukewarm water",
              "Massage gently in circular motions",
              "Rinse thoroughly"
            ],
            importance: "essential"
          },
          {
            id: "2",
            name: "Vitamin C Serum",
            description: "Brighten skin and protect against environmental damage",
            duration: "30 seconds",
            frequency: "Daily",
            products: [
              {
                name: "Anti-Pigment Combi Bundle",
                brand: "The Ordinary",
                amount: "2-3 drops",
                purpose: "Antioxidant protection and brightening"
              }
            ],
            tips: [
              "Apply to dry skin",
              "Wait 5 minutes before next step",
              "Use before sunscreen"
            ],
            importance: "essential"
          },
          {
            id: "3",
            name: "Moisturizer",
            description: "Hydrate and protect skin barrier",
            duration: "1 minute",
            frequency: "Daily",
            products: [
              {
                name: "Active Eye Cream",
                brand: "Kiehl's",
                amount: "Pea-sized amount",
                purpose: "Hydration and barrier protection"
              }
            ],
            tips: [
              "Apply while skin is slightly damp",
              "Focus on dry areas",
              "Don't forget neck and décolletage"
            ],
            importance: "essential"
          },
          {
            id: "4",
            name: "Sunscreen",
            description: "Protect against UV damage and premature aging",
            duration: "1 minute",
            frequency: "Daily",
            products: [
              {
                name: "Bright Mineral Sunscreen SPF 30",
                brand: "EltaMD",
                amount: "1/4 teaspoon for face",
                purpose: "UV protection and anti-aging"
              }
            ],
            tips: [
              "Apply 15 minutes before sun exposure",
              "Reapply every 2 hours",
              "Use even on cloudy days"
            ],
            importance: "essential"
          }
        ],
        evening: [
          {
            id: "5",
            name: "Double Cleanse",
            description: "Remove makeup, sunscreen, and daily buildup",
            duration: "3-4 minutes",
            frequency: "Daily",
            products: [
              {
                name: "Clean Skin Gel Cleanser",
                brand: "CeraVe",
                amount: "Pea-sized amount",
                purpose: "Thorough cleansing"
              }
            ],
            tips: [
              "First cleanse removes makeup/sunscreen",
              "Second cleanse cleans skin",
              "Use gentle circular motions"
            ],
            importance: "essential"
          },
          {
            id: "6",
            name: "Retinol Treatment",
            description: "Target fine lines and improve skin texture",
            duration: "30 seconds",
            frequency: "3x per week",
            products: [
              {
                name: "Anti-Aging Serum with Peptides",
                brand: "Olay",
                amount: "Pea-sized amount",
                purpose: "Anti-aging and texture improvement"
              }
            ],
            tips: [
              "Start with 2x per week",
              "Apply to dry skin",
              "Avoid eye area initially"
            ],
            importance: "recommended"
          },
          {
            id: "7",
            name: "Night Moisturizer",
            description: "Intensive hydration and repair",
            duration: "1 minute",
            frequency: "Daily",
            products: [
              {
                name: "Active Eye Cream",
                brand: "Kiehl's",
                amount: "Generous amount",
                purpose: "Overnight hydration and repair"
              }
            ],
            tips: [
              "Apply thicker layer at night",
              "Focus on dry areas",
              "Allow to absorb before bed"
            ],
            importance: "essential"
          }
        ],
        weekly: [
          {
            id: "8",
            name: "Exfoliating Treatment",
            description: "Remove dead skin cells and improve texture",
            duration: "5-10 minutes",
            frequency: "1-2x per week",
            products: [
              {
                name: "Clean 24-Hr Cream Eyeshadow",
                brand: "Glossier",
                amount: "Thin layer",
                purpose: "Gentle exfoliation"
              }
            ],
            tips: [
              "Start with once per week",
              "Avoid on retinol nights",
              "Follow with extra moisturizer"
            ],
            importance: "recommended"
          },
          {
            id: "9",
            name: "Hydrating Mask",
            description: "Intensive hydration and skin repair",
            duration: "15-20 minutes",
            frequency: "1x per week",
            products: [
              {
                name: "Glowscreen Sunscreen SPF 40",
                brand: "Supergoop!",
                amount: "Generous layer",
                purpose: "Deep hydration"
              }
            ],
            tips: [
              "Use on non-exfoliation days",
              "Apply to clean, dry skin",
              "Remove with warm water"
            ],
            importance: "optional"
          }
        ],
        skinType: userProfile?.skinType || "combination",
        concerns: skinAnalysis?.concerns?.map((c: any) => c.type) || [],
        estimatedTime: {
          morning: "5-7 minutes",
          evening: "8-10 minutes"
        },
        totalCost: 245,
        effectiveness: 87
      };
      
      setGeneratedRoutine(routine);
      setIsGenerating(false);
    };

    generateRoutine();
  }, [userProfile, skinAnalysis, selectedProducts]);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "essential": return "bg-red-100 text-red-800 border-red-200";
      case "recommended": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "optional": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "essential": return <AlertCircle className="w-4 h-4" />;
      case "recommended": return <CheckCircle className="w-4 h-4" />;
      case "optional": return <Heart className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleSaveRoutine = async () => {
    if (!user?.id || !generatedRoutine) return;
    
    setSaving(true);
    try {
      const routineToSave = {
        name: `Routine for ${generatedRoutine.skinType} skin`,
        description: `Personalized routine targeting: ${generatedRoutine.concerns.join(', ')}`,
        routine: {
          morning: generatedRoutine.morning,
          evening: generatedRoutine.evening,
          weekly: generatedRoutine.weekly,
        },
        skinType: generatedRoutine.skinType,
        concerns: generatedRoutine.concerns,
        estimatedTime: generatedRoutine.estimatedTime,
        totalCost: generatedRoutine.totalCost,
        effectiveness: generatedRoutine.effectiveness,
      };
      
      const savedRoutine = await saveRoutine(user.id, routineToSave);
      setSavedRoutines(prev => [...prev, savedRoutine]);
      
      // Optionally set as active routine
      await setActiveRoutine(user.id, savedRoutine.id);
      
      alert('Routine saved successfully!');
    } catch (error) {
      console.error('Failed to save routine:', error);
      alert('Failed to save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto">
                <Sparkles className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Generating Your Routine</h2>
                <p className="text-muted-foreground">
                  Our AI is analyzing your skin profile and creating a personalized skincare routine...
                </p>
              </div>
              <Progress value={75} className="h-2" />
              <div className="text-sm text-muted-foreground">
                This may take a few moments
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!generatedRoutine) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {/* <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button> */}
              <div>
                <h1 className="text-3xl font-bold">Your Personalized Skincare Routine</h1>
                <p className="text-muted-foreground">
                  AI-generated routine tailored to your skin type and concerns
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Routine Summary */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{generatedRoutine.estimatedTime.morning}</div>
                <div className="text-sm text-muted-foreground">Morning Routine</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Moon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{generatedRoutine.estimatedTime.evening}</div>
                <div className="text-sm text-muted-foreground">Evening Routine</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{generatedRoutine.effectiveness}%</div>
                <div className="text-sm text-muted-foreground">Effectiveness</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Droplets className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">${generatedRoutine.totalCost}</div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </CardContent>
            </Card>
          </div>

          {/* Routine Tabs */}
          <Tabs defaultValue="morning" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="morning" className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <span>Morning</span>
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center space-x-2">
                <Moon className="w-4 h-4" />
                <span>Evening</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Weekly</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="morning" className="space-y-4">
              {generatedRoutine.morning.map((step, index) => (
                <Card key={step.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{step.name}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <Badge className={getImportanceColor(step.importance)}>
                        {getImportanceIcon(step.importance)}
                        <span className="ml-1 capitalize">{step.importance}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Tips & Instructions</h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="evening" className="space-y-4">
              {generatedRoutine.evening.map((step, index) => (
                <Card key={step.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{step.name}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <Badge className={getImportanceColor(step.importance)}>
                        {getImportanceIcon(step.importance)}
                        <span className="ml-1 capitalize">{step.importance}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Tips & Instructions</h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              {generatedRoutine.weekly.map((step, index) => (
                <Card key={step.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{step.name}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <Badge className={getImportanceColor(step.importance)}>
                        {getImportanceIcon(step.importance)}
                        <span className="ml-1 capitalize">{step.importance}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Tips & Instructions</h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              Back to Products
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Routine
              </Button>
              <Button 
                onClick={handleSaveRoutine}
                disabled={saving}
                className="bg-gradient-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Routine'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineGenerator;
