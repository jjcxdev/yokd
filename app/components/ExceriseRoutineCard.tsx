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
  planExercise: {
    id: string;
    planId: string;
    exerciseId: string;
    order: number;
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
  planExercise,
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

  // Initialize sets based on planExercise data and previous data
  const initialSets = useMemo(() => {
    try {
      // If we have previous data, use it
      if (previousData?.sets) {
        const parsedSets = JSON.parse(previousData.sets);
        return parsedSets.map((set: any, index: number) => ({
          id: index + 1,
          weight: set.weight || "",
          reps: set.reps || "",
          isWarmup: index < planExercise.warmupSets,
        }));
      }
    } catch (error) {
      console.error("Error parsing previous data:", error);
    }

    // Fallback to default sets if no previous data or parsing error
    const defaultSets = [];
    // Add warmup sets
    for (let i = 1; i <= planExercise.warmupSets; i++) {
      defaultSets.push({
        id: i,
        weight: "",
        reps: planExercise.warmupReps.toString(),
        isWarmup: true,
      });
    }

    // Add working sets
    for (let i = 1; i <= planExercise.workingSets; i++) {
      defaultSets.push({
        id: i + planExercise.warmupSets,
        weight: "",
        reps: planExercise.workingReps.toString(),
        isWarmup: false,
      });
    }

    // Return default sets if no valid previous data
    return defaultSets.length
      ? defaultSets
      : [{ id: 1, weight: "", reps: "", isWarmup: false }];
  }, [planExercise, previousData]); // Remove previousData from dependencies

  const [sets, setSets] = useState(initialSets);
  const [notes, setNotes] = useState<string>(
    previousData?.notes || planExercise.notes || "",
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
    onRestTimeTrigger(planExercise.restTime);
  };

  return (
    <div className="rounded-lg bg-card p-4">
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
        <div>{planExercise.restTime}</div>
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
          <div className="flex w-1/5 justify-start text-sm">{set.id}</div>
          <div className="flex w-1/5 justify-center">
            <form className="w-full">
              <input
                className="w-full bg-transparent text-center text-sm"
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
                className="flex w-full bg-transparent text-center text-sm"
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
          <div className="flex w-1/5 justify-center">
            <Checkbox onCheckedChange={() => handleCheckboxChange(set.id)} />
          </div>
          {/* Delete Set Button */}
          <div className="flex w-1/5 justify-center">
            <button
              className="text-sm text-remove"
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
