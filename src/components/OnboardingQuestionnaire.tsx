import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Camera, Upload, Check, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionnaireAnswers, saveQuestionnaireAnswers } from "@/lib/api";

interface OnboardingData {
  gender: string;
  age: string;
  skinType: string;
  skinTone: string;
  sensitivity: string;
  budget: string;
  environment: string;
  makeupFrequency: string;
  brandPreference: string;
  productExperience: string;
  additionalInfo: string;
  consent: boolean;
}

interface OnboardingQuestionnaireProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const OnboardingQuestionnaire = ({ onComplete, onSkip }: OnboardingQuestionnaireProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
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
        const existingAnswers = await getQuestionnaireAnswers(user.id, 'onboarding');
        if (existingAnswers?.onboarding) {
          const { completedAt, ...savedAnswers } = existingAnswers.onboarding;
          setData(savedAnswers);
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
      id: "gender",
      title: "What is your gender?",
      description: "Studies show that skin parameters vary based on gender.",
      type: "select",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "non-binary", label: "Non-binary" },
        { value: "prefer-not-to-say", label: "Prefer not to say" }
      ]
    },
    {
      id: "age",
      title: "What is your age?",
      description: "Your skin changes with age, and so do your skincare needs.",
      type: "input",
      placeholder: "Enter your age"
    },
    {
      id: "skinType",
      title: "What is your skin type?",
      description: "Knowing your skin type helps us recommend the right products for you.",
      type: "radio",
      options: [
        {
          value: "dry",
          label: "Dry Skin",
          description: "Frequent itching and flakiness, roughness, tendency to crack especially around winters, earlier signs of ageing and wrinkling."
        },
        {
          value: "oily",
          label: "Oily Skin",
          description: "Acne-prone, clearly visible and often enlarged pores, problems of hyperpigmentation."
        },
        {
          value: "combination",
          label: "Combination Skin",
          description: "Flakiness in winter climates, clogged pores and acne, and a whole lot of confusion."
        },
        {
          value: "normal",
          label: "Normal Skin",
          description: "Generally well-balanced; but often gets drier with ageing."
        }
      ]
    },
    {
      id: "skinTone",
      title: "What is your skin tone?",
      description: "Your natural skin tone is one of the key factors that affect your skin's reaction to the sun.",
      type: "radio",
      options: [
        {
          value: "pale-white",
          label: "Pale white skin",
          description: "Extremely sensitive skin which burns easily and never tans.",
          color: "#F5E6D3"
        },
        {
          value: "white",
          label: "White skin",
          description: "Very sensitive skin which burns easily and tans minimally.",
          color: "#E6C79A"
        },
        {
          value: "medium-olive",
          label: "Medium white to olive skin",
          description: "Sensitive skin which sometimes burns and tans gradually.",
          color: "#D4A574"
        },
        {
          value: "olive-brown",
          label: "Olive to moderate brown skin",
          description: "Mildly sensitive skin which rarely burns and tans with ease.",
          color: "#B8860B"
        },
        {
          value: "brown-dark",
          label: "Brown to dark brown skin",
          description: "Minimally sensitive skin which very rarely burns and tans easily.",
          color: "#8B4513"
        },
        {
          value: "very-dark",
          label: "Very dark brown to black skin",
          description: "Insensitive skin which never burns and tans very easily.",
          color: "#2F1B14"
        }
      ]
    },
    {
      id: "sensitivity",
      title: "How sensitive is your skin?",
      description: "Understanding your skin's sensitivity helps us recommend products that won't cause irritation or adverse reactions.",
      type: "radio",
      options: [
        { value: "very-sensitive", label: "Very Sensitive" },
        { value: "somewhat-sensitive", label: "Somewhat Sensitive" },
        { value: "not-sensitive", label: "Not Sensitive" }
      ]
    },
    {
      id: "budget",
      title: "What's your preferred budget per product?",
      description: "We'll recommend products within your budget range while ensuring quality and effectiveness.",
      type: "radio",
      options: [
        { value: "budget-friendly", label: "Budget-Friendly ($5-15)" },
        { value: "moderate", label: "Moderate ($15-40)" },
        { value: "premium", label: "Premium ($40-100)" },
        { value: "mixed", label: "Mixed (Various price ranges)" }
      ]
    },
    {
      id: "environment",
      title: "Where do you spend most of your day?",
      description: "Your environment affects your skin's needs and the products you should use.",
      type: "radio",
      options: [
        { value: "outdoors", label: "Outdoors" },
        { value: "indoors", label: "Indoors" },
        { value: "mixed", label: "A mix of both" }
      ]
    },
    {
      id: "makeupFrequency",
      title: "How often do you wear makeup?",
      description: "Excessive use of makeup accelerates problems of acne, premature ageing, allergies, and discolouration.",
      type: "radio",
      options: [
        { value: "everyday", label: "Everyday" },
        { value: "often", label: "Often" },
        { value: "occasionally", label: "Occasionally" },
        { value: "rarely", label: "Rarely or Never" }
      ]
    },
    {
      id: "brandPreference",
      title: "Do you have a brand preference?",
      description: "Each region has unique strengths - Korean for innovation, Western for research, Indian for natural ingredients.",
      type: "radio",
      options: [
        { value: "korean", label: "Korean" },
        { value: "western", label: "Western" },
        { value: "indian", label: "Indian" },
        { value: "no-preference", label: "No preference" }
      ]
    },
    {
      id: "productExperience",
      title: "Have any skincare products worked particularly well or caused issues for you?",
      description: "Share your experience to help us avoid products that might not work for you.",
      type: "textarea",
      placeholder: "e.g. The Ordinary Niacinamide worked great, but Cerave moisturizer caused breakouts."
    },
    {
      id: "additionalInfo",
      title: "Do you have any other information to help us personalise your routine?",
      description: "Any specific skin conditions, allergies, or concerns we should know about?",
      type: "textarea",
      placeholder: "e.g. I have acne, rosacea, eczema, psoriasis, or hyperpigmentation."
    }
  ];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show consent
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (data.consent) {
      await saveAnswers();
      onComplete(data as OnboardingData);
    }
  };

  const saveAnswers = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      await saveQuestionnaireAnswers(user.id, 'onboarding', data);
    } catch (error) {
      console.error('Failed to save answers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUseExistingAnswers = () => {
    onComplete(data as OnboardingData);
  };

  const handleEditAnswers = () => {
    setHasExistingAnswers(false);
    setCurrentStep(0);
  };

  const updateData = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const renderQuestion = () => {
    if (currentStep >= questions.length) {
      // Consent step
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Almost Done!</h2>
            <p className="text-muted-foreground">
              Please review and agree to our terms to get your personalized skincare routine.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent"
                checked={data.consent || false}
                onCheckedChange={(checked) => updateData("consent", checked)}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                I agree to DermaVision Pro storing and processing my data to provide personalized skincare recommendations. 
                This information will be used to improve future recommendations. For more details, please read our{" "}
                <a href="#" className="text-primary underline">Privacy Policy</a>.
              </Label>
            </div>
          </div>
        </div>
      );
    }

    const question = questions[currentStep];
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
          <p className="text-muted-foreground">{question.description}</p>
        </div>

        {question.type === "select" && (
          <RadioGroup
            value={data[question.id as keyof OnboardingData] as string || ""}
            onValueChange={(value) => updateData(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "input" && (
          <div className="space-y-2">
            <input
              type="number"
              placeholder={question.placeholder}
              value={data[question.id as keyof OnboardingData] as string || ""}
              onChange={(e) => updateData(question.id, e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {question.type === "radio" && (
          <RadioGroup
            value={data[question.id as keyof OnboardingData] as string || ""}
            onValueChange={(value) => updateData(question.id, value)}
            className="space-y-4"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  )}
                  {option.color && (
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300 mt-2"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "textarea" && (
          <div className="space-y-2">
            <textarea
              placeholder={question.placeholder}
              value={data[question.id as keyof OnboardingData] as string || ""}
              onChange={(e) => updateData(question.id, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        )}
      </div>
    );
  };

  const progress = ((currentStep + 1) / (questions.length + 1)) * 100;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <Check className="w-16 h-16 text-primary animate-pulse" />
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
  if (hasExistingAnswers && Object.keys(data).length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto">
                <Check className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Questionnaire Found!</h2>
                <p className="text-muted-foreground">
                  We found your previous onboarding questionnaire. You can use it or update it.
                </p>
              </div>
              <div className="space-y-2 text-left max-w-md mx-auto">
                {Object.entries(data).filter(([key]) => key !== 'consent').map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <CardTitle>Generate Your Skincare Routine</CardTitle>
                <CardDescription>
                  Get a personalized skincare routine based on your skin type, concerns, and lifestyle.
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {renderQuestion()}
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={onSkip}>
              Skip
            </Button>
            {currentStep >= questions.length ? (
              <Button 
                onClick={handleSubmit}
                disabled={!data.consent || saving}
                className="bg-gradient-primary"
              >
                {saving ? 'Saving...' : 'Get My Routine'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!data[questions[currentStep].id as keyof OnboardingData]}
                className="bg-gradient-primary"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingQuestionnaire;
