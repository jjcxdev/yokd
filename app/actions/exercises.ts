'use server'

import { asc } from "drizzle-orm"

import { db } from "@/lib/db"
import { exercises } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server";

//---------------------------------
// Fetch All Exercises
//---------------------------------

export async function fetchExercises() {
    const data = await db
    .select()
    .from(exercises)
    .orderBy((exercises) =>[asc(exercises.type), asc(exercises.name)]);
    return data;
}