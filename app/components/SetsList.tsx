import { Checkbox } from "@/components/ui/checkbox";
import { FaRegTrashCan } from "react-icons/fa6";
import type { Set, SetListProps } from "@/types/types";

export function SetsList({
  sets,
  updateSet,
  handleCheckboxChange,
  deleteSet,
}: SetListProps) {
  // Get warmup and working sets
  const warmupSets = sets.filter((set) => set.isWarmup);
  const workingSets = sets.filter((set) => !set.isWarmup);

  // Fuvntion to render a single set with the correct display number
  const renderSet = (set: Set, displayNumber: number) => (
    <div
      key={set.id}
      className={`flex w-full rounded-sm ${set.isWarmup ? "mb-1 bg-blue-900/30" : ""}`}
    >
      <div className="flex w-1/5 justify-center text-base">{displayNumber}</div>
      <div className="flex w-1/5 justify-center">
        <form className="w-full">
          <input
            className="w-full bg-transparent text-center text-base"
            type="text"
            placeholder="-"
            value={set.weight}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*(?:\.\d*)?$/.test(value)) {
                updateSet(set.id, "weight", value);
              }
            }}
          />
        </form>
      </div>
      <div className="flex w-1/5 justify-center">
        <form className="w-full">
          <input
            className="w-full bg-transparent text-center text-base"
            type="text"
            placeholder="-"
            value={set.reps}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*(?:\.\d*)?$/.test(value)) {
                updateSet(set.id, "reps", value);
              }
            }}
          />
        </form>
      </div>
      <div className="flex w-1/5 items-center justify-center">
        <Checkbox onCheckedChange={() => handleCheckboxChange(set.id)} />
      </div>
      <div className="flex w-1/5 items-center justify-center">
        <button
          className="text-base text-remove"
          onClick={() => deleteSet(set.id)}
          disabled={!set.isWarmup && workingSets.length <= 1}
        >
          <FaRegTrashCan />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Set Details Header */}
      <div className="flex w-full text-xs uppercase text-dimmed">
        <div className="flex w-1/5 justify-center">Set</div>
        <div className="flex w-1/5 justify-center">Lbs</div>
        <div className="flex w-1/5 justify-center">Reps</div>
        <div className="flex w-1/5 justify-center">✓</div>
        <div className="flex w-1/5 justify-center"></div>
      </div>

      {/* Warmup Sets */}

      {warmupSets.length > 0 && (
        <div className="mb-4">
          {warmupSets.map((set, index) => renderSet(set, index + 1))}
        </div>
      )}
      {/* Working Sets */}
      <div>
        {warmupSets.length > 0 && (
          <div className="mb-2 text-sm font-medium text-dimmed"></div>
        )}
        {workingSets.map((set, index) =>
          renderSet(set, warmupSets.length + index + 1),
        )}
      </div>
    </>
  );
}
