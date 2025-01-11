import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsStopwatch } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ExerciseRoutineCardProps, Set, ExerciseData } from "@/types/types";
import { SetsList } from "./SetsList";

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
  // Initialize sets based on routineExercise data and previous data
  const initialSets = useMemo(() => {
    const defaultSet = {
      id: 1,
      weight: "",
      reps: "",
      isWarmup: false,
    };

    try {
      // Try tp parse working weights
      let workingWeights = [];
      try {
        workingWeights = JSON.parse(routineExercise.workingSetWeights);
      } catch {
        workingWeights = []; // Default to empty array if parsing fails
      }

      if (!routineExercise.workingSets || routineExercise.workingSets < 1) {
        return [defaultSet];
      }

      // Create an array of default sets based on working sets
      const defaultSets = Array(routineExercise.workingSets)
        .fill(null)
        .map((_, index) => ({
          id: index + 1,
          weight: "",
          reps: "",
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
      sets: sets.map((set: Set) => ({
        weight: set.weight,
        reps: set.reps,
        isWarmup: set.isWarmup,
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

  function addWorkingSet() {
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
  function addWarmupSet() {
    setSets((prevSets: Set[]) => [
      ...prevSets,
      {
        id: prevSets.length + 1,
        weight: "",
        reps: "",
        isWarmup: true,
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
    <>
      <Card>
        {/* Exercise Label */}
        <CardHeader>
          <CardTitle className="flex w-full justify-between">
            {exercise.name}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <IoMdMore />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <CardDescription>
            <form className="h-full w-full">
              <textarea
                ref={textareaRef}
                className="h-auto min-h-[2.5rem] w-full resize-none bg-transparent"
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Rest Timer */}
          <div className="flex items-center gap-2 py-4 text-accent">
            <BsStopwatch />
            <p>Rest Timer:</p>
            <div>{routineExercise.restTime}</div>
          </div>

          <SetsList
            sets={sets}
            updateSet={updateSet}
            handleCheckboxChange={handleCheckboxChange}
            deleteSet={deleteSet}
          />
          {/* Add Set Button */}
          <div className="flex w-full justify-center">
            <div className="flex w-full flex-col gap-2 pt-4">
              <Button
                className="w-full bg-blue-900/30"
                variant="secondary"
                onClick={addWarmupSet}
              >
                <IoAddCircle />
                Add Warmup Set
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={addWorkingSet}
              >
                <IoAddCircle />
                Add Working Set
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
