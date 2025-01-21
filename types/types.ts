import exp from "constants";
import { ReactNode } from "react";

// -------------------
// Base Types
// -------------------
export type ValidType = "cable" | "machine" | "dumbbell";
export type RoutineStatus = "active" | "archived";
export type SessionStatus = "active" | "completed" | "cancelled";
export const FREE_WEIGHT_TYPES = [
  "dumbbell",
  "barbell",
  "kettlebell",
  "plate",
  "bodyweight",
];

interface Timestamps {
  createdAt: number;
  updatedAt: number;
}

// -------------------
// Core Data Models
// -------------------

export interface User extends Timestamps {
  id: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: ValidType;
  isCustom: number;
  createdBy: string | null;
  createdAt: number;
}

export interface Folder extends Timestamps {
  id: string;
  name: string;
  userId: string;
  description: string | null;
}

export interface Routine extends Timestamps {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  status: "active" | "archived";
  description: string | null;
  exercises: Array<{ name: string }>;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  order: number;
  workingSetWeights: string;
  warmupSetWeights: string;
  warmupSets: number;
  warmupReps: number | null;
  workingReps: number | null;
  workingSets: number;
  restTime: number;
  notes?: string | null;
}

// -------------------
// Set Related
// -------------------
export interface Set {
  id: number;
  weight: string;
  reps: string;
  isWarmup: boolean;
}

export type ExerciseSet = Omit<Set, "id">;

export interface SetWithId extends Set {
  id: number;
}

// DB resprentation of a set
export interface WorkoutSet {
  exerciseId: string;
  isWarmup: number; // db format
  weight: number; // db format
  reps: number; // db format
}

export interface DBSet {
  weight: number;
  reps: number;
  isWarmup: number;
  exerciseId: string;
}

// -------------------
// Exercise Components
// -------------------
export interface ExerciseRoutineCardProps {
  exercise: Exercise;
  routineExercise: RoutineExercise;
  previousData?: {
    notes: string;
    sets: string;
  };
  onUpdate: (exerciseData: ExerciseData) => void;
  onRestTimeTrigger: (restTime: number) => void;
  onExerciseRemoved?:(exerciseId: string) => void;
}

export interface SetListProps {
  sets: Set[];
  updateSet: (id: number, field: keyof Omit<Set, "id">, value: string) => void;
  handleCheckboxChange: (setId: number) => void;
  deleteSet: (id: number) => void;
  showCheckbox?: boolean;
  isEditMode?: boolean;
}

export type ExerciseWithRoutine = {
  exercise: Exercise | null;
  routineExercise: RoutineExercise;
  previousData?: {
    notes: string;
    sets: string;
  };
};

// Data Transfer Types
export type ExerciseData = {
  exerciseId: string;
  notes: string;
  sets: Omit<Set, "id">[];
};

// -------------------
// Session Components
/// -------------------
export interface SessionContextType {
  onRestTimeTrigger: (time: number) => void;
}

export interface SessionClientProps {
  sessionData: {
    exercises: ExerciseWithRoutine[];
    userId: string;
    routineId: string;
    status: SessionStatus;
    startedAt: number;
    completedAt: number | null;
    sessionId: string;
  };
}

interface BaseSessionProps {
  children: ReactNode;
}

export interface SessionLayoutProps extends BaseSessionProps {
  onFinish: () => void;
  onCancel: () => void;
  restTime: number;
  isResting: boolean;
  onRestTimerComplete: () => void;
}
export interface SessionWrapperProps extends BaseSessionProps {
  sessionId: string;
}

// -------------------
// Header Components
// -------------------
interface BaseHeaderProps {
  title?: string;
  button: string;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  routineName?: string | null;
}

export interface ActionHeaderProps extends BaseHeaderProps {
  count?: number;
  onAction?: () => void;
}

export interface SaveHeaderProps extends BaseHeaderProps {
  title: string;
  onSave?: () => void;
  exerciseCount?: number;
}

// -------------------
// Modal Components
// -------------------

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateFolderModalProps extends BaseModalProps {
  onSuccess?: () => void;
}

export interface SelectFolderModalProps extends BaseModalProps {
  folders: Folder[];
}

// -------------------
// Other Components
// -------------------

export interface AuthWrapperProps {
  children: ReactNode;
}

export interface DashboardClientProps {
  initialFolders: Folder[];
  initialRoutines: Routine[];
}

export interface EmptyStateProps {
  onCreateFolder: () => void;
  onCreateRoutine: () => void;
}

export interface ExerciseCardProps {
  title: string;
  muscleGroup: string;
  exerciseType: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export interface ExerciseListProps {
  initialData: Exercise[];
}

export interface FolderListProps {
  folders: Folder[];
  routines?: Routine[];
  onFolderDeleted?: () => void;
}

export interface FolderToggleProps {
  folder: Folder;
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  count?: string;
  deletedFolder?: (folderId: string) => void;
  onClick?: () => void;
  children?: React.ReactNode;
}

export interface RoutineCardProps {
  id: string;
  label: string;
  exercises: Array<{ name: string }>;
  icon?: JSX.Element;
  onDelete?: () => void;
}
