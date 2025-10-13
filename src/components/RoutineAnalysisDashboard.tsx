import React from 'react';
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
  Sparkles,
  Clock,
  Star,
  User
} from "lucide-react";

interface AnalysisData {
  predicted_age?: number;
  predicted_age_range?: {
    min: number;
    max: number;
    label: string;
    confidence?: string;
  };
  overall_skin_health?: number;
  skin_health_breakdown?: {
    [key: string]: number;
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

interface RoutineAnalysisDashboardProps {
  imageData: string;
  analysisResults?: AnalysisData;
  onBack: () => void;
  onNext: () => void;
}

const RoutineAnalysisDashboard: React.FC<RoutineAnalysisDashboardProps> = ({
  imageData,
  analysisResults,
  onBack,
  onNext
}) => {
  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Routine-focused metrics with different styling
  const routineMetrics = [
    {
      name: "Hydration",
      value: analysisResults.metrics.hydration,
      icon: Droplets,
      color: "text-blue-500",
      status: analysisResults.metrics.hydration > 70 ? "excellent" : analysisResults.metrics.hydration > 50 ? "good" : "needs_attention",
      change: 5,
      routine_priority: "high"
    },
    {
      name: "Elasticity",
      value: analysisResults.metrics.elasticity,
      icon: Zap,
      color: "text-purple-500",
      status: analysisResults.metrics.elasticity > 70 ? "excellent" : analysisResults.metrics.elasticity > 50 ? "good" : "needs_attention",
      change: 3,
      routine_priority: "high"
    },
    {
      name: "UV Protection",
      value: analysisResults.metrics.uvProtection,
      icon: Sun,
      color: "text-orange-500",
      status: analysisResults.metrics.uvProtection > 80 ? "excellent" : analysisResults.metrics.uvProtection > 60 ? "good" : "needs_attention",
      change: 8,
      routine_priority: "critical"
    },
    {
      name: "Texture",
      value: analysisResults.metrics.texture,
      icon: Heart,
      color: "text-pink-500",
      status: analysisResults.metrics.texture > 70 ? "excellent" : analysisResults.metrics.texture > 50 ? "good" : "needs_attention",
      change: -2,
      routine_priority: "medium"
    }
  ];

  const getRoutinePriority = (concern: any) => {
    if (concern.medical_priority === 'high') return 'critical';
    if (concern.severity === 'High') return 'high';
    if (concern.severity === 'Moderate') return 'medium';
    return 'low';
  };

  const getRoutineColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-green-500 bg-green-50 border-green-200';
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Personalized Skincare Routine Analysis</h2>
            <p className="text-lg text-muted-foreground">
              AI-powered analysis to create your perfect skincare routine
            </p>
            <div className="flex justify-center gap-4 mt-4">
              {analysisResults?.confidenceLevel && (
                <Badge variant="outline" className="text-sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Confidence Level: {analysisResults.confidenceLevel}
                </Badge>
              )}
              {analysisResults?.model_accuracy && (
                <Badge variant="outline" className="text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Model Accuracy: {analysisResults.model_accuracy}
                </Badge>
              )}
            </div>
          </div>

          {/* Red Flags Alert */}
          {analysisResults?.redFlags && analysisResults.redFlags.length > 0 && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Important:</strong> {analysisResults.redFlags[0]}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Routine Overview</TabsTrigger>
              <TabsTrigger value="concerns">Skin Concerns</TabsTrigger>
              <TabsTrigger value="recommendations">Routine Tips</TabsTrigger>
              <TabsTrigger value="products">Product Focus</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Age and Overall Health Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Predicted Age Range */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {analysisResults?.predicted_age_range?.label || `${analysisResults?.predicted_age || 28}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">Predicted Age Range</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Approx: {analysisResults?.predicted_age ?? 28}{analysisResults?.predicted_age_range?.confidence ? ` · Confidence: ${analysisResults?.predicted_age_range?.confidence}` : ''}
                    </p>
                  </CardContent>
                </Card>

                {/* Overall Skin Health */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {analysisResults?.overall_skin_health || analysisResults?.metrics?.overallScore || 75.2}%
                    </h3>
                    <p className="text-sm text-muted-foreground">Overall Skin Health</p>
                    <p className="text-xs text-muted-foreground mt-2">Routine optimization potential</p>
                  </CardContent>
                </Card>

                {/* Routine Score */}
                <Card className="bg-gradient-card border-0 shadow-card-hover">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {Math.round((analysisResults?.overall_skin_health || analysisResults?.metrics?.overallScore || 75.2) * 0.8 + 20)}%
                    </h3>
                    <p className="text-sm text-muted-foreground">Routine Potential</p>
                    <p className="text-xs text-muted-foreground mt-2">Improvement with proper routine</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Skin Health Parameters */}
              {analysisResults?.skin_health_breakdown && (
                <Card className="bg-gradient-card border-0 shadow-card-hover mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Routine-Focused Skin Parameters
                    </CardTitle>
                    <CardDescription>
                      Key metrics that will guide your personalized skincare routine
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analysisResults.skin_health_breakdown).map(([param, score]) => (
                        <div key={param} className="p-4 bg-accent/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{param}</span>
                            <span className="text-sm font-bold text-primary">{score.toFixed(1)}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                          {analysisResults.detailedAnalysis?.skin_health_parameters?.[param] && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {analysisResults.detailedAnalysis.skin_health_parameters[param].description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Routine-Focused Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {routineMetrics.map((metric, index) => (
                  <Card key={index} className="bg-gradient-card border-0 shadow-card-hover hover:shadow-professional transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${metric.color}`}>
                          <metric.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge 
                            variant={metric.status === 'excellent' ? 'default' : 'secondary'}
                            className="text-xs mb-1"
                          >
                            {metric.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoutineColor(metric.routine_priority)}`}
                          >
                            {metric.routine_priority} priority
                          </Badge>
                        </div>
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

              {/* Routine Potential Summary */}
              <Card className="bg-gradient-primary/5 border-primary/20 shadow-professional">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">Routine Optimization Potential</h3>
                        <p className="text-muted-foreground">
                          Your skin has great potential for improvement with a personalized routine
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {Math.round((analysisResults?.overall_skin_health || analysisResults?.metrics?.overallScore || 0) * 0.8 + 20)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Potential improvement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="concerns" className="space-y-6">
              <div className="grid gap-6">
                {analysisResults.concerns.map((concern, index) => {
                  const priority = getRoutinePriority(concern);
                  return (
                    <Card key={index} className={`border-l-4 ${getRoutineColor(priority)}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{concern.type}</h3>
                              <Badge variant="outline" className={getRoutineColor(priority)}>
                                {priority} priority
                              </Badge>
                              <Badge variant="secondary">
                                {concern.severity} severity
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3">{concern.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>📍 {concern.area}</span>
                              <span>📊 {concern.confidence}% confidence</span>
                              <span>📈 {concern.trend}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {analysisResults.recommendations.map((rec, index) => (
                <Card key={index} className="bg-gradient-card border-0 shadow-card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {rec.category}
                      </CardTitle>
                      <Button size="sm" className="bg-gradient-primary" onClick={onBack}>
                        Take Progress Photo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {rec.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Recommended Product Categories
                  </CardTitle>
                  <CardDescription>
                    Based on your skin analysis, these product types will be most beneficial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResults.concerns.map((concern, index) => (
                      <div key={index} className="p-4 bg-accent/50 rounded-lg">
                        <h4 className="font-medium mb-2">{concern.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on products that target {concern.type.toLowerCase()} in the {concern.area.toLowerCase()}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {getRoutinePriority(concern)} priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-12">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Capture
            </Button>
            <Button onClick={onNext} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80">
              Continue to Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Medical Disclaimer */}
          <Alert className="mt-8">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> This analysis is for routine planning purposes only and should not replace professional dermatological advice. Always consult with a healthcare provider for medical concerns.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </section>
  );
};

export default RoutineAnalysisDashboard;
