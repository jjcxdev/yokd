import { is } from "drizzle-orm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsStopwatch } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";

import SecondaryButton from "@/app/components/SecondaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import type { Exercise } from "@/lib/db/schema";

interface ExerciseRoutineCardProps {
  exercise: Exercise;
  routineExercise: {
    id: string;
    routineId: string;
    exerciseId: string;
    order: number;
    workingSetWeights: string;
    warmupSets: number;
    warmupReps: number;
    workingSets: number;
    workingReps: number;
    restTime: number;
    notes?: string | null;
  };
  previousData?: {
    notes: string;
    sets: string;
  };
  onUpdate: (exerciseData: {
    exerciseId: string;
    notes: string;
    sets: Array<{
      weight: string;
      reps: string;
    }>;
  }) => void;
  onRestTimeTrigger: (restTime: number) => void;
}

type ExerciseData = {
  exerciseId: string;
  notes: string;
  sets: Array<{
    weight: string;
    reps: string;
  }>;
};

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

export default function ExceriseRoutineCard({
  exercise,
  routineExercise,
  previousData,
  onUpdate,
  onRestTimeTrigger,
}: ExerciseRoutineCardProps) {
  interface Set {
    id: number;
    weight: string;
    reps: string;
    isWarmup: boolean;
  }

  // Initialize sets based on routineExercise data and previous data
  const initialSets = useMemo(() => {
    try {
      const workingWeights = JSON.parse(routineExercise.workingSetWeights);
      const defaultSets = Array(routineExercise.workingSets)
        .fill(null)
        .map((_, index) => ({
          id: index + 1,
          weight: workingWeights[index]?.toString() ?? "0",
          reps: routineExercise.workingReps.toString(),
          isWarmup: false,
        }));

      // Only override with previous data if it exists and is valid
      if (previousData?.sets && previousData.sets !== "[]") {
        try {
          const parsedSets = JSON.parse(previousData.sets);
          if (Array.isArray(parsedSets) && parsedSets.length > 0) {
            return parsedSets.map((set, index) => ({
              id: index + 1,
              weight: (
                set?.weight ??
                defaultSets[index]?.weight ??
                "0"
              ).toString(),
              reps: (
                set?.reps ??
                defaultSets[index]?.reps ??
                routineExercise.workingReps.toString()
              ).toString(),
              isWarmup: false,
            }));
          }
        } catch {
          // If there's any error parsing previous data, return default sets
          return defaultSets;
        }
      }

      return defaultSets;
    } catch {
      // If anything fails, return a single default set
      return [
        {
          id: 1,
          weight: "0",
          reps: routineExercise.workingReps.toString(),
          isWarmup: false,
        },
      ];
    }
  }, [routineExercise, previousData]);

  const [sets, setSets] = useState(initialSets);
  const [notes, setNotes] = useState<string>(
    previousData?.notes || routineExercise.notes || "",
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isInitialRender = useRef(true);

  // Memoize the data transformation
  const currentData = useMemo(
    () => ({
      exerciseId: exercise.id,
      notes,
      sets: sets.map(({ weight, reps }: { weight: string; reps: string }) => ({
        weight,
        reps,
      })),
    }),
    [sets, notes, exercise.id],
  );

  const debouncedOnUpdate = useCallback(
    debounce((data: ExerciseData) => {
      onUpdate(data);
    }, 500),
    [onUpdate],
  );

  // Only update parent on user changes, not initial render
  useEffect(() => {
    // Skip very first render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    debouncedOnUpdate(currentData);

    return () => {
      debouncedOnUpdate.cancel();
    };
  }, [currentData, debouncedOnUpdate]);

  function addSet() {
    setSets((prevSets: Set[]) => [
      ...prevSets,
      {
        id: prevSets.length + 1,
        weight: "",
        reps: "",
        isWarmup: false,
      },
    ]);
  }

  function updateSet(
    id: number,
    field: keyof Omit<Set, "id">,
    value: string,
  ): void {
    setSets(
      sets.map((set: Set) =>
        set.id === id ? { ...set, [field]: value } : set,
      ),
    );
  }

  function deleteSet(id: number): void {
    if (sets.length <= 1) return;

    const filteredSets = sets.filter((set: Set) => set.id !== id);

    const reindexedSets = filteredSets.map((set: Set, index: number) => ({
      ...set,
      id: index + 1,
    }));

    setSets(reindexedSets);
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [notes]);

  const handleCheckboxChange = (setId: number) => {
    // Trigger rest timer countdown logic
    console.log(`Set ${setId} completed. Trigger rest timer countdown.`);
    onRestTimeTrigger(routineExercise.restTime);
  };

  return (
    <div className="w-full max-w-96 rounded-lg bg-card p-4">
      {/* Exercise Label */}

      <div className="flex w-full flex-col">
        <div className="flex w-full justify-between">
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <div className="text-2xl">
            <IoMdMore />
          </div>
        </div>
        <div>
          <form className="h-full w-full">
            <textarea
              ref={textareaRef}
              className="h-auto min-h-[2.5rem] w-full resize-none bg-transparent text-sm"
              rows={1}
              placeholder="Add routine notes here"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ overflow: "hidden", height: "auto" }}
              onInput={(e) => {
                const textarea = e.target as HTMLTextAreaElement;
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
              }}
            />
          </form>
        </div>
      </div>

      {/* Rest Timer */}

      <div className="flex items-center gap-2 py-4 text-accent">
        <BsStopwatch />
        <p>Rest Timer:</p>
        <div>{routineExercise.restTime}</div>
      </div>

      {/* Set details header */}

      <div className="flex w-full text-xs uppercase text-dimmed">
        <div className="flex w-1/5 justify-start">Set</div>
        <div className="flex w-1/5 justify-center">Lbs</div>
        <div className="flex w-1/5 justify-center">Reps</div>
        <div className="flex w-1/5 justify-center">✓</div>
        <div className="flex w-1/5 justify-center"></div>
      </div>

      {/* Dynamic sets */}

      {sets.map((set: Set) => (
        <div key={set.id} className="flex w-full">
          <div className="flex w-1/5 justify-start text-base">{set.id}</div>
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
                className="flex w-full bg-transparent text-center text-base"
                type="text"
                placeholder="-"
                value={set.reps}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    updateSet(set.id, "reps", value);
                  }
                }}
              />
            </form>
          </div>
          <div className="flex w-1/5 items-center justify-center">
            <Checkbox onCheckedChange={() => handleCheckboxChange(set.id)} />
          </div>
          {/* Delete Set Button */}
          <div className="flex w-1/5 justify-center">
            <button
              className="text-base text-remove"
              onClick={() => deleteSet(set.id)}
              disabled={sets.length <= 1}
            >
              <FaRegTrashCan />
            </button>
          </div>
        </div>
      ))}

      {/* Add Set Button */}

      <div className="flex w-full justify-center">
        <div className="w-full pt-4">
          <SecondaryButton
            icon={<IoAddCircle />}
            label={"Add set"}
            variant="dark"
            onClick={addSet}
          />
        </div>
      </div>
    </div>
  );
}
