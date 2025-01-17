import { asc } from "drizzle-orm";

import ExerciseList from "@/app/components/ExerciseList";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";

// Separate the data fetching logic from the component
async function getExercises() {
  return await db
    .select()
    .from(exercises)
    .orderBy((exercises) => [
      asc(exercises.name),
      asc(exercises.muscleGroup),
      asc(exercises.type),
    ]);
}

export default async function Exercise() {
  const data = await getExercises();

  return (
    <div className="flex min-h-full w-full flex-col items-center gap-4 bg-background pb-20">
      <div className="w-full max-w-5xl">
        <ExerciseList initialData={data} />
      </div>
    </div>
  );
}
