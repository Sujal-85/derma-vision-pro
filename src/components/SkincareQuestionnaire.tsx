import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Droplets,
  Sun,
  Heart,
  Zap,
  Edit3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionnaireAnswers, saveQuestionnaireAnswers } from "@/lib/api";

interface SkincareQuestionnaireProps {
  onComplete: (answers: any) => void;
  onSkip: () => void;
}

const SkincareQuestionnaire = ({ onComplete, onSkip }: SkincareQuestionnaireProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingAnswers, setHasExistingAnswers] = useState(false);

  // Load existing answers on component mount
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const existingAnswers = await getQuestionnaireAnswers(user.id, 'skincare');
        if (existingAnswers?.skincare) {
          const { completedAt, ...savedAnswers } = existingAnswers.skincare;
          setAnswers(savedAnswers);
          setHasExistingAnswers(true);
        }
      } catch (error) {
        console.error('Failed to load existing answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingAnswers();
  }, [user?.id]);

  const questions = [
    {
      id: "skinType",
      question: "What's your primary skin type?",
      icon: <Droplets className="w-6 h-6" />,
      options: [
        { value: "oily", label: "Oily", description: "Shiny, enlarged pores" },
        { value: "dry", label: "Dry", description: "Tight, flaky, rough texture" },
        { value: "combination", label: "Combination", description: "Oily T-zone, dry cheeks" },
        { value: "sensitive", label: "Sensitive", description: "Easily irritated, reactive" },
        { value: "normal", label: "Normal", description: "Balanced, few imperfections" }
      ]
    },
    {
      id: "mainConcerns",
      question: "What are your main skin concerns?",
      icon: <Heart className="w-6 h-6" />,
      options: [
        { value: "acne", label: "Acne & Breakouts", description: "Pimples, blackheads, blemishes" },
        { value: "aging", label: "Aging & Wrinkles", description: "Fine lines, loss of firmness" },
        { value: "darkSpots", label: "Dark Spots", description: "Hyperpigmentation, sun spots" },
        { value: "dryness", label: "Dryness", description: "Flaky, tight, dehydrated skin" },
        { value: "sensitivity", label: "Sensitivity", description: "Redness, irritation, reactions" }
      ]
    },
    {
      id: "currentRoutine",
      question: "How would you describe your current skincare routine?",
      icon: <User className="w-6 h-6" />,
      options: [
        { value: "minimal", label: "Minimal", description: "Just cleanser and moisturizer" },
        { value: "basic", label: "Basic", description: "Cleanser, moisturizer, sunscreen" },
        { value: "moderate", label: "Moderate", description: "4-6 products, some treatments" },
        { value: "extensive", label: "Extensive", description: "7+ products, advanced treatments" },
        { value: "none", label: "None", description: "No regular routine" }
      ]
    },
    {
      id: "sunExposure",
      question: "How much sun exposure do you typically get?",
      icon: <Sun className="w-6 h-6" />,
      options: [
        { value: "minimal", label: "Minimal", description: "Mostly indoors, always use SPF" },
        { value: "moderate", label: "Moderate", description: "Some outdoor time, usually use SPF" },
        { value: "high", label: "High", description: "Frequent outdoor activities" },
        { value: "veryHigh", label: "Very High", description: "Outdoor work or sports daily" },
        { value: "variable", label: "Variable", description: "Changes with seasons/activities" }
      ]
    },
    {
      id: "goals",
      question: "What are your primary skincare goals?",
      icon: <Zap className="w-6 h-6" />,
      options: [
        { value: "prevention", label: "Prevention", description: "Maintain healthy skin, prevent aging" },
        { value: "treatment", label: "Treatment", description: "Address specific concerns" },
        { value: "antiAging", label: "Anti-Aging", description: "Reduce signs of aging" },
        { value: "hydration", label: "Hydration", description: "Improve moisture and plumpness" },
        { value: "evenTone", label: "Even Tone", description: "Reduce dark spots, brighten skin" }
      ]
    }
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      await saveAnswers();
      onComplete(answers);
    }
  };

  const saveAnswers = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      await saveQuestionnaireAnswers(user.id, 'skincare', answers);
    } catch (error) {
      console.error('Failed to save answers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUseExistingAnswers = () => {
    onComplete(answers);
  };

  const handleEditAnswers = () => {
    setHasExistingAnswers(false);
    setCurrentQuestion(0);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <CheckCircle className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Loading...</h2>
                <p className="text-muted-foreground">
                  Checking for existing questionnaire data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show existing answers if available
  if (hasExistingAnswers && Object.keys(answers).length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Questionnaire Found!</h2>
                <p className="text-muted-foreground">
                  We found your previous questionnaire answers. You can use them or update them.
                </p>
              </div>
              <div className="space-y-2">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {questions.find(q => q.id === key)?.question.split('?')[0]}:
                    </span>
                    <span className="font-medium capitalize">
                      {String(value).replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleEditAnswers} className="flex-1">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Answers
                </Button>
                <Button onClick={handleUseExistingAnswers} className="flex-1 bg-gradient-primary">
                  Use These Answers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Questionnaire Complete!</h2>
                <p className="text-muted-foreground">
                  {saving ? 'Saving your answers...' : 'Thank you for providing your skincare information. This will help us give you more accurate analysis results.'}
                </p>
              </div>
              <div className="space-y-2">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {questions.find(q => q.id === key)?.question.split('?')[0]}:
                    </span>
                    <span className="font-medium capitalize">
                      {String(value).replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Quick Skincare Assessment</h1>
            <p className="text-muted-foreground">
              Help us personalize your skin analysis with a few quick questions
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {currentQ.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                  <CardDescription>
                    Select the option that best describes your situation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      answers[currentQ.id] === option.value
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {answers[currentQ.id] === option.value && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <div>
              {currentQuestion > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={onSkip}>
                Skip Questions
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!answers[currentQ.id]}
                className="bg-gradient-primary"
              >
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Skip Notice */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              You can skip these questions, but providing answers will help us give you more accurate results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkincareQuestionnaire;
