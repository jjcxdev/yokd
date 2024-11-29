import { SQL } from "drizzle-orm";

export type ValidType = 'cable' | 'machine' | 'dumbbell';

export interface Exercise{
    id: string,
    name: string,
    muscleGroup:string,
    type:ValidType,
    isCustom:number;
    createdBy: string | null;
    createdAt: number,
}

export interface ExerciseInput {
    id:string,
    planId:string,
    exerciseId:string,
    order:number,
    warmupSets:number,
    warmupReps:number,
    workingReps:number,
    workingSets:number,
    restTime: number,
    notes?: string,
}