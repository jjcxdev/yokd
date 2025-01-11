// Base Types
export type ValidType = "cable" | "machine" | "dumbbell";

// User Related
export interface User {
  id: string;
  createdAt: number;
  updatedAt: number;
}

// Exercise Related
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: ValidType;
  isCustom: number;
  createdBy: string | null;
  createdAt: number;
}

// Folder Related
export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  description: string | null;
}

export interface Folders extends Folder {} // Consider removing if identical to Folder

// Routine Related
export interface Routine {
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

export interface RoutineWithExercises extends Routine {
  exercises: Array<{ name: string }>;
}

export interface ExerciseInput {
  id: string;
  routineId: string;
  exerciseId: string;
  order: number;
  workingSetWeights: string;
  warmupSetWeights: string;
  warmupSets: number;
  warmupReps: number;
  workingReps: number;
  workingSets: number;
  restTime: number;
  notes?: string;
}

// Set Related
export interface Set {
  id: number;
  weight: string;
  reps: string;
  isWarmup: boolean;
}

export type ExerciseSet = Omit<Set, "id">;

export interface SetListProps {
  sets: Set[];
  updateSet: (id: number, field: keyof Omit<Set, "id">, value: string) => void;
  handleCheckboxChange: (setId: number) => void;
  deleteSet: (id: number) => void;
}

export type WorkoutSet = {
  exerciseId: string;
  weight: number;
  reps: number;
  isWarmup: number;
};

export interface DBSet extends Omit<WorkoutSet, "exerciseId"> {
  exerciseId: string;
}

// Component Props
export interface ExerciseRoutineCardProps {
  exercise: Exercise;
  routineExercise: {
    id: string;
    routineId: string;
    exerciseId: string;
    order: number;
    workingSetWeights: string;
    warmupSets: number;
    warmupReps: number;
    workingSets: number;
    workingReps: number;
    restTime: number;
    notes?: string | null;
  };
  previousData?: {
    notes: string;
    sets: string;
  };
  onUpdate: (exerciseData: ExerciseData) => void;
  onRestTimeTrigger: (restTime: number) => void;
}

export type ExerciseWithRoutine = {
  exercise: Exercise | null;
  routineExercise: ExerciseInput;
  previousData?: {
    notes: string;
    sets: string;
  };
};

// Data Transfer Types
export type ExerciseData = {
  exerciseId: string;
  notes: string;
  sets: ExerciseSet[];
};

export interface SessionClientProps {
  sessionData: {
    exercises: ExerciseWithRoutine[];
    userId: string;
    routineId: string;
    status: "active" | "completed" | "cancelled";
    startedAt: number;
    completedAt: number | null;
    sessionId: string;
  };
}
