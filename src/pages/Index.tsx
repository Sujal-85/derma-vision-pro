import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CameraCapture from "@/components/CameraCapture";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <CameraCapture />
        <AnalysisDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
