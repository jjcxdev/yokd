export function ExerciseMuscleFilter() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Arms
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Back
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Chest
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Core
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Legs
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Shoulders
      </button>
    </div>
  );
}
