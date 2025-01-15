export function ExerciseMuscleFilter({
  selectedMuscleGroup,
  onMuscleGroupChange,
}: {
  selectedMuscleGroup: string | null;
  onMuscleGroupChange: (muscleGroup: string | null) => void;
}) {
  const muscleGroups = [
    "Back",
    "Biceps",
    "Cardio",
    "Chest",
    "Core",
    "Legs",
    "Shoulders",
    "Triceps",
  ];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {muscleGroups.map((group) => (
        <button
          type="button"
          key={group}
          className={`rounded-full px-1 py-[2px] text-xs transition-colors ${selectedMuscleGroup === group ? "bg-accent text-card" : "bg-card hover:bg-accent/10"}`}
          onClick={() =>
            onMuscleGroupChange(selectedMuscleGroup === group ? null : group)
          }
        >
          {group}
        </button>
      ))}
    </div>
  );
}
