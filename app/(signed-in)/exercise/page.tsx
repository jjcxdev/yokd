import { asc } from "drizzle-orm";

import ExerciseList from "@/app/components/ExerciseList";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";

export default async function Exercise() {
  const data = await db
    .select()
    .from(exercises)
    .orderBy((exercises) => [asc(exercises.type), asc(exercises.name)]);

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 bg-background">
      <ExerciseList initialData={data} />
    </div>
  );
}
