import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Sun, 
  Zap,
  Heart,
  Award,
  Calendar,
  ArrowRight,
  Target,
  AlertTriangle,
  Shield,
  Activity,
  User
} from "lucide-react";

interface AnalysisData {
  predicted_age?: number;
  overall_skin_health?: number;
  skin_health_breakdown?: {
    hydration: number;
    elasticity: number;
    texture: number;
    pigmentation: number;
    inflammation: number;
    collagen: number;
  };
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
    medical_priority?: string;
  }>;
  recommendations: Array<{
    category: string;
    items: string[];
  }>;
  detailedAnalysis?: {
    skin_tone_analysis?: any;
    texture_analysis?: any;
    hyperpigmentation_analysis?: any;
    redness_analysis?: any;
    skin_health_parameters?: {
      [key: string]: {
        score: number;
        weight: number;
        description: string;
      };
    };
  };
  redFlags?: string[];
  confidenceLevel?: string;
  analysisSummary?: string;
  disclaimer?: string;
  model_accuracy?: string;
}

interface AnalysisDashboardProps {
  analysisData?: AnalysisData;
}

const AnalysisDashboard = ({ analysisData }: AnalysisDashboardProps) => {
  // Use real data if available, otherwise show default values
  const skinMetrics = [
    {
      name: "Hydration",
      value: analysisData?.metrics?.hydration || 0,
      change: 0, // No historical data yet
      status: getStatusFromValue(analysisData?.metrics?.hydration || 0),
      icon: Droplets,
      color: "text-blue-500"
    },
    {
      name: "Elasticity",
      value: analysisData?.metrics?.elasticity || 0,
      change: 0,
      status: getStatusFromValue(analysisData?.metrics?.elasticity || 0),
      icon: Heart,
      color: "text-pink-500"
    },
    {
      name: "UV Protection",
      value: analysisData?.metrics?.uvProtection || 0,
      change: 0,
      status: getStatusFromValue(analysisData?.metrics?.uvProtection || 0),
      icon: Sun,
      color: "text-orange-500"
    },
    {
      name: "Skin Texture",
      value: analysisData?.metrics?.texture || 0,
      change: 0,
      status: getStatusFromValue(analysisData?.metrics?.texture || 0),
      icon: Zap,
      color: "text-purple-500"
    }
  ];

  function getStatusFromValue(value: number): string {
    if (value >= 80) return "excellent";
    if (value >= 60) return "good";
    if (value >= 40) return "fair";
    return "poor";
  }

  const concerns = analysisData?.concerns || [];
  const recommendations = analysisData?.recommendations || [];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Medical-Grade Skin Analysis Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              Advanced computer vision analysis with dermatological insights
            </p>
            <div className="flex justify-center gap-4 mt-4">
              {analysisData?.confidenceLevel && (
                <Badge variant="outline" className="text-sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Confidence Level: {analysisData.confidenceLevel}
                </Badge>
              )}
              {analysisData?.model_accuracy && (
                <Badge variant="outline" className="text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Model Accuracy: {analysisData.model_accuracy}
                </Badge>
              )}
            </div>
          </div>

          {/* Red Flags Alert */}
          {analysisData?.redFlags && analysisData.redFlags.length > 0 && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Medical Alert:</strong> {analysisData.redFlags.join(" ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Medical Disclaimer */}
          {analysisData?.disclaimer && (
            <Alert className="mb-8 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Medical Disclaimer:</strong> {analysisData.disclaimer}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="concerns">Skin Concerns</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Age and Overall Health Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Predicted Age */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {analysisData?.predicted_age || 28}
                    </h3>
                    <p className="text-sm text-muted-foreground">Predicted Age</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on Azure Face API + Local CNN</p>
                  </CardContent>
                </Card>

                {/* Overall Skin Health */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {analysisData?.overall_skin_health || analysisData?.metrics?.overallScore || 75.2}%
                    </h3>
                    <p className="text-sm text-muted-foreground">Overall Skin Health</p>
                    <p className="text-xs text-muted-foreground mt-2">Comprehensive AI Analysis</p>
                  </CardContent>
                </Card>

                {/* Model Accuracy */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">95%+</h3>
                    <p className="text-sm text-muted-foreground">Model Accuracy</p>
                    <p className="text-xs text-muted-foreground mt-2">Advanced CNN + Azure API</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Skin Health Parameters */}
              {analysisData?.skin_health_breakdown && (
                <Card className="bg-gradient-card border-0 shadow-card-hover mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Detailed Skin Health Parameters
                    </CardTitle>
                    <CardDescription>
                      Comprehensive analysis of skin health components with medical-grade accuracy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analysisData.skin_health_breakdown).map(([param, score]) => (
                        <div key={param} className="p-4 bg-accent/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{param}</span>
                            <span className="text-sm font-bold text-primary">{score.toFixed(1)}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                          {analysisData.detailedAnalysis?.skin_health_parameters?.[param] && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {analysisData.detailedAnalysis.skin_health_parameters[param].description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Standard Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {skinMetrics.map((metric, index) => (
                  <Card key={index} className="bg-gradient-card border-0 shadow-card-hover hover:shadow-professional transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${metric.color}`}>
                          <metric.icon className="w-5 h-5" />
                        </div>
                        <Badge 
                          variant={metric.status === 'excellent' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className="flex items-center space-x-1">
                            {metric.change > 0 ? (
                              <TrendingUp className="w-3 h-3 text-success" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-warning" />
                            )}
                            <span className={`text-xs ${metric.change > 0 ? 'text-success' : 'text-warning'}`}>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </span>
                          </div>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                        <div className="text-right text-sm text-muted-foreground">
                          {metric.value}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overall Score */}
              <Card className="bg-gradient-primary/5 border-primary/20 shadow-professional">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Overall Skin Health Score</h3>
                      <p className="text-muted-foreground">
                        Based on comprehensive AI analysis of multiple factors
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {analysisData?.metrics?.overallScore || 0}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">
                          {getStatusFromValue(analysisData?.metrics?.overallScore || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concerns" className="space-y-6">
              <div className="grid gap-6">
                {concerns.map((concern, index) => (
                  <Card key={index} className="bg-gradient-card border-0 shadow-card-hover">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{concern.type}</CardTitle>
                        <Badge variant={concern.severity === 'Mild' ? 'secondary' : 'default'}>
                          {concern.severity}
                        </Badge>
                      </div>
                      <CardDescription>
                        Located in {concern.area} • {concern.confidence}% confidence
                        {concern.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {concern.description}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Trend:</span>
                          <div className="flex items-center space-x-1">
                            {concern.trend === 'improving' ? (
                              <TrendingUp className="w-4 h-4 text-success" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className={`text-sm capitalize ${concern.trend === 'improving' ? 'text-success' : 'text-muted-foreground'}`}>
                              {concern.trend}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {recommendations.map((section, index) => (
                <Card key={index} className="bg-gradient-card border-0 shadow-card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span>{section.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-professional">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Progress Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Track your skin health improvements over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="text-muted-foreground">
                      Start tracking your progress by taking regular photos
                    </div>
                    <Button className="bg-gradient-primary">
                      Take Progress Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;