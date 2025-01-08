import { GoClockFill } from "react-icons/go";

export function PreviousWorkout() {
  return (
    <div className="flex flex-col gap-4">
      <div>Previous Routine</div>
      <div className="flex rounded-lg bg-gradient-to-tr from-[#1A1A1A] via-[#1A1A1A] to-[#E7FC00]/20 p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2 text-xl text-accent">
            <GoClockFill />
            <span className="text-base text-white">40 min</span>
          </div>
          <div>
            <div>6 exercises</div>
            <div className="flex gap-2 text-xs text-dimmed">
              <div>20 sets</div>
              <div>|</div>
              <div>3,900 lbs</div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-end justify-end">
          <div className="text-3xl font-semibold">Back 1/2</div>
          <div className="text-xs text-dimmed">8 Jan, 2025</div>
        </div>
      </div>
    </div>
  );
}
