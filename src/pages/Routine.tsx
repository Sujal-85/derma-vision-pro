import RoutineAnalysisFlow from "@/components/RoutineAnalysisFlow";
import BackButton from "@/components/BackButton";

const Routine = () => {
  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <RoutineAnalysisFlow />
    </div>
  );
};

export default Routine;
