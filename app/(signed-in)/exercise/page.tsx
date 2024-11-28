import ActionHeader from "@/app/components/ActionHeader";
import ExerciseCard from "@/app/components/ExerciseCard";

export default function Exercise() {
  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <ActionHeader title={"Add Exercise"} button={"Cancel"} />
      <div>
        <div className="p-4">
          <ExerciseCard
            title="Lat Pulldown"
            muscleGroup="Back"
            exerciseType="Cable"
          />
        </div>
      </div>
    </div>
  );
}
