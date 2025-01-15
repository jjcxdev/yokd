export function ExerciseTypeFilter({
  selectedExerciseType,
  onExerciseTypeChange,
}: {
  selectedExerciseType: string | null;
  onExerciseTypeChange: (type: string | null) => void;
}) {
  const exerciseTypes = ["Free Weight", "Machine", "Cable"];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {exerciseTypes.map((type) => (
        <button
          type="button"
          key={type}
          className={`px-1 py-[2px] text-xs text-dimmed transition-colors ${selectedExerciseType === type ? "rounded-none border-b border-accent" : "border-b border-transparent hover:border-accent/50"}`}
          onClick={() =>
            onExerciseTypeChange(selectedExerciseType === type ? null : type)
          }
        >
          {type}
        </button>
      ))}
    </div>
  );
}
