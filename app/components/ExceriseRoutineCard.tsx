import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsStopwatch } from "react-icons/bs";
import { IoAddCircle } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ExerciseData,
  ExerciseRoutineCardProps,
  Set,
} from "@/types/types";

import { SetsList } from "./SetsList";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegTrashAlt } from "react-icons/fa";

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
  onExerciseRemoved,
}: ExerciseRoutineCardProps) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      let workingWeights: (number | null)[] = [];
      let warmupWeights: (number | null)[] = [];
      try {
        workingWeights = JSON.parse(routineExercise.workingSetWeights);
        warmupWeights = JSON.parse(routineExercise.warmupSetWeights);
      } catch {
        console.warn("Failed to parse wights, using empty array");
        workingWeights = []; // Default to empty array if parsing fails
        warmupWeights = [];
      }

      // If no sets defined, return default set
      if (
        routineExercise.workingSets === 0 &&
        routineExercise.warmupSets === 0
      ) {
        return [defaultSet];
      }

      // Function to ensure empty or zero values are replaced with "-"
      const ensureValue = (value: number | null | undefined): string => {
        if (value === null || value === undefined || value === 0) {
          return "";
        }
        return value.toString();
      };

      // Create warmup sets array
      const warmupSets: Set[] = Array.from(
        { length: routineExercise.warmupSets },
        (_, index) => ({
          id: index + 1,
          weight: ensureValue(
            warmupWeights[index] === null ? undefined : warmupWeights[index],
          ),
          reps: ensureValue(routineExercise.warmupReps),
          isWarmup: true,
        }),
      );

      // Create working sets array
      const workingSets: Set[] = Array.from(
        { length: routineExercise.workingSets },
        (_, index) => ({
          id: index + 100,
          weight: ensureValue(
            workingWeights[index] === null ? undefined : workingWeights[index],
          ),
          reps: ensureValue(routineExercise.workingReps),
          isWarmup: false,
        }),
      );

      const combinedSets = [...warmupSets, ...workingSets];

      // Only override with previous data if it exists and is valid
      if (previousData?.sets && previousData.sets !== "[]") {
        try {
          const parsedSets = JSON.parse(previousData.sets);
          if (Array.isArray(parsedSets) && parsedSets.length > 0) {
            return parsedSets.map((set, index) => ({
              id: index + 1,
              weight: ensureValue(Number(set.weight) || 0),
              reps: ensureValue(Number(set.reps) || 0),
              isWarmup: Boolean(set.isWarmup),
            }));
          }
        } catch (error) {
          console.warn("Failed to parse previous data sets, using default");
        }
      }

      // Return combined sets if no previous data
      return combinedSets;
    } catch (error) {
      console.error("Failed to initialize sets:", error);
      // If anything fails, return a single default set
      return [defaultSet];
    }
  }, [routineExercise, previousData]);

  const [sets, setSets] = useState<Set[]>(initialSets);
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
    setSets((prevSets) => {
      // Count existing sets and add 1 to get new id
      const workingSetCount = prevSets.filter((set) => set.isWarmup).length;
      return [
        ...prevSets,
        {
          id: 100 + workingSetCount,
          weight: "",
          reps: "",
          isWarmup: false,
        },
      ];
    });
  }

  function addWarmupSet() {
    setSets((prevSets) => {
      // Count existing sets and add 1 to get new id
      const warmupSetCount = prevSets.filter((set) => set.isWarmup).length;
      return [
        ...prevSets,
        {
          id: warmupSetCount + 1,
          weight: "",
          reps: "",
          isWarmup: true,
        },
      ];
    });
  }

  function updateSet(
    id: number,
    field: keyof Omit<Set, "id">,
    value: string,
  ): void {
    console.log(`Updating set ${id}, field ${field} to ${value}`);

    setSets((prevSets) => {
      const newSets = prevSets.map((set) => {
        if (set.id === id) {
          console.log(`Foung matching set:`, set);
          return { ...set, [field]: value };
        }
        return set;
      });
      console.log("Updated sets:", newSets);
      return newSets;
    });
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

  const handleDelete = () => {
    onExerciseRemoved?.(exercise.id);
  };

  const handleEdit = () => {
    setIsEditMode(!isEditMode);
    setIsDrawerOpen(false);
  };
  return (
    <>
      <Card>
        {/* Exercise Label */}
        <CardHeader>
          <CardTitle className="flex w-full justify-between">
            {exercise.name}

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <span className="cursor-pointer hover:text-accent">
                  <BiDotsHorizontalRounded size={20} />
                </span>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{exercise.name}</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-4">
                  <Button
                    className="flex w-full items-center justify-center gap-2"
                    onClick={handleEdit}
                    variant={isEditMode ? "default" : "secondary"}
                  >
                    {isEditMode ? "Update" : "Edit Exercise"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={handleDelete}
                  >
                    <FaRegTrashAlt />
                    Delete Exercise
                  </Button>
                </div>

                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
            isEditMode={isEditMode}
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
