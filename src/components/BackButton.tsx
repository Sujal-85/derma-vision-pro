import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there's history, go back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no history
      navigate("/");
    }
  };

  return (
    <div className="fixed top-20 left-4 z-40">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="bg-background/95 backdrop-blur-md border-border shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  );
};

export default BackButton;
