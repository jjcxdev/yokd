"use client";

import { useUser } from "@clerk/nextjs";
import _, { set } from "lodash";
import { nanoid } from "nanoid";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import { GiWeightLiftingUp } from "react-icons/gi";
import { IoAddCircle } from "react-icons/io5";

import { postRoutines } from "@/app/actions/routines";
import ExerciseRoutineCard from "@/app/components/ExerciseRoutineCard";
import SaveHeader from "@/app/components/SaveHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@/lib/db/schema";
import type { ExerciseData, RoutineExercise } from "@/types/types";

function RoutineContent() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const selectedExercisesParam = searchParams.get("selectedExercises");
  const routineNameParam = searchParams.get("routineName");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState<string>(
    routineNameParam || "",
  );
  const [exerciseData, setExerciseData] = useState<
    Record<string, ExerciseData>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Ref to store routineExercise IDs
  const routineExerciseMapRef = useRef<{ [exerciseId: string]: string }>({});

  // Load exercises from localStorage on mount if they exist
  useEffect(() => {
    try {
      const storedExercises = localStorage.getItem("routineExercises");
      if (storedExercises) {
        const parsedExercises = JSON.parse(storedExercises);
        setExercises(parsedExercises);
      }
    } catch (error) {
      console.error("Error loading exercises from local storage:", error);
    }
  }, []);

  // Handle new selected exercises
  useEffect(() => {
    if (!selectedExercisesParam) return;

    try {
      const newExercises: Exercise[] = JSON.parse(
        decodeURIComponent(selectedExercisesParam),
      );

      // Get existing exercises from localStorage first
      let existingExercises: Exercise[] = [];
      try {
        const storedExercises = localStorage.getItem("routineExercises");
        if (storedExercises) {
          existingExercises = JSON.parse(storedExercises);
        }
      } catch (error) {
        console.error("Error loading exercises from local storage:", error);
      }

      // Create a set of existing exercise IDs to avoid duplicates
      const existingIds = new Set(existingExercises.map((e) => e.id));

      // Filter out duplicates from new exercises
      const uniqueNewExercises = newExercises.filter(
        (exercise: Exercise) => !existingIds.has(exercise.id),
      );

      // Combine existing and new exercises
      const combinedExercises = [...existingExercises, ...uniqueNewExercises];

      // Update state and localStorage
      setExercises(combinedExercises);
      localStorage.setItem(
        "routineExercises",
        JSON.stringify(combinedExercises),
      );

      // Assign stable routineExercise IDs
      combinedExercises.forEach((exercise) => {
        if (!routineExerciseMapRef.current[exercise.id]) {
          routineExerciseMapRef.current[exercise.id] = nanoid();
        }
      });

      // Clean up URL after processing
      const currentRoutineName = routineName || routineNameParam;
      if (currentRoutineName) {
        router.replace(
          `/routine?folderId=${folderId}&routineName=${encodeURIComponent(currentRoutineName)}`,
        );
      } else {
        router.replace(`/routine?folderId=${folderId}`);
      }
    } catch (error) {
      console.error("Error parsing selected exercises:", error);
      toast({
        variant: "destructive",
        title: "Error adding exercises",
        description: "Please try again or refresh the page",
      });
    }
  }, [
    selectedExercisesParam,
    router,
    folderId,
    routineName,
    routineNameParam,
    toast,
  ]);

  function handleExerciseUpdate(exerciseId: string, data: ExerciseData) {
    setExerciseData((prev) => {
      // Only update if data has actually changed
      if (JSON.stringify(prev[exerciseId]) === JSON.stringify(data)) {
        return prev;
      }
      return {
        ...prev,
        [exerciseId]: data,
      };
    });
  }

  const memoizedUpdate = useCallback(handleExerciseUpdate, []);

  function handleAddExercise() {
    // Navigate to exercise selection page, preserving folderId and routine name
    const currentRoutineName = routineName || routineNameParam;
    if (currentRoutineName) {
      router.push(
        `/exercise?folderId=${folderId}&routineName=${encodeURIComponent(
          currentRoutineName,
        )}`,
      );
    } else {
      router.push(`/exercise?folderId=${folderId}`);
    }
  }

  function handleRoutineNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    setRoutineName(newName);
    // Update URL with new routine name
    if (newName) {
      router.replace(
        `/routine?folderId=${folderId}&routineName=${encodeURIComponent(newName)}`,
      );
    } else {
      router.replace(`/routine?folderId=${folderId}`);
    }
  }

  function handleSave() {
    if (!routineName || !folderId || !user) return;

    setIsLoading(true);
    toast({
      title: "Saving routine...",
      description: "Please wait while we save your routine",
    });

    // Create an array of exercises with their data
    const exercisesToSave = Object.entries(exerciseData).map(
      ([exerciseId, data]) => {
        console.log("Processing exercise data:", data);
        return {
          exerciseId,
          notes: data.notes,
          sets: data.sets, // Keep the original sets array intact
        };
      },
    );

    console.log("Sending exercises to postRoutines:", exercisesToSave);

    postRoutines({
      name: routineName,
      folderId,
      exercises: exercisesToSave,
      userId: user.id,
    })
      .then((result) => {
        if (result.success) {
          toast({
            title: "Routine saved successfully",
            description: `Created routine "${routineName}" with ${exercisesToSave.length} exercises`,
          });
          setTimeout(() => {
            router.refresh();
            router.push(`/dashboard`);
          }, 500);
        } else {
          throw new Error(result.error);
        }
      })
      .catch((error) => {
        console.error("Error saving routine:", error);
        toast({
          variant: "destructive",
          title: "Failed to save routine",
          description:
            "Please try again. If the problem persists, refresh the page",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    try {
      localStorage.removeItem("routineExercises");
    } catch (error) {
      console.error("Error removing exercises from local storage:", error);
    }
  }

  function handleCancel() {
    try {
      localStorage.removeItem("routineExercises");
    } catch (error) {
      console.error("Error removing exercises from local storage:", error);
    }
    router.push(`/dashboard`);
  }

  function handleExerciseRemoved(exerciseId: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setExerciseData((prev) => {
      const updated = { ...prev };
      delete updated[exerciseId];
      return updated;
    });
    // Remove from localStorage
    const updatedExercises = exercises.filter((ex) => ex.id !== exerciseId);
    localStorage.setItem("routineExercises", JSON.stringify(updatedExercises));
  }

  return (
    <div className="pb-22 flex min-h-full w-full flex-col items-center gap-4">
      <div className="h-full w-full max-w-5xl bg-background">
        <div className="sticky top-0 z-10 flex flex-col">
          <SaveHeader
            title={"Create Routine"}
            button={"Cancel"}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
            disabled={isLoading}
            routineName={routineName}
            exerciseCount={exercises.length}
          />

          <div className="bg-background">
            <form className="p-2">
              <Input
                className="h-10 w-full border-b-2 border-accent/20 bg-background px-4"
                name="routine"
                type="text"
                placeholder="Enter Routine Name"
                value={routineName}
                onChange={handleRoutineNameChange}
              />
            </form>
          </div>
        </div>

        {/* Exercise section */}

        {exercises.length === 0 ? (
          <div className="flex w-full flex-col justify-center p-4">
            <div className="flex justify-center p-4 text-6xl text-dimmed">
              <GiWeightLiftingUp />
            </div>
            <p className="flex justify-center text-dimmed">
              Add exercises to your routine
            </p>
          </div>
        ) : (
          <div className="flex flex-col p-4">
            {exercises.map((exercise, index) => (
              <div
                className="flex w-full justify-center pb-2"
                key={exercise.id}
              >
                <ExerciseRoutineCard
                  key={exercise.id}
                  exercise={exercise}
                  routineExercise={{
                    id: routineExerciseMapRef.current[exercise.id],
                    routineId: "",
                    exerciseId: exercise.id,
                    order: index,
                    workingSetWeights: JSON.stringify([0]),
                    warmupSetWeights: JSON.stringify([]),
                    warmupSets: 0,
                    warmupReps: null,
                    workingSets: 1,
                    workingReps: null,
                    restTime: 90,
                    notes: null,
                  }}
                  onUpdate={(data) => memoizedUpdate(exercise.id, data)}
                  onRestTimeTrigger={() => {}}
                  onExerciseRemoved={handleExerciseRemoved}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex w-full justify-center">
          <div className="flex w-full max-w-72 justify-center pb-32">
            <Button variant="outline" onClick={handleAddExercise}>
              <IoAddCircle />
              Add exercise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoutinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoutineContent />
    </Suspense>
  );
}
