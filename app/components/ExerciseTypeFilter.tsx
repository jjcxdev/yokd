export function ExerciseTypeFilter() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Machine
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Cable
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-xs transition-colors focus:bg-accent focus:text-card">
        Free Weight
      </button>
    </div>
  );
}
