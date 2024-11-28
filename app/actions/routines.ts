'use server'

import { db } from "@/lib/db"
import { planExercises } from "@/lib/db/schema";
import { ExerciseInput } from "@/types/exercises";

export async function postRoutines(exercises: ExerciseInput[]) {
    try {
        const data = await db.insert(planExercises).values(exercises)
        return {success:true, data}
    } catch (error) {
        console.error('Error inserting exercises:', error)
        return {success: false, error}
    }
}