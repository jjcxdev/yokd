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
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <ExerciseList initialData={data} />
    </div>
  );
}
