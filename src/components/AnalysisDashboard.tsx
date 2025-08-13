import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Target
} from "lucide-react";

const AnalysisDashboard = () => {
  const skinMetrics = [
    {
      name: "Hydration",
      value: 85,
      change: +5,
      status: "excellent",
      icon: Droplets,
      color: "text-blue-500"
    },
    {
      name: "Elasticity",
      value: 78,
      change: +2,
      status: "good",
      icon: Heart,
      color: "text-pink-500"
    },
    {
      name: "UV Protection",
      value: 92,
      change: -1,
      status: "excellent",
      icon: Sun,
      color: "text-orange-500"
    },
    {
      name: "Skin Texture",
      value: 74,
      change: +8,
      status: "good",
      icon: Zap,
      color: "text-purple-500"
    }
  ];

  const concerns = [
    {
      type: "Fine Lines",
      severity: "Mild",
      area: "Eye area",
      trend: "improving",
      confidence: 94
    },
    {
      type: "Dark Spots",
      severity: "Moderate",
      area: "Cheek area",
      trend: "stable",
      confidence: 87
    },
    {
      type: "Pore Size",
      severity: "Mild",
      area: "T-zone",
      trend: "improving",
      confidence: 91
    }
  ];

  const recommendations = [
    {
      category: "Immediate Action",
      items: [
        "Apply vitamin C serum in the morning",
        "Use SPF 30+ sunscreen daily",
        "Increase water intake to 8 glasses/day"
      ]
    },
    {
      category: "Weekly Routine",
      items: [
        "Exfoliate 2x per week with gentle AHA",
        "Use hydrating face mask twice weekly",
        "Apply retinol serum 3x per week"
      ]
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Skin Analysis Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive insights and personalized recommendations
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="concerns">Skin Concerns</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Metrics Grid */}
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
                      <div className="text-5xl font-bold text-primary mb-2">87</div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Excellent</span>
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