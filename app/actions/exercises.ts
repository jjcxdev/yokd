'use server'

import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"

export async function fetchExercises() {
    const data = await db
    .select()
    .from(exercises)
    .orderBy((exercises) =>[asc(exercises.type), asc(exercises.name)]);
    return data;
}