"use client";

import { useUser } from "@clerk/nextjs";
import _, { set } from "lodash";
import { nanoid } from "nanoid";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { GiWeightLiftingUp } from "react-icons/gi";
import { IoAddCircle } from "react-icons/io5";

import { postRoutines } from "@/app/actions/routines";
import ExerciseRoutineCard from "@/app/components/ExceriseRoutineCard";
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

  useEffect(() => {
    // When we recive new selected exercises, add them to our existing exercises
    if (selectedExercisesParam) {
      try {
        const newExercises = JSON.parse(
          decodeURIComponent(selectedExercisesParam),
        );
        setExercises((prevExercises) => {
          // Create a set of existing exercise IDs to avoid duplicates
          const existingIds = new Set(prevExercises.map((e) => e.id));

          // Only add exercises that don't already exist
          const uniqueNewExercises = newExercises.filter(
            (exercise: Exercise) => !existingIds.has(exercise.id),
          );

          return [...prevExercises, ...uniqueNewExercises];
        });

        // Clean up URL after processing but preserve Routine Name
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
    }
  }, [selectedExercisesParam, router, folderId, routineName, routineNameParam]);

  function handleExerciseUpdate(exerciseId: string, data: ExerciseData) {
    setExerciseData((prev) => {
      // Only update if data has actuall changed
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
        `/exercise?folderId=${folderId}&routineName=${encodeURIComponent(currentRoutineName)}`,
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

    // Transform exerciseData into ExerciseInput array
    const exerciseInputs: RoutineExercise[] = Object.entries(exerciseData).map(
      ([_, data], index) => {
        // Debug log for sets
        console.log("Raw exercise data:", data);

        const workingSets = data.sets.filter((set) => !set.isWarmup);
        const warmupSets = data.sets.filter((set) => set.isWarmup);

        console.log("Working sets:", workingSets);
        console.log("Warmup sets:", warmupSets);

        const workingWeights = workingSets.map(
          (set) => parseInt(set.weight) || 0,
        );
        const warmupWeights = warmupSets.map(
          (set) => parseInt(set.weight) || 0,
        );
        console.log("Working weights:", workingWeights);
        console.log("Warmup weights:", warmupWeights);

        console.log(
          "Stringified working weights:",
          JSON.stringify(workingWeights),
        );
        console.log(
          "Stringified warmup weights:",
          JSON.stringify(warmupWeights),
        );

        return {
          id: nanoid(),
          routineId: "",
          exerciseId: data.exerciseId,
          order: index,
          workingSetWeights: JSON.stringify(workingWeights),
          warmupSetWeights: JSON.stringify(warmupWeights),
          workingSets: workingSets.length,
          workingReps: parseInt(workingSets[0]?.reps || "0"),
          warmupSets: warmupSets.length,
          warmupReps: parseInt(warmupSets[0]?.reps || "0"),
          restTime: 30,
          notes: data.notes || undefined,
        };
      },
    );

    postRoutines({
      name: routineName,
      folderId: folderId,
      exercises: exerciseInputs,
      userId: user.id,
    })
      .then((result) => {
        if (result.success) {
          toast({
            title: "Routine saved successfully",
            description: `Created routine "${routineName}" with ${exerciseInputs.length} exercises`,
          });
          // small delay before navigation
          setTimeout(() => {
            router.refresh(); // Force refresh of the page data
            router.push(`/dashboard`);
          }, 500);
        } else {
          // Handle error
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
  }

  function handleCancel() {
    router.push(`/dashboard`);
  }

  return (
    <div className="pb-22 flex min-h-full w-full max-w-3xl flex-col gap-4 bg-background">
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

        <div>
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
          {exercises.map((exercise) => (
            <div className="flex w-full justify-center pb-2" key={exercise.id}>
              <ExerciseRoutineCard
                exercise={exercise}
                routineExercise={{
                  id: "",
                  routineId: "",
                  exerciseId: exercise.id,
                  order: 0,
                  workingSetWeights: "[]",
                  warmupSetWeights: "[]",
                  warmupSets: 0,
                  warmupReps: 0,
                  workingSets: 1,
                  workingReps: 0,
                  restTime: 0,
                  notes: "",
                }}
                onUpdate={(data) => memoizedUpdate(exercise.id, data)}
                onRestTimeTrigger={() => {}}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-72 justify-center pb-8">
          <Button variant="outline" onClick={handleAddExercise}>
            <IoAddCircle />
            Add exercise
          </Button>
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
