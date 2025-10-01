import { useState, useEffect } from "react";
import SkincareQuestionnaire from "@/components/SkincareQuestionnaire";
import MedicalSkincareAnalysisFlow from "@/components/MedicalSkincareAnalysisFlow";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionnaireAnswers } from "@/lib/api";
import BackButton from "@/components/BackButton";

const Analyze = () => {
  const { user } = useAuth();
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing questionnaire data on component mount
  useEffect(() => {
    const checkExistingAnswers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const existingAnswers = await getQuestionnaireAnswers(user.id, 'skincare');
        if (existingAnswers?.skincare) {
          const { completedAt, ...savedAnswers } = existingAnswers.skincare;
          setQuestionnaireAnswers(savedAnswers);
          setShowQuestionnaire(false);
        }
      } catch (error) {
        console.error('Failed to load existing answers:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingAnswers();
  }, [user?.id]);

  const handleQuestionnaireComplete = (answers: any) => {
    setQuestionnaireAnswers(answers);
    setShowQuestionnaire(false);
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
  };

  // Show loading state while checking for existing answers
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <BackButton />
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Checking for existing questionnaire data
          </p>
        </div>
      </div>
    );
  }

  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <SkincareQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onSkip={handleQuestionnaireSkip}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <MedicalSkincareAnalysisFlow />
    </div>
  );
};

export default Analyze;


