import { asc } from "drizzle-orm";
import { Suspense } from "react";

import ExerciseList from "@/app/components/ExerciseList";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";

// Separate the data fetching logic from the component
async function getExercises() {
  return await db
    .select()
    .from(exercises)
    .orderBy((exercises) => [asc(exercises.type), asc(exercises.name)]);
}

export default async function Exercise() {
  const data = await getExercises();

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 bg-background">
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-lg bg-accent" />
          </div>
        }
      >
        <ExerciseList initialData={data} />
      </Suspense>
    </div>
  );
}
