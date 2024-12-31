export type ValidType = "cable" | "machine" | "dumbbell";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: ValidType;
  isCustom: number;
  createdBy: string | null;
  createdAt: number;
}

export interface ExerciseInput {
  id: string;
  planId: string;
  exerciseId: string;
  order: number;
  warmupSets: number;
  warmupReps: number;
  workingReps: number;
  workingSets: number;
  restTime: number;
  notes?: string;
}

export interface Folders {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  description: string | null;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  description: string | null;
}

export interface Plan {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "archived";
  description: string | null;
  exercises: { name: string }[];
}

export interface PlanWithExercises extends Plan {
  exercises: Array<{ name: string }>;
}

export interface User {
  id: string;
  createdAt: number;
  updatedAt: number;
}
