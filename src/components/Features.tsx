import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Camera, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Clock,
  Users,
  Award,
  Zap
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "State-of-the-art computer vision algorithms analyze your skin with medical-grade precision",
      highlight: "99.2% Accuracy"
    },
    {
      icon: Camera,
      title: "Instant Results",
      description: "Get comprehensive skin analysis in seconds with real-time processing and insights",
      highlight: "< 5 seconds"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your skin health journey with detailed analytics and improvement metrics",
      highlight: "Historical Data"
    },
    {
      icon: Shield,
      title: "Medical Grade Security",
      description: "Enterprise-level security ensures your personal health data is always protected",
      highlight: "HIPAA Compliant"
    },
    {
      icon: Smartphone,
      title: "Multi-Platform Access",
      description: "Access your skin analysis from any device - web, mobile, or tablet",
      highlight: "Cross-Platform"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get professional skin analysis anytime, anywhere without appointments",
      highlight: "Always Available"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "1M+",
      label: "Active Users",
      description: "Trusted by professionals worldwide"
    },
    {
      icon: Award,
      value: "98%",
      label: "Accuracy Rate",
      description: "Clinically validated results"
    },
    {
      icon: Zap,
      value: "3 sec",
      label: "Analysis Time",
      description: "Lightning-fast processing"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Powered by 
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Advanced AI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our cutting-edge technology delivers professional-grade skin analysis 
              with the convenience of instant access from anywhere.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-gradient-card border-0 shadow-card-hover hover:shadow-professional transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-primary/5 rounded-2xl p-8 border border-primary/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Trusted by Professionals</h3>
              <p className="text-muted-foreground">
                Join thousands of dermatologists and skincare professionals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;