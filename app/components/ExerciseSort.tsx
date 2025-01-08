import { BsSortUp } from "react-icons/bs";
import { BsSortDown } from "react-icons/bs";

export function ExerciseSort() {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button className="rounded-full bg-card px-1 py-[2px] text-sm transition-colors focus:bg-accent focus:text-card">
        <BsSortUp />
      </button>
      <button className="rounded-full bg-card px-1 py-[2px] text-sm transition-colors focus:bg-accent focus:text-card">
        <BsSortDown />
      </button>
    </div>
  );
}
