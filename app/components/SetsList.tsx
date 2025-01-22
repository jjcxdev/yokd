import { FaRegTrashCan } from "react-icons/fa6";

import { Checkbox } from "@/components/ui/checkbox";
import type { Set, SetListProps } from "@/types/types";
import { usePathname } from "next/navigation";
import { SetCheckbox } from "./SetCheckbox";

export function SetsList({
  sets,
  updateSet,
  handleCheckboxChange,
  deleteSet,
  isEditMode = false,
}: SetListProps) {
  const pathname = usePathname();
  // Hide checkbox if were in the routine route
  const isRoutinePage = pathname?.includes("/routine");
  const showCheckbox = !isRoutinePage;

  // Dynamic width class based on checkbox visibility
  const getColumnWidth = () => {
    if (showCheckbox && isEditMode) return "w-1/5";
    if (showCheckbox || isEditMode) return "w-1/4";
    return "w-1/3";
  };

  const columnWidth = getColumnWidth();

  // Get warmup and working sets
  const warmupSets = sets.filter((set) => set.isWarmup);
  const workingSets = sets.filter((set) => !set.isWarmup);

  // Fuvntion to render a single set with the correct display number
  const renderSet = (set: Set, displayNumber: number) => (
    <div
      key={set.id}
      className={`flex w-full rounded-sm ${set.isWarmup ? "mb-1 bg-blue-900/30" : ""}`}
    >
      <div className={`flex ${columnWidth} justify-center text-base`}>
        {displayNumber}
      </div>
      <div className={`flex ${columnWidth} justify-center`}>
        <form className="w-full">
          <input
            className="w-full bg-transparent text-center text-base"
            type="text"
            placeholder="-"
            value={set.weight}
            onChange={(e) => {
              console.log("Input change", e.target.value);
              const value = e.target.value;
              if (/^\d*(?:\.\d*)?$/.test(value)) {
                updateSet(set.id, "weight", value);
              }
            }}
            data-set-id={set.id}
          />
        </form>
      </div>
      <div className={`flex ${columnWidth} justify-center`}>
        <form className="w-full">
          <input
            className="w-full bg-transparent text-center text-base"
            type="text"
            placeholder="-"
            value={set.reps}
            onChange={(e) => {
              console.log("Input change", e.target.value);
              const value = e.target.value;
              if (/^\d*(?:\.\d*)?$/.test(value)) {
                updateSet(set.id, "reps", value);
              }
            }}
            data-set-id={set.id}
          />
        </form>
      </div>

      {/* Checkbox - shown everywhere except Routine route */}

      {showCheckbox && (
        <div className={`flex ${columnWidth} items-center justify-center`}>
          <SetCheckbox onCheckedChange={handleCheckboxChange} setId={set.id} />
        </div>
      )}

      {/* Delete Button - only shown in edit mode */}

      {isEditMode && (
        <div className={`flex ${columnWidth} items-center justify-center`}>
          {isEditMode && (
            <button
              className="text-base text-remove"
              onClick={() => deleteSet(set.id)}
              disabled={!set.isWarmup && workingSets.length <= 1}
            >
              <FaRegTrashCan />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Set Details Header */}
      <div className="flex w-full text-xs uppercase text-dimmed">
        <div className={`flex ${columnWidth} justify-center`}>Set</div>
        <div className={`flex ${columnWidth} justify-center`}>Lbs</div>
        <div className={`flex ${columnWidth} justify-center`}>Reps</div>
        {showCheckbox && (
          <div className={`flex ${columnWidth} justify-center`}>✓</div>
        )}
        {isEditMode && (
          <div className={`flex ${columnWidth} justify-center`}></div>
        )}
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
