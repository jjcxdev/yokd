// Create a new file like clean-db.ts
import { db } from "@/lib/db";
import {
  folders,
  routineExercises,
  routines,
  sets,
  users,
  workoutData,
  workoutSessions,
} from "@/lib/db/schema";

async function cleanDb() {
  try {
    // Delete in order of dependencies
    await db.delete(workoutData);
    await db.delete(sets);
    await db.delete(workoutSessions);
    await db.delete(routineExercises);
    await db.delete(routines);
    await db.delete(folders);
    await db.delete(users);

    console.log("Successfully cleaned database");
  } catch (error) {
    console.error("Error cleaning database:", error);
  }
}

cleanDb();
