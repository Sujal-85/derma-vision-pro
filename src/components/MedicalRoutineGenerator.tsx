import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Save,
  Shield,
  Activity,
  Target,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveRoutine, getSavedRoutines, setActiveRoutine, recommendProducts } from "@/lib/api";

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
  detailed_analysis?: {
    skin_tone_analysis?: any;
    texture_analysis?: any;
    hyperpigmentation_analysis?: any;
    wrinkle_analysis?: any;
    redness_analysis?: any;
  };
  red_flags?: string[];
  confidence_level?: string;
  analysis_summary?: string;
  disclaimer?: string;
}

interface MedicalRoutineStep {
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
    ingredient_focus?: string;
    medical_benefit?: string;
  }>;
  tips: string[];
  importance: "critical" | "essential" | "recommended" | "optional";
  medical_rationale: string;
  contraindications?: string[];
}

interface MedicalRoutine {
  morning: MedicalRoutineStep[];
  evening: MedicalRoutineStep[];
  weekly: MedicalRoutineStep[];
  emergency: MedicalRoutineStep[];
  skinType: string;
  concerns: string[];
  estimatedTime: {
    morning: string;
    evening: string;
  };
  totalCost: number;
  effectiveness: number;
  medical_priority: "high" | "medium" | "low";
  follow_up_required: boolean;
  dermatologist_recommended: boolean;
}

interface MedicalRoutineGeneratorProps {
  analysisData: MedicalAnalysisData;
  userProfile?: any;
  onBack: () => void;
}

const MedicalRoutineGenerator = ({ analysisData, userProfile, onBack }: MedicalRoutineGeneratorProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedRoutine, setGeneratedRoutine] = useState<MedicalRoutine | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  // Load saved routines and recommended products on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        // Load saved routines
        const routines = await getSavedRoutines(user.id);
        setSavedRoutines(routines);

        // Get recommended products based on analysis
        const productRecommendations = await recommendProducts({
          skinType: determineSkinType(analysisData),
          concern: analysisData.concerns[0]?.type || 'general',
          ageRange: userProfile?.ageRange || 'adult'
        });
        setRecommendedProducts(productRecommendations.products || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [user?.id, analysisData, userProfile]);

  useEffect(() => {
    // Generate medical-grade routine based on real analysis data
    const generateMedicalRoutine = async () => {
      setIsGenerating(true);
      
      // Simulate processing time for medical analysis
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const routine: MedicalRoutine = generateRoutineFromAnalysis(analysisData, recommendedProducts);
      setGeneratedRoutine(routine);
      setIsGenerating(false);
    };

    generateMedicalRoutine();
  }, [analysisData, recommendedProducts]);

  const determineSkinType = (analysis: MedicalAnalysisData): string => {
    const { metrics } = analysis;
    
    if (metrics.hydration < 40 && metrics.texture < 50) {
      return "dry";
    } else if (metrics.hydration > 70 && metrics.texture > 70) {
      return "oily";
    } else if (metrics.hydration < 50 && metrics.texture > 60) {
      return "combination";
    } else if (analysis.concerns.some(c => c.type.includes("Inflammation") || c.type.includes("Redness"))) {
      return "sensitive";
    }
    return "normal";
  };

  const generateRoutineFromAnalysis = (analysis: MedicalAnalysisData, products: any[]): MedicalRoutine => {
    const skinType = determineSkinType(analysis);
    const primaryConcerns = analysis.concerns.map(c => c.type);
    const hasHighSeverity = analysis.concerns.some(c => c.severity === "High");
    
    // Determine medical priority
    const medical_priority = hasHighSeverity || analysis.red_flags?.length > 0 ? "high" : 
                           analysis.concerns.length > 3 ? "medium" : "low";

    const morning: MedicalRoutineStep[] = [];
    const evening: MedicalRoutineStep[] = [];
    const weekly: MedicalRoutineStep[] = [];
    const emergency: MedicalRoutineStep[] = [];

    // Morning routine based on analysis
    morning.push({
      id: "1",
      name: "Gentle Medical Cleanser",
      description: "Remove overnight buildup while preserving skin barrier",
      duration: "1-2 minutes",
      frequency: "Daily",
      products: [{
        name: "Hydrating Facial Cleanser",
        brand: "CeraVe",
        amount: "Pea-sized amount",
        purpose: "Gentle cleansing without stripping",
        ingredient_focus: "Ceramides, Hyaluronic Acid",
        medical_benefit: "Maintains skin barrier integrity"
      }],
      tips: [
        "Use lukewarm water (not hot)",
        "Massage gently in circular motions",
        "Rinse thoroughly with cool water"
      ],
      importance: "essential",
      medical_rationale: "Essential for removing overnight buildup while maintaining skin barrier function"
    });

    // Add Vitamin C for hyperpigmentation concerns
    if (analysis.concerns.some(c => c.type.includes("Hyperpigmentation") || c.type.includes("Dark Spots"))) {
      morning.push({
        id: "2",
        name: "Vitamin C Antioxidant Serum",
        description: "Target hyperpigmentation and provide antioxidant protection",
        duration: "30 seconds",
        frequency: "Daily",
        products: [{
          name: "Vitamin C Serum 20%",
          brand: "The Ordinary",
          amount: "2-3 drops",
          purpose: "Antioxidant protection and brightening",
          ingredient_focus: "L-Ascorbic Acid, Vitamin E",
          medical_benefit: "Reduces hyperpigmentation and protects against free radicals"
        }],
        tips: [
          "Apply to dry skin",
          "Wait 5 minutes before next step",
          "Use before sunscreen for maximum protection"
        ],
        importance: "essential",
        medical_rationale: "Vitamin C inhibits melanin production and provides antioxidant protection against UV damage"
      });
    }

    // Add hydration step for dehydrated skin
    if (analysis.metrics.hydration < 50) {
      morning.push({
        id: "3",
        name: "Hyaluronic Acid Hydration",
        description: "Intensive hydration for dehydrated skin",
        duration: "30 seconds",
        frequency: "Daily",
        products: [{
          name: "Hyaluronic Acid 2% + B5",
          brand: "The Ordinary",
          amount: "2-3 drops",
          purpose: "Deep hydration",
          ingredient_focus: "Hyaluronic Acid, Vitamin B5",
          medical_benefit: "Increases skin moisture retention and improves elasticity"
        }],
        tips: [
          "Apply to damp skin",
          "Follow immediately with moisturizer",
          "Can be used morning and evening"
        ],
        importance: "essential",
        medical_rationale: "Hyaluronic acid can hold up to 1000x its weight in water, providing immediate hydration"
      });
    }

    // Moisturizer based on skin type
    morning.push({
      id: "4",
      name: "Medical-Grade Moisturizer",
      description: "Hydrate and protect skin barrier",
      duration: "1 minute",
      frequency: "Daily",
      products: [{
        name: skinType === "oily" ? "Oil-Free Moisturizer" : "Rich Moisturizing Cream",
        brand: "CeraVe",
        amount: "Pea-sized amount",
        purpose: "Hydration and barrier protection",
        ingredient_focus: "Ceramides, Niacinamide",
        medical_benefit: "Restores skin barrier and provides long-lasting hydration"
      }],
      tips: [
        "Apply while skin is slightly damp",
        "Focus on dry areas",
        "Don't forget neck and décolletage"
      ],
      importance: "essential",
      medical_rationale: "Essential for maintaining skin barrier function and preventing transepidermal water loss"
    });

    // Sunscreen - critical for all skin types
    morning.push({
      id: "5",
      name: "Broad-Spectrum Medical Sunscreen",
      description: "Protect against UV damage and prevent further skin damage",
      duration: "1 minute",
      frequency: "Daily",
      products: [{
        name: "Mineral Sunscreen SPF 50",
        brand: "EltaMD",
        amount: "1/4 teaspoon for face",
        purpose: "UV protection and anti-aging",
        ingredient_focus: "Zinc Oxide, Titanium Dioxide",
        medical_benefit: "Prevents UV-induced DNA damage and premature aging"
      }],
      tips: [
        "Apply 15 minutes before sun exposure",
        "Reapply every 2 hours",
        "Use even on cloudy days and indoors"
      ],
      importance: "critical",
      medical_rationale: "UV protection is the most important anti-aging and skin cancer prevention measure",
      contraindications: ["Allergic to zinc oxide or titanium dioxide"]
    });

    // Evening routine
    evening.push({
      id: "6",
      name: "Double Medical Cleanse",
      description: "Remove makeup, sunscreen, and daily buildup",
      duration: "3-4 minutes",
      frequency: "Daily",
      products: [{
        name: "Micellar Water + Gentle Cleanser",
        brand: "Bioderma + CeraVe",
        amount: "Cotton pad + pea-sized amount",
        purpose: "Thorough cleansing",
        ingredient_focus: "Micelles, Ceramides",
        medical_benefit: "Removes all traces of makeup and environmental pollutants"
      }],
      tips: [
        "First cleanse with micellar water",
        "Second cleanse with gentle cleanser",
        "Use gentle circular motions"
      ],
      importance: "essential",
      medical_rationale: "Double cleansing ensures complete removal of sunscreen and environmental pollutants"
    });

    // Add retinol for aging concerns
    if (analysis.concerns.some(c => c.type.includes("Wrinkles") || c.type.includes("Fine Lines"))) {
      evening.push({
        id: "7",
        name: "Medical Retinol Treatment",
        description: "Target fine lines and improve skin texture",
        duration: "30 seconds",
        frequency: "3x per week (start slowly)",
        products: [{
          name: "Retinol 0.5% in Squalane",
          brand: "The Ordinary",
          amount: "Pea-sized amount",
          purpose: "Anti-aging and texture improvement",
          ingredient_focus: "Retinol, Squalane",
          medical_benefit: "Increases cell turnover and stimulates collagen production"
        }],
        tips: [
          "Start with 1x per week",
          "Apply to dry skin",
          "Avoid eye area initially",
          "Always use sunscreen the next day"
        ],
        importance: "recommended",
        medical_rationale: "Retinol is the gold standard for anti-aging, proven to reduce fine lines and improve texture",
        contraindications: ["Pregnancy", "Breastfeeding", "Sensitive skin"]
      });
    }

    // Night moisturizer
    evening.push({
      id: "8",
      name: "Intensive Night Repair",
      description: "Overnight hydration and skin repair",
      duration: "1 minute",
      frequency: "Daily",
      products: [{
        name: "Night Repair Cream",
        brand: "CeraVe",
        amount: "Generous amount",
        purpose: "Overnight hydration and repair",
        ingredient_focus: "Ceramides, Peptides",
        medical_benefit: "Supports overnight skin repair and barrier restoration"
      }],
      tips: [
        "Apply thicker layer at night",
        "Focus on dry areas",
        "Allow to absorb before bed"
      ],
      importance: "essential",
      medical_rationale: "Nighttime is when skin repair is most active, making proper hydration crucial"
    });

    // Weekly treatments
    if (analysis.metrics.texture < 60) {
      weekly.push({
        id: "9",
        name: "Medical Exfoliation Treatment",
        description: "Improve skin texture and remove dead skin cells",
        duration: "5-10 minutes",
        frequency: "1-2x per week",
        products: [{
          name: "AHA 30% + BHA 2% Peeling Solution",
          brand: "The Ordinary",
          amount: "Thin layer",
          purpose: "Chemical exfoliation",
          ingredient_focus: "Glycolic Acid, Salicylic Acid",
          medical_benefit: "Removes dead skin cells and improves skin texture"
        }],
        tips: [
          "Start with once per week",
          "Avoid on retinol nights",
          "Follow with extra moisturizer",
          "Never exceed 10 minutes"
        ],
        importance: "recommended",
        medical_rationale: "Chemical exfoliation improves skin texture and allows better product penetration",
        contraindications: ["Sensitive skin", "Active breakouts", "Sunburn"]
      });
    }

    // Emergency treatments for high-priority concerns
    if (medical_priority === "high") {
      emergency.push({
        id: "10",
        name: "Immediate Medical Consultation",
        description: "Schedule appointment with dermatologist",
        duration: "30-60 minutes",
        frequency: "As needed",
        products: [],
        tips: [
          "Document all symptoms",
          "Bring photos of skin changes",
          "List all current products",
          "Ask about prescription treatments"
        ],
        importance: "critical",
        medical_rationale: "High-priority skin concerns require professional medical evaluation and treatment"
      });
    }

    return {
      morning,
      evening,
      weekly,
      emergency,
      skinType,
      concerns: primaryConcerns,
      estimatedTime: {
        morning: "5-7 minutes",
        evening: "6-8 minutes"
      },
      totalCost: calculateTotalCost([...morning, ...evening, ...weekly]),
      effectiveness: calculateEffectiveness(analysis),
      medical_priority,
      follow_up_required: medical_priority === "high" || analysis.red_flags?.length > 0,
      dermatologist_recommended: medical_priority === "high" || analysis.concerns.some(c => c.severity === "High")
    };
  };

  const calculateTotalCost = (steps: MedicalRoutineStep[]): number => {
    // Simplified cost calculation based on typical product prices
    const productCosts: { [key: string]: number } = {
      "CeraVe": 15,
      "The Ordinary": 8,
      "EltaMD": 25,
      "Bioderma": 12,
      "Kiehl's": 35
    };

    let total = 0;
    steps.forEach(step => {
      step.products.forEach(product => {
        const brand = product.brand;
        total += productCosts[brand] || 20; // Default price
      });
    });

    return total;
  };

  const calculateEffectiveness = (analysis: MedicalAnalysisData): number => {
    const baseScore = analysis.metrics.overallScore;
    const concernCount = analysis.concerns.length;
    const severityPenalty = analysis.concerns.filter(c => c.severity === "High").length * 5;
    
    return Math.max(60, Math.min(95, baseScore - concernCount * 2 - severityPenalty));
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "essential": return "bg-orange-100 text-orange-800 border-orange-200";
      case "recommended": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "optional": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "critical": return <AlertTriangle className="w-4 h-4" />;
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
        name: `Medical Routine for ${generatedRoutine.skinType} skin`,
        description: `Medical-grade routine targeting: ${generatedRoutine.concerns.join(', ')}`,
        routine: {
          morning: generatedRoutine.morning,
          evening: generatedRoutine.evening,
          weekly: generatedRoutine.weekly,
          emergency: generatedRoutine.emergency,
        },
        skinType: generatedRoutine.skinType,
        concerns: generatedRoutine.concerns,
        estimatedTime: generatedRoutine.estimatedTime,
        totalCost: generatedRoutine.totalCost,
        effectiveness: generatedRoutine.effectiveness,
        medical_priority: generatedRoutine.medical_priority,
        follow_up_required: generatedRoutine.follow_up_required,
        dermatologist_recommended: generatedRoutine.dermatologist_recommended,
        analysisData: analysisData
      };
      
      const savedRoutine = await saveRoutine(user.id, routineToSave);
      setSavedRoutines(prev => [...prev, savedRoutine]);
      
      // Set as active routine
      await setActiveRoutine(user.id, savedRoutine.id);
      
      alert('Medical routine saved successfully!');
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
                <h2 className="text-2xl font-bold mb-2">Generating Medical Routine</h2>
                <p className="text-muted-foreground">
                  Our medical AI is analyzing your skin analysis and creating a personalized medical-grade routine...
                </p>
              </div>
              <Progress value={85} className="h-2" />
              <div className="text-sm text-muted-foreground">
                Processing medical recommendations
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
                <h1 className="text-3xl font-bold">Medical-Grade Skincare Routine</h1>
                <p className="text-muted-foreground">
                  AI-generated routine based on your medical skin analysis
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

          {/* Medical Priority Alert */}
          {generatedRoutine.medical_priority === "high" && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>High Medical Priority:</strong> This routine addresses significant skin concerns. 
                {generatedRoutine.dermatologist_recommended && " Professional consultation is strongly recommended."}
              </AlertDescription>
            </Alert>
          )}

          {/* Medical Disclaimer */}
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Medical Disclaimer:</strong> This routine is based on AI analysis and should not replace professional medical advice. 
              {generatedRoutine.follow_up_required && " Please consult with a dermatologist for proper evaluation."}
            </AlertDescription>
          </Alert>

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
                <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{generatedRoutine.effectiveness}%</div>
                <div className="text-sm text-muted-foreground">Medical Effectiveness</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{generatedRoutine.medical_priority}</div>
                <div className="text-sm text-muted-foreground">Medical Priority</div>
              </CardContent>
            </Card>
          </div>

          {/* Routine Tabs */}
          <Tabs defaultValue="morning" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="emergency" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency</span>
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
                        <h4 className="font-medium mb-2">Medical Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                            {product.ingredient_focus && (
                              <div className="text-sm text-blue-600">Key Ingredients: {product.ingredient_focus}</div>
                            )}
                            {product.medical_benefit && (
                              <div className="text-sm text-green-600">Medical Benefit: {product.medical_benefit}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Medical Instructions</h4>
                        <ul className="space-y-1 mb-4">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                        <div className="text-sm text-blue-600 mb-2">
                          <strong>Medical Rationale:</strong> {step.medical_rationale}
                        </div>
                        {step.contraindications && (
                          <div className="text-sm text-red-600">
                            <strong>Contraindications:</strong> {step.contraindications.join(", ")}
                          </div>
                        )}
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
                        <h4 className="font-medium mb-2">Medical Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                            {product.ingredient_focus && (
                              <div className="text-sm text-blue-600">Key Ingredients: {product.ingredient_focus}</div>
                            )}
                            {product.medical_benefit && (
                              <div className="text-sm text-green-600">Medical Benefit: {product.medical_benefit}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Medical Instructions</h4>
                        <ul className="space-y-1 mb-4">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                        <div className="text-sm text-blue-600 mb-2">
                          <strong>Medical Rationale:</strong> {step.medical_rationale}
                        </div>
                        {step.contraindications && (
                          <div className="text-sm text-red-600">
                            <strong>Contraindications:</strong> {step.contraindications.join(", ")}
                          </div>
                        )}
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
                        <h4 className="font-medium mb-2">Medical Products</h4>
                        {step.products.map((product, idx) => (
                          <div key={idx} className="p-3 bg-accent/50 rounded-lg mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.brand}</div>
                            <div className="text-sm text-muted-foreground">Amount: {product.amount}</div>
                            <div className="text-sm text-muted-foreground">Purpose: {product.purpose}</div>
                            {product.ingredient_focus && (
                              <div className="text-sm text-blue-600">Key Ingredients: {product.ingredient_focus}</div>
                            )}
                            {product.medical_benefit && (
                              <div className="text-sm text-green-600">Medical Benefit: {product.medical_benefit}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Medical Instructions</h4>
                        <ul className="space-y-1 mb-4">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm text-muted-foreground mb-2">
                          <strong>Duration:</strong> {step.duration} | <strong>Frequency:</strong> {step.frequency}
                        </div>
                        <div className="text-sm text-blue-600 mb-2">
                          <strong>Medical Rationale:</strong> {step.medical_rationale}
                        </div>
                        {step.contraindications && (
                          <div className="text-sm text-red-600">
                            <strong>Contraindications:</strong> {step.contraindications.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              {generatedRoutine.emergency.length > 0 ? (
                generatedRoutine.emergency.map((step, index) => (
                  <Card key={step.id} className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-red-800">{step.name}</h3>
                            <p className="text-red-600">{step.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="ml-1">Critical</span>
                        </Badge>
                      </div>
                      
                      <div className="text-red-700">
                        <h4 className="font-medium mb-2">Immediate Actions Required</h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 p-3 bg-red-100 rounded-lg">
                          <div className="text-sm font-medium text-red-800">
                            Medical Rationale: {step.medical_rationale}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">No Emergency Actions Required</h3>
                    <p className="text-green-600">
                      Your skin analysis shows no critical concerns requiring immediate medical attention.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              Back to Analysis
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
                {saving ? 'Saving...' : 'Save Medical Routine'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRoutineGenerator;
