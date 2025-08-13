import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, BarChart3, Shield } from "lucide-react";
import heroImage from "@/assets/hero-skincare.jpg";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>FDA-Approved AI Technology</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Advanced AI-Powered
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Skin Analysis
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Professional-grade dermatological analysis powered by cutting-edge AI. 
                Get personalized skincare recommendations and track your skin health 
                journey with clinical precision.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Instant Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Progress Tracking</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
              >
                Start Free Analysis
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground">Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-professional hover:shadow-glow transition-all duration-500">
              <img 
                src={heroImage}
                alt="Advanced AI-powered skincare analysis technology in professional medical setting"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Analytics Card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-card-hover backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <div className="text-sm">
                  <div className="font-medium">Analysis Complete</div>
                  <div className="text-muted-foreground">Skin health: Excellent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;