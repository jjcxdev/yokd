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
  ExerciseSet,
} from "@/types/types";

import { SetsList } from "./SetsList";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegTrashAlt } from "react-icons/fa";
import { nanoid } from "nanoid";
import { isEqual } from "lodash";
import _ from "lodash";

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

const handleEmptyValue = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Unified conversion function
const convertToBoolean = (input: unknown): boolean => {
  // Handle string representations from server and local state
  const normalized = String(input).trim().toLowerCase();
  return normalized === "1" || normalized === "true";
};

export default function ExerciseRoutineCard({
  exercise,
  routineExercise,
  previousData,
  onUpdate,
  onRestTimeTrigger,
  onExerciseRemoved,
}: ExerciseRoutineCardProps) {
  // Move debugDataFlow to the top of the component
  const debugDataFlow = (stage: string, data: any) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`ExerciseRoutineCard - ${exercise.name} - ${stage}`);
      console.log(JSON.stringify(data, null, 2));
      console.groupEnd();
    }
  };

  const [state, setState] = useState({
    isEditMode: false,
    isDrawerOpen: false,
  });

  const isInitialRender = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Memoize getInitialSets to prevent recreation on every render
  const getInitialSets = useCallback(() => {
    if (previousData?.sets) {
      const parsedSets =
        typeof previousData.sets === "string"
          ? JSON.parse(previousData.sets).map((set: any) => ({
              ...set,
              isWarmup: convertToBoolean(set.isWarmup),
            }))
          : previousData.sets.map((set: any) => ({
              ...set,
              isWarmup: convertToBoolean(set.isWarmup),
            }));

      if (parsedSets.length > 0) {
        const mappedSets = parsedSets.map((set: any) => ({
          id: Number(set.setNumber) || set.id,
          weight: String(set.weight || ""),
          reps: String(set.reps || ""),
          isWarmup: set.isWarmup,
        }));
        return mappedSets;
      }
    }
    // Default set creation logic
    return Array.from(
      { length: routineExercise.warmupSets + routineExercise.workingSets },
      (_, i) => ({
        id: i + 1,
        weight: "",
        reps: "",
        isWarmup: i < routineExercise.warmupSets,
      }),
    );
  }, [previousData, routineExercise]);

  const [sets, setSets] = useState(() => getInitialSets());
  const [notes, setNotes] = useState(
    previousData?.notes || routineExercise.notes || "",
  );

  // Reset state when previousData changes
  useEffect(() => {
    setNotes(previousData?.notes || routineExercise.notes || "");
    setSets(getInitialSets());
  }, [previousData, routineExercise, getInitialSets]);

  // Memoize currentData
  const currentData = useMemo(() => {
    const data = {
      exerciseId: exercise.id,
      notes,
      sets: sets.map(({ id, ...rest }: ExerciseSet) => rest),
    };
    debugDataFlow("Current Data Transform", {
      rawSets: sets,
      transformedData: data,
    });
    return data;
  }, [exercise.id, notes, sets]);

  // Create stable debounced update function
  const debouncedUpdate = useMemo(
    () =>
      _.debounce((data: ExerciseData) => {
        onUpdate(data);
      }, 500),
    [onUpdate],
  );

  // Effect to handle updates
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const previousSets = previousData?.sets || [];
    const parsedPreviousSets =
      typeof previousSets === "string"
        ? JSON.parse(previousSets)
        : previousSets;

    // Use consistent conversion for comparison
    const previousSetsNormalized = parsedPreviousSets.map((set: any) => ({
      weight: String(set.weight || ""),
      reps: String(set.reps || ""),
      isWarmup: convertToBoolean(set.isWarmup),
    }));

    const currentSetsNormalized = currentData.sets.map(
      (set: {
        weight?: number | string;
        reps?: number | string;
        isWarmup?: boolean;
      }) => ({
        weight: String(set.weight || ""),
        reps: String(set.reps || ""),
        isWarmup: convertToBoolean(set.isWarmup),
      }),
    );

    const setsChanged = !_.isEqual(
      currentSetsNormalized,
      previousSetsNormalized,
    );
    const notesChanged = currentData.notes !== previousData?.notes;

    if (setsChanged || notesChanged) {
      debugDataFlow("Triggering Update", {
        setsChanged,
        notesChanged,
        data: currentData,
      });
      debouncedUpdate(currentData);
    }

    return () => debouncedUpdate.cancel();
  }, [currentData, previousData, debouncedUpdate]);

  // Memoized handlers
  const handleSetUpdate = useCallback(
    (id: number, field: keyof Omit<ExerciseSet, "id">, value: string) =>
      (prev: ExerciseSet[]) => {
        debugDataFlow("Set Update", {
          setId: id,
          field,
          value,
          newSets: prev.map((set: ExerciseSet) =>
            set.id === id ? { ...set, [field]: value } : set,
          ),
        });
        return prev.map((set: ExerciseSet) =>
          set.id === id ? { ...set, [field]: value } : set,
        );
      },
    [],
  );

  const handleDelete = useCallback(() => {
    onExerciseRemoved?.(exercise.id);
  }, [exercise.id, onExerciseRemoved]);

  function addWorkingSet() {
    setSets((prevSets: ExerciseSet[]) => {
      const workingSetCount = prevSets.filter(
        (set: ExerciseSet) => !set.isWarmup,
      ).length;
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
    setSets((prevSets: ExerciseSet[]) => {
      return [
        ...prevSets,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          weight: "",
          reps: "",
          isWarmup: true,
        },
      ];
    });
  }

  function updateSet(
    id: number,
    field: keyof Omit<ExerciseSet, "id">,
    value: string,
  ): void {
    setSets((prevSets: ExerciseSet[]) => {
      const newSets = prevSets.map((set: ExerciseSet) =>
        set.id === id ? { ...set, [field]: value } : set,
      );

      debugDataFlow("Set Update", {
        setId: id,
        field,
        value,
        previousSets: prevSets,
        newSets,
      });

      return newSets;
    });
  }

  function deleteSet(id: number): void {
    if (sets.length <= 1) return;

    const filteredSets = sets.filter((set: ExerciseSet) => set.id !== id);

    const reindexedSets = filteredSets.map(
      (set: ExerciseSet, index: number) => ({
        ...set,
        id: index + 1,
      }),
    );

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
    debugDataFlow("Rest Timer Triggered", {
      setId,
      restTime: routineExercise.restTime,
    });
    onRestTimeTrigger(routineExercise.restTime);
  };

  const handleEdit = () => {
    setState({
      isEditMode: !state.isEditMode,
      isDrawerOpen: false,
    });
  };

  // Compute the current working and warmup sets from your sets state.
  const currentWorkingSets: ExerciseSet[] = sets.filter(
    (set: ExerciseSet) => set.isWarmup === false,
  );
  const currentWarmupSets: ExerciseSet[] = sets.filter(
    (set: ExerciseSet) => set.isWarmup === true,
  );

  // Build the transformed object using properties from routineExercise and the derived sets.
  const transformed = {
    id: nanoid(),
    routineId: routineExercise.routineId,
    exerciseId: routineExercise.exerciseId,
    order: routineExercise.order,
    workingSetWeights: JSON.stringify(
      currentWorkingSets.map((set: ExerciseSet) =>
        handleEmptyValue(set.weight),
      ),
    ),
    warmupSetWeights: JSON.stringify(
      currentWarmupSets.map((set: ExerciseSet) => handleEmptyValue(set.weight)),
    ),
    warmupSets: currentWarmupSets.length,
    warmupReps: handleEmptyValue(currentWarmupSets[0]?.reps) || null,
    workingSets: currentWorkingSets.length,
    workingReps: handleEmptyValue(currentWorkingSets[0]?.reps) || null,
    restTime: 30,
    notes: notes || null,
  };

  return (
    <>
      <Card>
        {/* Exercise Label */}
        <CardHeader>
          <CardTitle className="flex w-full justify-between">
            {exercise.name}

            <Drawer
              open={state.isDrawerOpen}
              onOpenChange={() => setState({ ...state, isDrawerOpen: false })}
            >
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
                    variant={state.isEditMode ? "default" : "secondary"}
                  >
                    {state.isEditMode ? "Update" : "Edit Exercise"}
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
            isEditMode={state.isEditMode}
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
