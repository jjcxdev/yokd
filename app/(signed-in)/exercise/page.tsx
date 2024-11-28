import ActionHeader from "@/app/components/ActionHeader";
import ExerciseCard from "@/app/components/ExerciseCard";
import SecondaryButton from "@/app/components/SecondaryButton";
import { db } from "@/lib/db";
import { asc } from "drizzle-orm";
import { exercises } from "@/lib/db/schema";

export default async function Exercise() {
  const data = await db
    .select()
    .from(exercises)
    .orderBy((exercises) => [asc(exercises.type), asc(exercises.name)]);

  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <ActionHeader title={"Add Exercise"} button={"Cancel"} />
      <div>
        <div className="p-4">
          <ul>
            {data.map((data) => (
              <li className="pb-4" key={data.id}>
                <ExerciseCard
                  title={data.name}
                  muscleGroup={data.muscleGroup}
                  exerciseType={data.type}
                />
              </li>
            ))}
          </ul>
          <div className="pt-8">
            <SecondaryButton label={`Add exercise`} />
          </div>
        </div>
      </div>
    </div>
  );
}
