import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3,
  CheckCircle,
  Calendar,
  User,
  Droplets,
  Heart,
  Sun,
  Zap,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionnaireAnswers, saveQuestionnaireAnswers } from "@/lib/api";
import SkincareQuestionnaire from "./SkincareQuestionnaire";
import OnboardingQuestionnaire from "./OnboardingQuestionnaire";

interface SavedQuestionnaireDisplayProps {
  onEditComplete?: () => void;
}

const SavedQuestionnaireDisplay = ({ onEditComplete }: SavedQuestionnaireDisplayProps) => {
  const { user } = useAuth();
  const [skincareAnswers, setSkincareAnswers] = useState<any>(null);
  const [onboardingAnswers, setOnboardingAnswers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<'skincare' | 'onboarding' | null>(null);

  useEffect(() => {
    const loadAnswers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const answers = await getQuestionnaireAnswers(user.id);
        setSkincareAnswers(answers?.skincare || null);
        setOnboardingAnswers(answers?.onboarding || null);
      } catch (error) {
        console.error('Failed to load questionnaire answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnswers();
  }, [user?.id]);

  const handleEditComplete = (type: 'skincare' | 'onboarding') => {
    setEditingType(null);
    // Reload answers
    const loadAnswers = async () => {
      if (!user?.id) return;
      
      try {
        const answers = await getQuestionnaireAnswers(user.id);
        setSkincareAnswers(answers?.skincare || null);
        setOnboardingAnswers(answers?.onboarding || null);
      } catch (error) {
        console.error('Failed to reload answers:', error);
      }
    };
    
    loadAnswers();
    onEditComplete?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuestionIcon = (questionId: string) => {
    switch (questionId) {
      case 'skinType': return <Droplets className="w-4 h-4" />;
      case 'mainConcerns': return <Heart className="w-4 h-4" />;
      case 'currentRoutine': return <User className="w-4 h-4" />;
      case 'sunExposure': return <Sun className="w-4 h-4" />;
      case 'goals': return <Zap className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading questionnaire data...</span>
        </div>
      </div>
    );
  }

  if (editingType === 'skincare') {
    return (
      <SkincareQuestionnaire
        onComplete={(answers) => handleEditComplete('skincare')}
        onSkip={() => setEditingType(null)}
      />
    );
  }

  if (editingType === 'onboarding') {
    return (
      <OnboardingQuestionnaire
        onComplete={(answers) => handleEditComplete('onboarding')}
        onSkip={() => setEditingType(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Questionnaire Data</h2>
        <p className="text-muted-foreground">
          View and edit your saved questionnaire answers
        </p>
      </div>

      {/* Skincare Questionnaire */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Skincare Assessment</CardTitle>
                <CardDescription>
                  Your skin type, concerns, and routine preferences
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {skincareAnswers?.completedAt && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(skincareAnswers.completedAt)}</span>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingType('skincare')}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        {skincareAnswers ? (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(skincareAnswers)
                .filter(([key]) => key !== 'completedAt')
                .map(([key, value]) => (
                  <div key={key} className="flex items-start space-x-3 p-3 bg-accent/50 rounded-lg">
                    <div className="p-1 bg-primary/10 rounded">
                      {getQuestionIcon(key)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {Array.isArray(value) ? value.join(', ') : String(value).replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-8">
              <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No skincare questionnaire data found
              </p>
              <Button onClick={() => setEditingType('skincare')}>
                Complete Skincare Assessment
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Onboarding Questionnaire */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Onboarding Profile</CardTitle>
                <CardDescription>
                  Your personal information and preferences
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onboardingAnswers?.completedAt && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(onboardingAnswers.completedAt)}</span>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingType('onboarding')}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        {onboardingAnswers ? (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(onboardingAnswers)
                .filter(([key]) => key !== 'completedAt' && key !== 'consent')
                .map(([key, value]) => (
                  <div key={key} className="flex items-start space-x-3 p-3 bg-accent/50 rounded-lg">
                    <div className="p-1 bg-primary/10 rounded">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {String(value).replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No onboarding questionnaire data found
              </p>
              <Button onClick={() => setEditingType('onboarding')}>
                Complete Onboarding Profile
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SavedQuestionnaireDisplay;

