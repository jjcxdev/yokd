"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import ActionHeader from "@/app/components/ActionHeader";
import ExerciseCard from "@/app/components/ExerciseCard";
import { useToast } from "@/hooks/use-toast";

import { FREE_WEIGHT_TYPES } from "@/types/types";

import { ExerciseMuscleFilter } from "./ExerciseMuscleFilter";
import { ExerciseSearch } from "./ExerciseSearch";
import { ExerciseTypeFilter } from "./ExerciseTypeFilter";
import { ExerciseListProps } from "@/types/types";

export default function ExerciseList({ initialData }: ExerciseListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const folderId = searchParams.get("folderId");
  const routineName = searchParams.get("routineName");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExerciseType, setSelectedExerciseType] = useState<
    string | null
  >(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(
    null,
  );
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized function to filter exercises based on search term
  const filteredExercises = useMemo(() => {
    return initialData.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMuscleGroup =
        selectedMuscleGroup === null ||
        exercise.muscleGroup === selectedMuscleGroup;
      const matchesExerciseType =
        selectedExerciseType === null ||
        (selectedExerciseType === "Free Weight"
          ? FREE_WEIGHT_TYPES.some(
              (type) => type.toLowerCase() === exercise.type,
            )
          : exercise.type === selectedExerciseType.toLowerCase());

      return matchesSearch && matchesMuscleGroup && matchesExerciseType;
    });
  }, [initialData, searchTerm, selectedMuscleGroup, selectedExerciseType]);

  function handleExerciseToggle(id: string) {
    if (isSubmitting) return;

    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function handleAddExercises() {
    if (isSubmitting) return;

    // Validate exercise selection
    if (selectedExercises.size === 0) {
      toast({
        variant: "destructive",
        title: "No exercises selected",
        description: "Please select at least one exercise",
      });
    }

    setIsSubmitting(true);

    toast({
      title: "Adding exercises...",
      description: "Please wait while we update your routine",
    });

    try {
      // Filter the initalData to get only selected exercises
      const selectedExercisesData = initialData.filter((exercise) =>
        selectedExercises.has(exercise.id),
      );

      // Convert to URL-safe string
      const exercisesParam = encodeURIComponent(
        JSON.stringify(selectedExercisesData),
      );

      // Build URL with all parameters
      let url = `/routine?folderId=${folderId}&selectedExercises=${exercisesParam}`;
      if (routineName) {
        url += `&routineName=${encodeURIComponent(routineName)}`;
      }

      // Navigate back to routine page with selected exercises and routine name
      router.push(url);

      toast({
        title: "Excercises added",
        description: `Added ${selectedExercises.size} exercise${selectedExercises.size !== 1 ? "s" : ""} to routine`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save routine",
        description:
          "Please try again. If the problem persists, refresh the page.",
      });
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (isSubmitting) return;

    // Return to routine page preserving the routine name if it exists
    let url = `/routine?folderId=${folderId}`;
    if (routineName) {
      url += `&routineName=${encodeURIComponent(routineName)}`;
    }
    router.push(url);
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 md:rounded-lg">
      <div className="sticky top-0 z-10 flex">
        <ActionHeader
          title={"Add Exercise"}
          button={"Cancel"}
          count={selectedExercises.size}
          onAction={handleAddExercises}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          routineName={routineName}
        />
      </div>

      {/* Filters & Search */}

      <div className="flex w-full flex-col items-center gap-2 px-4">
        <ExerciseSearch searchTerm={searchTerm} onSearchTerm={setSearchTerm} />

        <div className="flex w-full flex-col items-center gap-2">
          <ExerciseMuscleFilter
            selectedMuscleGroup={selectedMuscleGroup}
            onMuscleGroupChange={setSelectedMuscleGroup}
          />
          <ExerciseTypeFilter
            selectedExerciseType={selectedExerciseType}
            onExerciseTypeChange={setSelectedExerciseType}
          />
        </div>
      </div>

      {/* Exercise list */}
      <div>
        <div className="p-4">
          <ul className="grid grid-cols-1 md:grid-cols-2">
            {filteredExercises.map((exercise) => (
              <li className="" key={exercise.id}>
                <ExerciseCard
                  title={exercise.name}
                  muscleGroup={exercise.muscleGroup}
                  exerciseType={exercise.type}
                  isSelected={selectedExercises.has(exercise.id)}
                  onSelect={() => handleExerciseToggle(exercise.id)}
                  disabled={isSubmitting}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
