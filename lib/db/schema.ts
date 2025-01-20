import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const folders = sqliteTable("folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  folderId: text("folder_id")
    .notNull()
    .references(() => folders.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  description: text("description"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

const validTypes = ["machine", "dumbbell", "cable"] as const;
type ValidType = (typeof validTypes)[number];

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: validTypes }).$type<ValidType>().notNull(),
  muscleGroup: text("muscleGroup").notNull(),
  isCustom: integer("is_custom").notNull().default(0),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const routineExercises = sqliteTable("routine_exercises", {
  id: text("id").primaryKey(),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  order: integer("order").notNull(),
  workingSetWeights: text("working_set_weights").notNull().default("[]"),
  warmupSetWeights: text("warmup_set_weights").notNull().default("[]"),
  warmupSets: integer("warmup_sets").notNull().default(0),
  warmupReps: integer("warmup_reps"),
  workingSets: integer("working_sets").notNull().default(0),
  workingReps: integer("working_reps"),
  restTime: integer("rest_time").notNull().default(60),
  notes: text("notes"),
});

export const workoutSessions = sqliteTable("workout_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id),
  status: text("status", { enum: ["active", "completed", "cancelled"] })
    .notNull()
    .default("active"),
  startedAt: integer("started_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer("completed_at"),
});

export const workoutData = sqliteTable(
  "workout_data",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => workoutSessions.id),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    notes: text("notes"),
    sets: text("sets"),
    updatedAt: integer("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sessionExerciseIdx: index("session_exercise_idx").on(
      table.sessionId,
      table.exerciseId,
    ),
    uniqueSessionExercise: uniqueIndex("unique_session_exercise").on(
      table.sessionId,
      table.exerciseId,
    ),
  }),
);

export const sets = sqliteTable("sets", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => workoutSessions.id),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  weight: integer("weight").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  isWarmup: integer("is_warmup").notNull().default(0),
  completedAt: integer("completed_at").notNull(),
});

// Only export the types you commonly need in your app
export type User = typeof users.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export interface RoutineWithExercises extends Routine {
  exercises: Array<{ name: string }>;
}
